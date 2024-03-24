const mongoose=require('mongoose')
const crypto=require('crypto')
const validator=require('validator')
const bcrypt=require('bcrypt')

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"the name must be mandatory"]
    },
    email:{
        type:String,
        required:[true,"please provide your email"],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,"please provided a valid email"],

    },
    photo:{
        type:String,
        default:'default.jpg'
    },
   
    password:{
        type:String,
        required:[true,"please provided a passwor"],
        minlength:8,
        select:false
    },
    passwordConfirm:{
        type:String,
        validate:{
            validator:function(val){
                return this.password===val
            },
            message:"the password must be the same"
        },
        required:[true,"please confirm your password"]
    },
    passwordChange:Date,
    role:{
        type:String,
        enum:['user','guide','lead-guide','admin'],
        default:'user'
    },
    // el token que se le mandara l usuario para verificar restablecer su contraseña
    passwordResetToken:String,
    //tiempo en que expirara el token
    paswordResetExpires:Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    },
    emailVerifed:{
        type:Boolean,
        default:true,
        select:false
    }
})


userSchema.pre('save', async function(next) {
    // Solo hashea la contraseña si ha sido modificada (o es nueva)
    if (!this.isModified('password')) return next();

    // Hashea la contraseña con un coste de 12
    this.password = await bcrypt.hash(this.password, 12);

    // Elimina el campo passwordConfirm
    this.passwordConfirm = undefined;
    next();
});

// middleware para saber si el documento es nuevo y si a contraseña ha sido modificada
userSchema.pre('save',function(next){
    if(!this.isModified('password')||this.isNew) return next()
    //guardamos la fecha menos dos segundo para que el json web token sea valido 
    this.passwordChange=Date.now()-2000

    next()
})

//metodso que sepuede usar un coleccion de documentos
userSchema.methods.correctPasword=async function(passwordBody,passwordUser){
    return await bcrypt.compare(passwordBody,passwordUser)
}

userSchema.methods.changePassword=async function(JWTtime){
    if(this.passwordChange){
        const changedTimetamp=parseInt(this.passwordChange.getTime()/1000,10)
        return changedTimetamp>JWTtime
    }
    return false
}

userSchema.methods.createPasswordResetToken=function(){

    // generacion de token: token que verificara si es el mismo que el que tiene el usaurio
    const resetToken=crypto.randomBytes(32).toString('hex')

    //encriptamos el token para que sea mas dificil y lo mandamos a la base de datos
    this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex')

    //tiempo maximo para restablecer la contraseña: 10 minutos
    this.paswordResetExpires=Date.now()+10*60*1000

    return resetToken
}

//middleware para no mostrar y no encotar a los usuarios
userSchema.pre(/^find/, function(next) {
    //busacamos  a los usuarios que la propiead sea diferente de false osea true
    if(!this.options.skipActiveAndEmailVerifiedCheck) {
        this.find({emailVerifed:{$ne:false}});
        this.find({active:{$ne:false}});
    }
    next();
});

const User=mongoose.model("User",userSchema)

module.exports=User