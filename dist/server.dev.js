"use strict";

process.on('uncaughtException', function (err) {
  console.log(err.message, err.name);
  process.exit(1);
});

var dotenv = require('dotenv'); //dotenv.config se usa para acceder a la ruta del archivo donde estan las variables de entorno, recibe un objeto de configuracion con la propiedad path y se le pasa la ruta del archivo {path:'ruta del archivo '}


dotenv.config({
  path: './config.env'
});

var connectDB = require('./function_DB.js');

var app = require('./app.js');

var _require = require('mongoose'),
    mongoose = _require["default"]; //para acceder a una varible en especial usamos process.env.'nombre de la variable'


var db = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD_DATABASE_ENCODING); //el codigo de la funcion esta en el archivo function_DB.js

connectDB(db); // mongoose.connect(db).
//     then(() => console.log('connected to the database'))
//iniciamos el servidor

var port = process.env.PORT || 3000;
var server = app.listen(port, function () {
  return console.log('server iniced');
}); //unhandledRejection rechazos no controlados , cunado no provienen de expres y mongosse
// cuando hay rechazos no controldos el evento unhandledRejection se activa

process.on('unhandledRejection', function (err) {
  console.log(err.message, err.name); // para cerrar el servidar haste que una peticion se resuelva o se procese 

  server.close(function () {
    // process.exit(1) cierra el servior
    process.exit(1);
  });
});