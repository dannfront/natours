"use strict";

var stripe = require('stripe')(process.env.SECRET_KEY_STRIPE);

var Tour = require("./../Model/tourModel.js");

var Booking = require("./../Model/bookingModel.js");

var catchAsync = require("./../utils/catchAsync.js");

var appError = require('../classController/appError.js');

var factoryFunction = require('./factoryFunctions.js');

exports.getCheckoutSession = catchAsync(function _callee(req, res, next) {
  var tour, session;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(Tour.findById(req.params.tourId));

        case 2:
          tour = _context.sent;
          console.log("hola"); //preparamos y creamos el checkout session

          _context.next = 6;
          return regeneratorRuntime.awrap(stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: "payment",
            // adonde redireccionara si es succes 
            success_url: "".concat(req.protocol, "://").concat(req.get('host'), "?tour=").concat(tour.id, "&user=").concat(req.user.id, "&price=").concat(tour.price),
            cancel_url: "".concat(req.protocol, "://").concat(req.get('host'), "/tour/").concat(tour.slug),
            customer_email: req.user.email,
            // sirve para almacener una referencia a un objeto
            client_reference_id: req.params.tourId,
            line_items: [{
              price_data: {
                currency: 'usd',
                product_data: {
                  name: "".concat(tour.name, " tour"),
                  description: tour.summary,
                  images: ["https://www.natours.dev/img/tours/".concat(tour.imageCover)]
                },
                unit_amount: tour.price * 100
              },
              quantity: 1
            }]
          }));

        case 6:
          session = _context.sent;
          // respuesta
          res.status(200).json({
            status: "succes",
            session: session
          });

        case 8:
        case "end":
          return _context.stop();
      }
    }
  });
});
exports.newBooking = catchAsync(function _callee2(req, res, next) {
  var _req$query, tour, user, price;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _req$query = req.query, tour = _req$query.tour, user = _req$query.user, price = _req$query.price;

          if (!(!tour && !user && !price)) {
            _context2.next = 3;
            break;
          }

          return _context2.abrupt("return", next());

        case 3:
          _context2.next = 5;
          return regeneratorRuntime.awrap(Booking.create({
            tour: tour,
            user: user,
            price: price
          }));

        case 5:
          console.log('kkkk');
          res.redirect(req.originalUrl.split("?")[0]);

        case 7:
        case "end":
          return _context2.stop();
      }
    }
  });
});
exports.createBooking = factoryFunction.createOne(Booking);
exports.deleteBooking = factoryFunction.deleteOne(Booking);
exports.getAllBooking = factoryFunction.getDocuments(Booking);
exports.getOneBooking = factoryFunction.getOneDocuemnt(Booking);
exports.updateBooking = factoryFunction.updateOne(Booking);