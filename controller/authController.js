const { promisify } = require('node:util')
const crypto = require('node:crypto')
const jwt = require('jsonwebtoken')
const User = require('../Model/userModel.js')
const catchAsync = require('../utils/catchAsync.js')
const appError = require('../classController/appError.js')
const Email = require('../utils/sendEmail.js')
const { log } = require('node:console')


function getJwt(id, expired) {
    //creacion del token espera la firma, palbra secreta y tiempo en expirar
    return jwt.sign({ id }, process.env.JSW_SECRET, {
        expiresIn: expired
    })  
}

function sendToken(user,statusCode,res){
    const token = getJwt(user.id, process.env.JSW_EXPIRES_IN);

    //cookies
    //el primer parametro para crear una cookie es el nombre de la cookie el segundo es lo que guardara la cookie y por ultimo es un objeto de opciones
    const options={
        expires: new Date( Date.now()+process.env.JSW_COOKIE_EXPIRES_IN*24*60*60*1000),
        // // //httpOnly es para que los scripts de lado del cliente no modifique la cookie 
        httpOnly:true,
    }

    //secure es para que la cookie solo se ejecute en solicitudes https
    if(process.env.NODE_ENV==="production") options.secure=true
    res.cookie("jwt",token,options)
    
    user.password=undefined
    
    res.status(statusCode).json({
        status: 'success',
        token,
        user
    });
}


exports.loggingOut=function(req,res){
    res.cookie("jwt","loggout",{
        expires:new Date(Date.now()+5*1000),
        httpOnly:true
    })
    
    res.status(200).json({status:"succes"})
}

exports.login = catchAsync(async function (req, res, next) {

    const { email, password } = req.body
    console.log(email,password);
    //verificar si en el body hay email y password
    if (!email || !password) return next(new appError("please insert email and password", 404))

    // veficar si existe el usuario
    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.correctPasword(password, user.password))) return next(new appError("incorrect password or email", 404))

    sendToken(user,200,res)
})

exports.signUp = catchAsync(async function (req, res, next) {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role
    })
    const url=`${req.protocol}://${req.get('host')}/me`
    await new Email(newUser,url).sendWelcome()
    sendToken(newUser,200,res)
})

// exports.conmfirmEmail = catchAsync(async function (req, res, next) {
//     const userToken=await promisify(jwt.verify)(req.params.token,process.env.JSW_SECRET)

//     if(!userToken) return next(new appError("user not found",400))
//     const user=await User.findById(userToken.id,null,{skipActiveAndEmailVerifiedCheck:true}).select("+emailVerifed")
    

//     user.emailVerifed=true
//     await user.save({validateBeforeSave:false})

//     sendToken(user,200,res)
// })



//middleware para verificar el json webToken
exports.protect = catchAsync(async function (req, res, next) {
    let token
    //verificamos si en los headers se pasa el token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }else if(req.cookies.jwt){
        token=req.cookies.jwt
    }
    //si el token no contie informacion no accedemos a los datos 
    if (!token) return next(new appError('you need to log in to access', 401))

    //verificamos si el token existe 
    //compara token con la palabra secreta
    const decoded = await promisify(jwt.verify)(token, process.env.JSW_SECRET)
    // verificar si el usuario registrado existe
    const userAct = await User.findById(decoded.id)
    if (!userAct) return next(new appError('The user does not exist, please log in', 401))

    // verificar cambio la contraseña
    if (!userAct.changePassword(decoded.iat)) return next(new appError('password changed please log in', 401))

    // guarda la informacion del usuario
    req.user = userAct
    res.locals.user=userAct
    next()
})


//middleware para verificar si el usuario esta logeado
exports.isLoggued = async function (req, res, next) {
    
    if(req.cookies.jwt){

        try {
            //verificamos si el token existe 
            //compara token con la palabra secreta
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JSW_SECRET)
            // verificar si el usuario registrado existe
            const userAct = await User.findById(decoded.id)
            if (!userAct) return next()
    
            // verificar cambio la contraseña
            if (!userAct.changePassword(decoded.iat)) return next()
            
            // guarda la informacion del usuario
            //esto genera una varible que se puede usar dentro de las plnatillas de renderizado
            res.locals.user=userAct
            return next()
            
        } catch (error) {
            
            return next()
        }
    }
    next()
}

//funcion para detectar los roles
exports.restricted = function (...roles) {
    return function (req, res, next) {
        // verifica si hay role dentro del array, 
        if (!roles.includes(req.user.role)) {
            return next(new appError("access denied to normal users", 403));
        }
        next();
    }
}

//funcion para cambiar la contraseña
exports.forgotPassword = catchAsync(async function (req, res, next) {

    const user = await User.findOne({ email: req.body.email })

    if (!user) return next(new appError('This email does not exist, please enter a valid email', 404))

    //obtenemos el token de restablecimiento
    const resetToken = user.createPasswordResetToken()
    //desactivamos los validadores para guardar solo el token 
    await user.save({ validateBeforeSave: false })

    //creamos la url para redirigir cunado se envie el correo
    const restUrl = `${req.protocol}://${req.get('host')}/api/v1/users/ResetPassword/${resetToken}`
    //creacion de mensaje

    try {

        await new Email(user,restUrl).passwordReset()

        res.status(200).json({
            status: 'succes',
            messague: "email send"
        })

    } catch (error) {
        user.paswordResetExpires = undefined
        user.passwordResetToken = undefined
        await user.save({ validateBeforeSave: false })
        return (new appError('Failed to send email', 500))
    }

})

exports.resetPassword = catchAsync(async function (req, res, next) {
    //ecripyamos el token
    const hashToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    //buscamos al usuario por el token y verificamos si la fecha que tiene el documento es menor a la fecha actual
    const user = await User.findOne({ passwordResetToken: hashToken, paswordResetExpires: { $gt: Date.now() } })

    if (!user) return next(new appError("token inavlid o expired", 404))

    // sobrescribimos las propiedades
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.paswordResetExpires = undefined
    user.passwordResetToken = undefined
    // guardamos el documento
    await user.save()

    sendToken(user,200,res)

})

exports.UpdatePassword = catchAsync(async function (req, res, next) {
    // obtenemos al usuario
    const user = await User.findById(req.user.id).select('+password');
    // verificar si la contraseña ingresada es la misma
    if (!(await user.correctPasword(req.body.passwordCurrent, user.password)))
        return next(new appError('invalid password, please re-enter password', 403));

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();  // Aquí está el cambio

    sendToken(user,200,res)
});



