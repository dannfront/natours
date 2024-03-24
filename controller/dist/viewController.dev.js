"use strict";

var Tour = require("./../Model/tourModel.js");

var Booking = require("./../Model/bookingModel.js");

var catchAsync = require("./../utils/catchAsync.js");

var appError = require('../classController/appError.js');

exports.overview = catchAsync(function _callee(req, res, next) {
  var tours;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(Tour.find());

        case 2:
          tours = _context.sent;
          console.log(req.originalUrl);
          res.status(200).render("overview", {
            tours: tours
          });

        case 5:
        case "end":
          return _context.stop();
      }
    }
  });
});
exports.myBookings = catchAsync(function _callee2(req, res, next) {
  var bookings, tourId, tours;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(Booking.find({
            user: req.user.id
          }));

        case 2:
          bookings = _context2.sent;
          //obtenemos todos los tour
          tourId = bookings.map(function (el) {
            return el.tour;
          }); //encontrat los tour por el id in significa que busque todos los documentos que constengan las id que esten en el arreglo de tourId

          _context2.next = 6;
          return regeneratorRuntime.awrap(Tour.find({
            _id: {
              $in: tourId
            }
          }));

        case 6:
          tours = _context2.sent;
          console.log(tours);
          res.status(200).render("overview", {
            title: "my bookings",
            tours: tours
          });

        case 9:
        case "end":
          return _context2.stop();
      }
    }
  });
});
exports.tour = catchAsync(function _callee3(req, res, next) {
  var tour;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          console.log(req.originalUrl);
          _context3.next = 3;
          return regeneratorRuntime.awrap(Tour.findOne({
            slug: req.params.slug
          }).populate({
            path: "reviews",
            fields: "review rating user"
          }));

        case 3:
          tour = _context3.sent;

          if (!tour) {
            next(new appError("sorry this tour does not exist", 404));
          }

          res.status(200).render("tour", {
            title: req.params.slug,
            tour: tour
          });

        case 6:
        case "end":
          return _context3.stop();
      }
    }
  });
});

exports.me = function (req, res) {
  res.status(200).render("account", {
    title: req.user.name
  });
};

exports.login = function (req, res, next) {
  res.status(200).render("login", {
    title: "login"
  });
};