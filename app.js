const express = require('express')
const path = require("path")
const cors=require('cors')
//libreria para limitar el numero de reuest
const { rateLimit } = require('express-rate-limit')
//libreria para poner encabezados de seguridad
const helmet = require('helmet')
//libreria para sanitizar los datos del body
const mongoSanitize = require('express-mongo-sanitize');
const xss = require("xss-clean");
const hpp = require('hpp')
//utilizamos cookieParser para poder acceder a las cookies 
const cookieParser=require('cookie-parser')
const morgan = require('morgan')
const appError = require('./classController/appError.js')
const tourRouter = require('./routers/tourRouters.js')
const userRouter = require('./routers/userRouters.js')
const reviewRouter = require('./routers/reviewRouter.js')
const viewRoute = require('./routers/viewRouter.js')
const stripeRouter=require('./routers/stripeRouter.js')
const globalErrorHandeler = require('./controller/errorController.js')
const compression=require('compression')




const app = express()
app.use(cors({
    origin: 'http://localhost:3000',
}));
app.set('trust proxy',1)
//implementamos el middleware
app.use(cookieParser())
//le dice a express que usar el motor de plantillas pug para renderizar las plantillas
app.set('view engine', 'pug')
//el primer arguemnto es la calve de la configuracion en este caso es la configuracion "views" el segundo es ruta donde estan las rutas de las plantillas
//path join es un metodo que une todas las rutas por / dependiendo el sisrema operativo 
app.set('views', path.join(__dirname, 'views'))

const limiter = rateLimit({
    //limite de request
    limit: 100,
    //request por tiempo en milisegundos
    windowMs: 60 * 60 * 100,
    //ocultamos el headerd de que contiene informacion sobre el num de solicitudes y el timepo
    legacyHeaders: false,
    //mensaje 
    message: 'number of requests reached'
})

//middlewares
// app.use(helmet())//protege las aplicaciones Express mediante la configuración de encabezados de respuesta HTTP.
// app.use(limiter)//usamos el middleware de request por hora
app.use(express.json())
app.use(mongoSanitize())//middleware para santizar los datos del body
app.use(xss())
app.use(hpp({
    whitelist: [
        "duration",
        "ratingsQuantity",
        "ratingsAverage",
        "maxGroupSize",
        "difficulty",
        "price",
    ]
}))

// app.use(morgan('dev'))
app.use((req,res,next)=>{
    // asi podemos acceder a las cookies por el modulo de cookie parser
    console.log(req.cookies) 
    next()
})


//cons esto podemos servir archivos estaticos como hrml imagenes y css
// app.use(express.static(`${__dirname}/public`))
app.use(express.static(path.join(__dirname, "public")))


// Set security HTTP headers https://github.com/helmetjs/helmet
app.use(
    helmet({ crossOriginResourcePolicy: false, crossOriginEmbedderPolicy: false })
);

// Further HELMET configuration for Security Policy (CSP)
const scriptSrcUrls = ['https://unpkg.com/', 'https://tile.openstreetmap.org','https://js.stripe.com'];
const styleSrcUrls = [
    'https://unpkg.com/',
    'https://tile.openstreetmap.org',
    'https://fonts.googleapis.com/',
    
];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];
const frameSrcUrls = ['https://js.stripe.com']; // Add this line

//set security http headers
const connectSrcUrls = ['https://unpkg.com', 'https://tile.openstreetmap.org', 'http://127.0.0.1:3000','http://localhost:3000'];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            baseUri: ["'self'"],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'self'", 'https://*.cloudflare.com', ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", 'https:', ...styleSrcUrls],
            workerSrc: ["'self'", 'blob:'],
            objectSrc: ["'none'"],
            imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
            fontSrc: ["'self'", 'https:', 'data:', ...fontSrcUrls],
            frameSrc: ["'self'", ...frameSrcUrls], // Add this line
            upgradeInsecureRequests: [],
        },
    })
);
app.use(compression())
//usamos el middleware para ver las rutas antes de que lleguen al servidor
app.use('/', viewRoute)
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/bookings',stripeRouter)

//middleware para manejar los eerores de rutas
//.all se usa para todos los verbos http como oargumento se le psasa la ruta, el asterisco especifica que es para todas la que no coincidan
app.all('*', (req, res, next) => {
    // res.status(400).json({
    //     status:'failed',
    //     messague:"route not found"
    // })

    // // creamos nuestros propios errores con el objeto nativo de js
    // const err=new Error(`Can´t find ${req.originalUrl} on this server`)
    // //propiedades creadas para el err, con ellas accedemos al middleware global de manejo de errores
    // err.statusCode=404
    // err.status='failed'


    // en este a la funcion next se le pasa el objeto de error es lo unico que acepta 
    next(new appError(`Can´t find ${req.originalUrl} on this server`, 404))
    //creamos una clase para manejar los errores al constructor se le pasa el mensaje y el codigo de estado
})

//middleware global de manejo de errores
app.use(globalErrorHandeler)//funcion global para manejar errores


module.exports = app