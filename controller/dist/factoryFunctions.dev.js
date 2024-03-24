"use strict";

var catchAsync = require('./../utils/catchAsync.js');

var appError = require('./../classController/appError.js');

var ApiFetureds = require('./../classController/apiFetureds.js');

var _require = require('../Model/userModel.js'),
    populate = _require.populate;

exports.deleteOne = function (Model) {
  return catchAsync(function _callee(req, res, next) {
    var doc;
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return regeneratorRuntime.awrap(Model.findByIdAndDelete(req.params.id));

          case 2:
            doc = _context.sent;

            if (doc) {
              _context.next = 5;
              break;
            }

            return _context.abrupt("return", next(new appError("no document contains this identification: ".concat(req.params.id), 404)));

          case 5:
            res.status(200).json({
              status: 'succes',
              messague: "document delete"
            });

          case 6:
          case "end":
            return _context.stop();
        }
      }
    });
  });
};

exports.updateOne = function (Model) {
  return catchAsync(function _callee2(req, res, next) {
    var doc;
    return regeneratorRuntime.async(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return regeneratorRuntime.awrap(Model.findByIdAndUpdate(req.params.id, req.body, {
              "new": true,
              runValidators: true
            }));

          case 2:
            doc = _context2.sent;

            if (Model) {
              _context2.next = 5;
              break;
            }

            return _context2.abrupt("return", next(new appError("no document contains this identification: ".concat(req.params.id), 404)));

          case 5:
            res.status(200).json({
              status: 'succes',
              messague: 'updating data....'
            });

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    });
  });
};

exports.createOne = function (Model) {
  return catchAsync(function _callee3(req, res, next) {
    var doc;
    return regeneratorRuntime.async(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return regeneratorRuntime.awrap(Model.create(req.body));

          case 2:
            doc = _context3.sent;
            res.status(201).json({
              status: 'success',
              data: {
                Document: doc
              }
            });

          case 4:
          case "end":
            return _context3.stop();
        }
      }
    });
  });
};

exports.getDocuments = function (Model) {
  return catchAsync(function _callee4(req, res, next) {
    var filter, features, docs;
    return regeneratorRuntime.async(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            filter = {};
            if (req.params.tourId) filter = {
              refTour: req.params.tourId
            };
            features = new ApiFetureds(Model.find(filter), req.query).filterUrl().sorted().filterDoc().pagination();
            _context4.next = 5;
            return regeneratorRuntime.awrap(features.query);

          case 5:
            docs = _context4.sent;
            res.status(200).json({
              status: 'succes',
              documents: docs.lenght,
              data: {
                data: docs
              }
            });

          case 7:
          case "end":
            return _context4.stop();
        }
      }
    });
  });
};

exports.getOneDocuemnt = function (Model, populate) {
  return catchAsync(function _callee5(req, res, next) {
    var query, doc;
    return regeneratorRuntime.async(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            query = Model.findById(req.params.id);
            if (populate) query = query.populate(populate); // para acceder a los para metros de la request se usa req.params, eso dara los valores de los parametros

            _context5.next = 4;
            return regeneratorRuntime.awrap(query);

          case 4:
            doc = _context5.sent;

            if (doc) {
              _context5.next = 7;
              break;
            }

            return _context5.abrupt("return", next(new appError("no document contains this identification: ".concat(req.params.id), 404)));

          case 7:
            res.status(200).json({
              status: 'succes',
              saludo: req.requestSaludo,
              data: {
                data: doc
              }
            });

          case 8:
          case "end":
            return _context5.stop();
        }
      }
    });
  });
};