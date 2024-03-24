"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// multer sirve para la carga de archivos 
var multer = require('multer');

var sharp = require('sharp');

var Tour = require('./../Model/tourModel.js'); // const ApiFetureds = require('../classController/apiFetureds.js')


var catchAsync = require('../utils/catchAsync.js');

var appError = require('../classController/appError.js');

var factoryFunction = require('./factoryFunctions.js'); // const Review = require('../Model/reviewModel.js');
// const multerStorage = multer.memoryStorage();


var multerStorage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, 'public/img/tours');
  },
  filename: function filename(req, file, cb) {
    var nameImg = "user-".concat(req.user.id, "-").concat(Date.now(), ".").concat(file.mimetype.split('/')[1]);
    cb(null, nameImg);
  }
});

var multerFilter = function multerFilter(req, file, cb) {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

var upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
exports.uploadTourImages = upload.fields([{
  name: 'imageCover',
  maxCount: 1
}, {
  name: 'images',
  maxCount: 3
}]); // upload.single('image') req.file
// upload.array('images', 5) req.files

exports.resizeTourImages = catchAsync(function _callee2(req, res, next) {
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          if (!(!req.files.imageCover || !req.files.images)) {
            _context2.next = 2;
            break;
          }

          return _context2.abrupt("return", next());

        case 2:
          // 1) Cover image
          req.body.imageCover = "tour-".concat(req.params.id, "-").concat(Date.now(), "-cover.jpeg");
          _context2.next = 5;
          return regeneratorRuntime.awrap(sharp(req.files.imageCover[0]).resize(2000, 1333).toFormat('jpeg').jpeg({
            quality: 90
          }).toFile("public/img/tours/".concat(req.body.imageCover)));

        case 5:
          // 2) Images
          req.body.images = [];
          _context2.next = 8;
          return regeneratorRuntime.awrap(Promise.all(req.files.images.map(function _callee(file, i) {
            var filename;
            return regeneratorRuntime.async(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    filename = "tour-".concat(req.params.id, "-").concat(Date.now(), "-").concat(i + 1, ".jpeg");
                    _context.next = 3;
                    return regeneratorRuntime.awrap(sharp(file).resize(2000, 1333).toFormat('jpeg').jpeg({
                      quality: 90
                    }).toFile("public/img/tours/".concat(filename)));

                  case 3:
                    req.body.images.push(filename);

                  case 4:
                  case "end":
                    return _context.stop();
                }
              }
            });
          })));

        case 8:
          next();

        case 9:
        case "end":
          return _context2.stop();
      }
    }
  });
});

exports.bestTours = function _callee3(req, res, next) {
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          //127.0.0.1:3000/api/v1/tours?page=1&limit=5&fields=name,difficulty,ratingAverage,summary,description,price&sort=-ratingAverage,-price
          req.query.fields = "name,ratingAverage,summary,description,price";
          req.query.sort = "-ratingAverage,-price";
          req.query.limit = "5";
          next();

        case 4:
        case "end":
          return _context3.stop();
      }
    }
  });
}; ////// pipiline


exports.toursStats = catchAsync(function _callee4(req, res, next) {
  var stats;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(Tour.aggregate([{
            $match: {
              ratingAverage: {
                $gte: 4.5
              }
            }
          }, {
            $group: {
              _id: '$difficulty',
              numTours: {
                $sum: 1
              },
              averagePrice: {
                $avg: '$price'
              },
              minPrice: {
                $min: '$price'
              },
              maxPrice: {
                $max: '$price'
              }
            }
          }, {
            $sort: {
              averagePrice: 1
            }
          }]));

        case 2:
          stats = _context4.sent;
          res.status(200).json({
            status: "succes",
            data: {
              stats: stats
            }
          });

        case 4:
        case "end":
          return _context4.stop();
      }
    }
  });
}); //funcion en utils

exports.toursPerYear = catchAsync(function _callee5(req, res, next) {
  var plan;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return regeneratorRuntime.awrap(Tour.aggregate([{
            $unwind: '$startDates'
          }, {
            $match: {
              startDates: {
                $gte: new Date("".concat(+req.params.year, "-01-01")),
                $lte: new Date("".concat(+req.params.year, "-12-31"))
              }
            }
          }, {
            $group: {
              _id: {
                $month: '$startDates'
              },
              numToursMonth: {
                $sum: 1
              },
              tours: {
                $push: '$name'
              }
            }
          }, {
            $addFields: {
              month: '$_id'
            }
          }, {
            $project: {
              _id: 0
            }
          }, {
            $sort: {
              month: 1
            }
          }]));

        case 2:
          plan = _context5.sent;
          res.status(200).json({
            status: "succes",
            data: {
              plan: plan
            }
          });

        case 4:
        case "end":
          return _context5.stop();
      }
    }
  });
});
exports.getToursWithin = catchAsync(function _callee6(req, res, next) {
  var _req$params, distance, latlng, unit, _latlng$split, _latlng$split2, lat, lng, radius, tours;

  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _req$params = req.params, distance = _req$params.distance, latlng = _req$params.latlng, unit = _req$params.unit;
          _latlng$split = latlng.split(","), _latlng$split2 = _slicedToArray(_latlng$split, 2), lat = _latlng$split2[0], lng = _latlng$split2[1];
          radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

          if (!(!lat || !lng)) {
            _context6.next = 5;
            break;
          }

          return _context6.abrupt("return", next(new appError("please provided latitur al longitude in the format: lat,lng")));

        case 5:
          _context6.next = 7;
          return regeneratorRuntime.awrap(Tour.find({
            startLocation: {
              $geoWithin: {
                $centerSphere: [[lng, lat], radius]
              }
            }
          }));

        case 7:
          tours = _context6.sent;
          res.status(200).json({
            message: "succes",
            results: tours.length,
            data: tours
          });

        case 9:
        case "end":
          return _context6.stop();
      }
    }
  });
});
exports.getDistances = catchAsync(function _callee7(req, res, next) {
  var _req$params2, latlng, unit, _latlng$split3, _latlng$split4, lat, lng, multiplier, distances;

  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _req$params2 = req.params, latlng = _req$params2.latlng, unit = _req$params2.unit;
          _latlng$split3 = latlng.split(","), _latlng$split4 = _slicedToArray(_latlng$split3, 2), lat = _latlng$split4[0], lng = _latlng$split4[1];
          multiplier = unit === 'mi' ? 0.000621371 : 0.001;

          if (!(!lat || !lng)) {
            _context7.next = 5;
            break;
          }

          return _context7.abrupt("return", next(new appError("please provided latitur al longitude in the format: lat,lng")));

        case 5:
          _context7.next = 7;
          return regeneratorRuntime.awrap(Tour.aggregate([{
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [lng * 1, lat * 1]
              },
              distanceField: "distance",
              distanceMultiplier: multiplier
            }
          }, {
            $project: {
              distance: 1,
              name: 1
            }
          }]));

        case 7:
          distances = _context7.sent;
          res.status(200).json({
            message: "succes",
            results: distances.length,
            data: distances
          });

        case 9:
        case "end":
          return _context7.stop();
      }
    }
  });
}); //funcion en utils

exports.getAllTours = factoryFunction.getDocuments(Tour); //funcion en utils

exports.createTour = factoryFunction.createOne(Tour); //funcion en utils

exports.showTour = factoryFunction.getOneDocuemnt(Tour, {
  path: "reviews"
}); //funcion en utils

exports.updateTour = factoryFunction.updateOne(Tour); //funcion en utils

exports.deleteTour = factoryFunction.deleteOne(Tour);