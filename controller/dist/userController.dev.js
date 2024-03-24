"use strict";

// multer sirve para la carga de archivos 
var multer = require('multer');

var sharp = require('sharp');

var User = require('../Model/userModel.js');

var catchAsync = require('../utils/catchAsync.js');

var appError = require('../classController/appError.js');

var factoryFunction = require('./factoryFunctions.js'); // const storage=multer.diskStorage({
//     destination:function (req,file,cb){
//         cb(null,'public/img/users')
//     },
//     filename:function(req,file,cb){
//         const nameImg=`user-${req.user.id}-${Date.now()}.${file.mimetype.split('/')[1]}`
//         cb(null,nameImg)
//     }
// })
// guardamos el el archivo en la memoria en ves del disco


var storage = multer.memoryStorage();

var multerFilter = function multerFilter(req, file, cb) {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new appError('the file must be an image', 404), false);
  }
}; //usa un ibjeto de configuraciones, solo se psao la ruta donde se guardara el archivo


var uploud = multer({
  storage: storage,
  fileFilter: multerFilter
});

function filterObj(bodyObj) {
  for (var _len = arguments.length, fields = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    fields[_key - 1] = arguments[_key];
  }

  var newObj = {}; //objects keys devuelve un arreglo de nombres de las propieddes

  Object.keys(bodyObj).forEach(function (el) {
    if (fields.includes(el)) newObj[el] = bodyObj[el];
  });
  return newObj;
}

exports.updatePhoto = uploud.single("photo");
exports.resizePhoto = catchAsync(function _callee(req, res, next) {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (req.file) {
            _context.next = 2;
            break;
          }

          return _context.abrupt("return", next());

        case 2:
          req.file.fileName = "user-".concat(req.user.id, "-").concat(Date.now(), ".jpeg");
          _context.next = 5;
          return regeneratorRuntime.awrap(sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({
            quality: 90
          }).toFile("public/img/users/".concat(req.file.fileName)));

        case 5:
          next();

        case 6:
        case "end":
          return _context.stop();
      }
    }
  });
}); //actualizar datos del usuario, no datos sensibles

exports.UpdateMe = catchAsync(function _callee2(req, res, next) {
  var newBody, user;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          if (!(req.body.password || req.body.passwordConfirm)) {
            _context2.next = 2;
            break;
          }

          return _context2.abrupt("return", next(new appError('This path is not to update the password, please see /forgotPassword', 400)));

        case 2:
          //quitar los demas campos del body y solo fltrar por estos campos
          newBody = filterObj(req.body, "email", "name");
          if (req.file) newBody.photo = req.file.fileName;
          console.log(req.file);
          console.log(newBody); //actualizamos el documento con el body filtrado y activamos los validadores 
          //new:true es para devolver el neuvo documento actualizado

          _context2.next = 8;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.user.id, newBody, {
            "new": true,
            runValidators: true
          }));

        case 8:
          user = _context2.sent;
          res.status(200).json({
            status: "succes",
            user: user
          });

        case 10:
        case "end":
          return _context2.stop();
      }
    }
  });
}); //en ves de ocultar al usuario solo lo ocultamos 

exports.DeleteMe = catchAsync(function _callee3(req, res, next) {
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(User.findByIdAndUpdate(req.user.id, {
            "new": true,
            active: false
          }));

        case 2:
          res.status(204).json({
            status: "succes",
            data: null
          });

        case 3:
        case "end":
          return _context3.stop();
      }
    }
  });
});

exports.me = function (req, res, next) {
  req.params.id = req.user.id;
  next();
};

exports.getAllUsers = factoryFunction.getDocuments(User);

exports.createUser = function (req, res) {
  res.status(500).json({
    status: 'failed',
    messague: 'server error'
  });
};

exports.showUser = factoryFunction.getOneDocuemnt(User);
exports.updateUser = factoryFunction.updateOne(User);
exports.deleteUser = factoryFunction.deleteOne(User);