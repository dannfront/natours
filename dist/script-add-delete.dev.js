"use strict";

var dotenv = require('dotenv'); //dotenv.config se usa para acceder a la ruta del archivo donde estan las variables de entorno, recibe un objeto de configuracion con la propiedad path y se le pasa la ruta del archivo {path:'ruta del archivo '}


dotenv.config({
  path: './config.env'
});

var fs = require('node:fs');

var Tour = require('./Model/tourModel.js');

var User = require('./Model/userModel.js');

var Review = require('./Model/reviewModel.js');

var connectDB = require('./function_DB.js'); //para acceder a una varible en especial usamos process.env.'nombre de la variable'


var db = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD_DATABASE_ENCODING); //el codigo de la funcion esta en el archivo function_DB.js

connectDB(db);
var toursJson = JSON.parse(fs.readFileSync("".concat(__dirname, "/dev-data/data/tours.json"), 'utf-8'));
var userJson = JSON.parse(fs.readFileSync("".concat(__dirname, "/dev-data/data/users.json"), 'utf-8'));
var reviewJson = JSON.parse(fs.readFileSync("".concat(__dirname, "/dev-data/data/reviews.json"), 'utf-8'));

function addTours() {
  return regeneratorRuntime.async(function addTours$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(Tour.create(toursJson));

        case 3:
          _context.next = 8;
          break;

        case 5:
          _context.prev = 5;
          _context.t0 = _context["catch"](0);
          console.log(_context.t0);

        case 8:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 5]]);
}

function deleteTours() {
  return regeneratorRuntime.async(function deleteTours$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(Tour.deleteMany());

        case 3:
          _context2.next = 8;
          break;

        case 5:
          _context2.prev = 5;
          _context2.t0 = _context2["catch"](0);
          console.log(_context2.t0);

        case 8:
          process.exit();

        case 9:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 5]]);
}

if (process.argv[2] === '--import') {
  addTours();
} else if (process.argv[2] === '--delete') {
  deleteTours();
}