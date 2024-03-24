// multer sirve para la carga de archivos 
const multer=require('multer')
const sharp = require('sharp')
const User = require('../Model/userModel.js')
const catchAsync = require('../utils/catchAsync.js')
const appError = require('../classController/appError.js')
const factoryFunction=require('./factoryFunctions.js')


// const storage=multer.diskStorage({
//     destination:function (req,file,cb){
//         cb(null,'public/img/users')
//     },
//     filename:function(req,file,cb){
//         const nameImg=`user-${req.user.id}-${Date.now()}.${file.mimetype.split('/')[1]}`
//         cb(null,nameImg)
//     }
// })

// guardamos el el archivo en la memoria en ves del disco
const storage=multer.memoryStorage()

const multerFilter=function (req,file,cb){
    if(file.mimetype.startsWith('image')){
        cb(null,true)
    }else{
        cb(new appError('the file must be an image',404),false)
    }

}

//usa un ibjeto de configuraciones, solo se psao la ruta donde se guardara el archivo
const uploud=multer({
    storage,
    fileFilter:multerFilter

})


function filterObj(bodyObj,...fields){
    let newObj={}
    //objects keys devuelve un arreglo de nombres de las propieddes
    Object.keys(bodyObj).forEach(el=>{
        if(fields.includes(el)) newObj[el]=bodyObj[el]
    })

    return newObj
}

exports.updatePhoto = uploud.single("photo")

exports.resizePhoto= catchAsync( async function(req,res,next){
    if(!req.file) return next()
    req.file.fileName=`user-${req.user.id}-${Date.now()}.jpeg`
    await sharp(req.file.buffer).resize(500,500).toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/users/${req.file.fileName}`)
    next()
})

//actualizar datos del usuario, no datos sensibles
exports.UpdateMe=catchAsync(async function(req,res,next){
    //buscamos no esxiste en el body un campo llamdo password o passwordConfrim
    if(req.body.password || req.body.passwordConfirm) return next(new appError('This path is not to update the password, please see /forgotPassword',400))
    //quitar los demas campos del body y solo fltrar por estos campos
    const newBody=filterObj(req.body,"email","name")
    if(req.file) newBody.photo=req.file.fileName
    //actualizamos el documento con el body filtrado y activamos los validadores 
    //new:true es para devolver el neuvo documento actualizado
    const user = await User.findByIdAndUpdate(req.user.id,newBody,{new:true,runValidators:true})

    res.status(200).json({
        status:"succes",
        user
    })

})

//en ves de ocultar al usuario solo lo ocultamos 
exports.DeleteMe=catchAsync(async function(req,res,next){
    // la propieadad active al actualizamos a false
    await User.findByIdAndUpdate(req.user.id,{new:true,active:false})
    res.status(204).json({
        status:"succes",
        data:null
    })
})

exports.me=function(req,res,next) {
    req.params.id=req.user.id
    next()
}

exports.getAllUsers=factoryFunction.getDocuments(User)

exports.createUser=function(req, res) {
    res.status(500).json({
        status: 'failed',
        messague:'server error'
    })
}
exports.showUser=factoryFunction.getOneDocuemnt(User)
exports.updateUser=factoryFunction.updateOne(User)
exports.deleteUser=factoryFunction.deleteOne(User)