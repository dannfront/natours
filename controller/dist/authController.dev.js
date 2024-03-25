"use strict";

var _require = require('node:util'),
    promisify = _require.promisify;

var crypto = require('node:crypto');

var jwt = require('jsonwebtoken');

var User = require('../Model/userModel.js');

var catchAsync = require('../utils/catchAsync.js');

var appError = require('../classController/appError.js');

var Email = require('../utils/sendEmail.js');

var _require2 = require('node:console'),
    log = _require2.log;

function getJwt(id, expired) {
  //creacion del token espera la firma, palbra secreta y tiempo en expirar
  return jwt.sign({
    id: id
  }, process.env.JSW_SECRET, {
    expiresIn: expired
  });
}

function sendToken(user, statusCode, req, res) {
  var token = getJwt(user.id, process.env.JSW_EXPIRES_IN); //cookies
  //el primer parametro para crear una cookie es el nombre de la cookie el segundo es lo que guardara la cookie y por ultimo es un objeto de opciones

  var options = {
    expires: new Date(Date.now() + process.env.JSW_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    // // //httpOnly es para que los scripts de lado del cliente no modifique la cookie 
    httpOnly: true,
    secure: req.secure || req.headers('X-Forwarded-Proto') === 'https'
  };
  res.cookie("jwt", token, options);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token: token,
    user: user
  });
}

exports.loggingOut = function (req, res) {
  res.cookie("jwt", "loggout", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true
  });
  res.status(200).json({
    status: "succes"
  });
};

exports.login = catchAsync(function _callee(req, res, next) {
  var _req$body, email, password, user;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _req$body = req.body, email = _req$body.email, password = _req$body.password;
          console.log(email, password); //verificar si en el body hay email y password

          if (!(!email || !password)) {
            _context.next = 4;
            break;
          }

          return _context.abrupt("return", next(new appError("please insert email and password", 404)));

        case 4:
          _context.next = 6;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }).select('+password'));

        case 6:
          user = _context.sent;
          _context.t0 = !user;

          if (_context.t0) {
            _context.next = 12;
            break;
          }

          _context.next = 11;
          return regeneratorRuntime.awrap(user.correctPasword(password, user.password));

        case 11:
          _context.t0 = !_context.sent;

        case 12:
          if (!_context.t0) {
            _context.next = 14;
            break;
          }

          return _context.abrupt("return", next(new appError("incorrect password or email", 404)));

        case 14:
          sendToken(user, 200, req, res);

        case 15:
        case "end":
          return _context.stop();
      }
    }
  });
});
exports.signUp = catchAsync(function _callee2(req, res, next) {
  var newUser, url;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
            role: req.body.role
          }));

        case 2:
          newUser = _context2.sent;
          url = "".concat(req.protocol, "://").concat(req.get('host'), "/me");
          _context2.next = 6;
          return regeneratorRuntime.awrap(new Email(newUser, url).sendWelcome());

        case 6:
          sendToken(newUser, 200, req, res);

        case 7:
        case "end":
          return _context2.stop();
      }
    }
  });
}); //middleware para verificar el json webToken

exports.protect = catchAsync(function _callee3(req, res, next) {
  var token, decoded, userAct;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          //verificamos si en los headers se pasa el token
          if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
          } else if (req.cookies.jwt) {
            token = req.cookies.jwt;
          } //si el token no contie informacion no accedemos a los datos 


          if (token) {
            _context3.next = 3;
            break;
          }

          return _context3.abrupt("return", next(new appError('you need to log in to access', 401)));

        case 3:
          _context3.next = 5;
          return regeneratorRuntime.awrap(promisify(jwt.verify)(token, process.env.JSW_SECRET));

        case 5:
          decoded = _context3.sent;
          _context3.next = 8;
          return regeneratorRuntime.awrap(User.findById(decoded.id));

        case 8:
          userAct = _context3.sent;

          if (userAct) {
            _context3.next = 11;
            break;
          }

          return _context3.abrupt("return", next(new appError('The user does not exist, please log in', 401)));

        case 11:
          if (userAct.changePassword(decoded.iat)) {
            _context3.next = 13;
            break;
          }

          return _context3.abrupt("return", next(new appError('password changed please log in', 401)));

        case 13:
          // guarda la informacion del usuario
          req.user = userAct;
          res.locals.user = userAct;
          next();

        case 16:
        case "end":
          return _context3.stop();
      }
    }
  });
}); //middleware para verificar si el usuario esta logeado

