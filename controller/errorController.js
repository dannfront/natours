const { Long } = require('mongodb')
const appError = require('../classController/appError.js')



function sendErrorDev(err,req,res) {
    if (req.originalUrl.startsWith("/api")) {

        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        })
    }

   return res.status(err.statusCode).render("error",{
        title:"error",
        msg:err.message
    })
}

// errores de produccion
function sendErrorProd(err,req,res) {

    if(req.originalUrl.startsWith("/api")){

        // error dirigido al clinte cuando se conoce
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            })
        }
        //errores de programacion que el cliente no puede ver    
        return res.status(500).json({
            status: err.status,
            message: 'unexpected failure'
        })
    }
    if (err.isOperational) {
        console.log(err.message);
        return res.status(err.statusCode).render("error",{
            title:"error",
            msg: err.message
        })
    }
    //errores de programacion que el cliente no puede ver    
    return res.status(err.statusCode).render("error",{
        title:"error",
        msg:"error"
    })


}


function handleCasterError(error) {
    const message = `invalid ${error.path}: ${error.value}`
    return new appError(message, 404)
}

function handleValidation(error) {
    const message = error.message
    return new appError(message, 404)
}

const JsonWebTokenError = () => new appError('invalid token, please login', 401)
const TokenExpiredError = () => new appError('expired token, please login', 401)

//validar errores si provienen del desarrollo o produccion

function globalErrorHandeler(err, req, res, next) {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err,req,res)
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err, name: err.name, message: err.message }

        //funciones dependiendo el error
        if (error.name === 'CastError') error = handleCasterError(error)
        // if(error.name==='CastError') error=handleCasterError(error)
        if (error.name === 'ValidationError') error = handleValidation(error)
        if (error.name === 'JsonWebTokenError') error = JsonWebTokenError()
        if (error.name === 'TokenExpiredError') error = TokenExpiredError()

        // console.log(error.message);
        // console.log(err.message);
        sendErrorProd(err,req,res)
    }
    next()
}

module.exports = globalErrorHandeler