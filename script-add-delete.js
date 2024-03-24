const dotenv = require('dotenv')
//dotenv.config se usa para acceder a la ruta del archivo donde estan las variables de entorno, recibe un objeto de configuracion con la propiedad path y se le pasa la ruta del archivo {path:'ruta del archivo '}
dotenv.config({ path: './config.env' })
const fs=require('node:fs')
const Tour=require('./Model/tourModel.js')
const User=require('./Model/userModel.js')
const Review=require('./Model/reviewModel.js')
const connectDB = require('./function_DB.js')
//para acceder a una varible en especial usamos process.env.'nombre de la variable'
const db = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD_DATABASE_ENCODING)

//el codigo de la funcion esta en el archivo function_DB.js
connectDB(db)
const toursJson=JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours.json`,'utf-8'))
const userJson=JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/users.json`,'utf-8'))
const reviewJson=JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/reviews.json`,'utf-8'))

async function addTours(){
    try {
        await Tour.create(toursJson)
    } catch (error) {
        console.log(error);
    }
}
async function deleteTours(){
    try {
        await Tour.deleteMany()
    } catch (error) {
        console.log(error);
    }
    process.exit()
}

if(process.argv[2]==='--import'){
    addTours()
}else if(process.argv[2]==='--delete'){
    deleteTours()
}
