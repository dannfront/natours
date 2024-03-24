const moongose=require('mongoose')

async function connectDB(url_db){
    try {
        //moongose.connect(db) es una promesa como argumentos recibe la conecion a la base de datos
        await moongose.connect(url_db)
        console.log('connected to the database');
    } catch (error) {
        console.log(error.messague);
    }
}

module.exports=connectDB