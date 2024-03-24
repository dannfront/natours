"use strict";

var mongoose = require('mongoose');

var crypto = require('crypto');

var validator = require('validator');

var bcrypt = require('bcrypt');

var userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "the name must be mandatory"]
  },
  email: {
    type: String,
    required: [true, "please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "please provided a valid email"]
  },
  photo: {
    type: String,
    "default": 'default.jpg'
  },
  password: {
    type: String,
    required: [true, "please provided a passwor"],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    validate: {
      validator: function validator(val) {
        return this.password === val;
      },
      message: "the password must be the same"
    },
    required: [true, "please confirm your password"]
  },
  passwordChange: Date,
  role: {
    type: String,
    "enum": ['user', 'guide', 'lead-guide', 'admin'],
    "default": 'user'
  },
  // el token que se le mandara l usuario para verificar restablecer su contraseña
  passwordResetToken: String,
  //tiempo en que expirara el token
  paswordResetExpires: Date,
  active: {
    type: Boolean,
    "default": true,
    select: false
  },
  emailVerifed: {
    type: Boolean,
    "default": true,
    select: false
  }
});
userSchema.pre('save', function _callee(next) {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (this.isModified('password')) {
            _context.next = 2;
            break;
          }

          return _context.abrupt("return", next());

        case 2:
          _context.next = 4;
          return regeneratorRuntime.awrap(bcrypt.hash(this.password, 12));

        case 4:
          this.password = _context.sent;
          // Elimina el campo passwordConfirm
          this.passwordConfirm = undefined;
          next();

        case 7:
        case "end":
          return _context.stop();
      }
    }
  }, null, this);
}); // middleware para saber si el documento es nuevo y si a contraseña ha sido modificada

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next(); //guardamos la fecha menos dos segundo para que el json web token sea valido 

  this.passwordChange = Date.now() - 2000;
  next();
}); //metodso que sepuede usar un coleccion de documentos

userSchema.methods.correctPasword = function _callee2(passwordBody, passwordUser) {
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(bcrypt.compare(passwordBody, passwordUser));

        case 2:
          return _context2.abrupt("return", _context2.sent);

        case 3:
        case "end":
          return _context2.stop();
      }
    }
  });
};

userSchema.methods.changePassword = function _callee3(JWTtime) {
  var changedTimetamp;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          if (!this.passwordChange) {
            _context3.next = 3;
            break;
          }

          changedTimetamp = parseInt(this.passwordChange.getTime() / 1000, 10);
          return _context3.abrupt("return", changedTimetamp > JWTtime);

        case 3:
          return _context3.abrupt("return", false);

        case 4:
        case "end":
          return _context3.stop();
      }
    }
  }, null, this);
};

userSchema.methods.createPasswordResetToken = function () {
  // generacion de token: token que verificara si es el mismo que el que tiene el usaurio
  var resetToken = crypto.randomBytes(32).toString('hex'); //encriptamos el token para que sea mas dificil y lo mandamos a la base de datos

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex'); //tiempo maximo para restablecer la contraseña: 10 minutos

  this.paswordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
}; //middleware para no mostrar y no encotar a los usuarios


userSchema.pre(/^find/, function (next) {
  //busacamos  a los usuarios que la propiead sea diferente de false osea true
  if (!this.options.skipActiveAndEmailVerifiedCheck) {
    this.find({
      emailVerifed: {
        $ne: false
      }
    });
    this.find({
      active: {
        $ne: false
      }
    });
  }

  next();
});
var User = mongoose.model("User", userSchema);
module.exports = User;