exports.isLoggued = function _callee4(req, res, next) {
  var decoded, userAct;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          if (!req.cookies.jwt) {
            _context4.next = 19;
            break;
          }

          _context4.prev = 1;
          _context4.next = 4;
          return regeneratorRuntime.awrap(promisify(jwt.verify)(req.cookies.jwt, process.env.JSW_SECRET));

        case 4:
          decoded = _context4.sent;
          _context4.next = 7;
          return regeneratorRuntime.awrap(User.findById(decoded.id));

        case 7:
          userAct = _context4.sent;

          if (userAct) {
            _context4.next = 10;
            break;
          }

          return _context4.abrupt("return", next());

        case 10:
          if (userAct.changePassword(decoded.iat)) {
            _context4.next = 12;
            break;
          }

          return _context4.abrupt("return", next());

        case 12:
          // guarda la informacion del usuario
          //esto genera una varible que se puede usar dentro de las plnatillas de renderizado
          res.locals.user = userAct;
          return _context4.abrupt("return", next());

        case 16:
          _context4.prev = 16;
          _context4.t0 = _context4["catch"](1);
          return _context4.abrupt("return", next());

        case 19:
          next();

        case 20:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[1, 16]]);
}; //funcion para detectar los roles


exports.restricted = function () {
  for (var _len = arguments.length, roles = new Array(_len), _key = 0; _key < _len; _key++) {
    roles[_key] = arguments[_key];
  }

  return function (req, res, next) {
    // verifica si hay role dentro del array, 
    if (!roles.includes(req.user.role)) {
      return next(new appError("access denied to normal users", 403));
    }

    next();
  };
}; //funcion para cambiar la contraseña


exports.forgotPassword = catchAsync(function _callee5(req, res, next) {
  var user, resetToken, restUrl;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return regeneratorRuntime.awrap(User.findOne({
            email: req.body.email
          }));

        case 2:
          user = _context5.sent;

          if (user) {
            _context5.next = 5;
            break;
          }

          return _context5.abrupt("return", next(new appError('This email does not exist, please enter a valid email', 404)));

        case 5:
          //obtenemos el token de restablecimiento
          resetToken = user.createPasswordResetToken(); //desactivamos los validadores para guardar solo el token 

          _context5.next = 8;
          return regeneratorRuntime.awrap(user.save({
            validateBeforeSave: false
          }));

        case 8:
          //creamos la url para redirigir cunado se envie el correo
          restUrl = "".concat(req.protocol, "://").concat(req.get('host'), "/api/v1/users/ResetPassword/").concat(resetToken); //creacion de mensaje

          _context5.prev = 9;
          _context5.next = 12;
          return regeneratorRuntime.awrap(new Email(user, restUrl).passwordReset());

        case 12:
          res.status(200).json({
            status: 'succes',
            messague: "email send"
          });
          _context5.next = 22;
          break;

        case 15:
          _context5.prev = 15;
          _context5.t0 = _context5["catch"](9);
          user.paswordResetExpires = undefined;
          user.passwordResetToken = undefined;
          _context5.next = 21;
          return regeneratorRuntime.awrap(user.save({
            validateBeforeSave: false
          }));

        case 21:
          return _context5.abrupt("return", new appError('Failed to send email', 500));

        case 22:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[9, 15]]);
});
exports.resetPassword = catchAsync(function _callee6(req, res, next) {
  var hashToken, user;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          //ecripyamos el token
          hashToken = crypto.createHash('sha256').update(req.params.token).digest('hex'); //buscamos al usuario por el token y verificamos si la fecha que tiene el documento es menor a la fecha actual

          _context6.next = 3;
          return regeneratorRuntime.awrap(User.findOne({
            passwordResetToken: hashToken,
            paswordResetExpires: {
              $gt: Date.now()
            }
          }));

        case 3:
          user = _context6.sent;

          if (user) {
            _context6.next = 6;
            break;
          }

          return _context6.abrupt("return", next(new appError("token inavlid o expired", 404)));

        case 6:
          // sobrescribimos las propiedades
          user.password = req.body.password;
          user.passwordConfirm = req.body.passwordConfirm;
          user.paswordResetExpires = undefined;
          user.passwordResetToken = undefined; // guardamos el documento

          _context6.next = 12;
          return regeneratorRuntime.awrap(user.save());

        case 12:
          sendToken(user, 200, req, res);

        case 13:
        case "end":
          return _context6.stop();
      }
    }
  });
});
exports.UpdatePassword = catchAsync(function _callee7(req, res, next) {
  var user;
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.next = 2;
          return regeneratorRuntime.awrap(User.findById(req.user.id).select('+password'));

        case 2:
          user = _context7.sent;
          _context7.next = 5;
          return regeneratorRuntime.awrap(user.correctPasword(req.body.passwordCurrent, user.password));

        case 5:
          if (_context7.sent) {
            _context7.next = 7;
            break;
          }

          return _context7.abrupt("return", next(new appError('invalid password, please re-enter password', 403)));

        case 7:
          user.password = req.body.password;
          user.passwordConfirm = req.body.passwordConfirm;
          _context7.next = 11;
          return regeneratorRuntime.awrap(user.save());

        case 11:
          // Aquí está el cambio
          sendToken(user, 200, req, res);

        case 12:
        case "end":
          return _context7.stop();
      }
    }
  });
});