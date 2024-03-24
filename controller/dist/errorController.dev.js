"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _require = require('mongodb'),
    Long = _require.Long;

var appError = require('../classController/appError.js');

function sendErrorDev(err, req, res) {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  return res.status(err.statusCode).render("error", {
    title: "error",
    msg: err.message
  });
} // errores de produccion


function sendErrorProd(err, req, res) {
  if (req.originalUrl.startsWith("/api")) {
    // error dirigido al clinte cuando se conoce
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } //errores de programacion que el cliente no puede ver    


    return res.status(500).json({
      status: err.status,
      message: 'unexpected failure'
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "error",
      msg: err.message
    });
  } //errores de programacion que el cliente no puede ver    


  return res.status(err.statusCode).render("error", {
    title: "error",
    msg: "error"
  });
}

function handleCasterError(error) {
  var message = "invalid ".concat(error.path, ": ").concat(error.value);
  return new appError(message, 404);
}

function handleValidation(error) {
  var message = error.message;
  return new appError(message, 404);
}

var JsonWebTokenError = function JsonWebTokenError() {
  return new appError('invalid token, please login', 401);
};

var TokenExpiredError = function TokenExpiredError() {
  return new appError('expired token, please login', 401);
}; //validar errores si provienen del desarrollo o produccion


function globalErrorHandeler(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    var error = _objectSpread({}, err, {
      name: err.name,
      message: err.message
    }); //funciones dependiendo el error


    if (error.name === 'CastError') error = handleCasterError(error); // if(error.name==='CastError') error=handleCasterError(error)

    if (error.name === 'ValidationError') error = handleValidation(error);
    if (error.name === 'JsonWebTokenError') error = JsonWebTokenError();
    if (error.name === 'TokenExpiredError') error = TokenExpiredError(); // console.log(error.message);
    // console.log(err.message);

    sendErrorProd(err, req, res);
  }

  next();
}

module.exports = globalErrorHandeler;