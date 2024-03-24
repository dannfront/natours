"use strict";

var mongoose = require("mongoose");

var Tour = require("./tourModel.js");

var reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, "this is a required field"],
    minlength: [20, "The minimum number of characters in the review is 20"]
  },
  rating: {
    type: Number,
    "default": 4.5,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0']
  },
  createdAt: {
    type: Date,
    "default": Date.now(),
    select: false
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: "Tour",
    required: [true, "This field must be required"]
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "This field must be required"]
  }
}); // los indices se ejecutan solos cuado mongo lo utilize

reviewSchema.index({
  tour: 1,
  user: 1
}, {
  unique: true
});
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user"
  });
  next();
});

reviewSchema.statics.calcAverage = function _callee(tourId) {
  var stats;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log(tourId);
          _context.next = 3;
          return regeneratorRuntime.awrap(this.aggregate([{
            $match: {
              tour: tourId
            }
          }, {
            // Todos los documentos que tienen el mismo valor para el campo tour se agruparán juntos.
            $group: {
              _id: "$tour",
              nRating: {
                $sum: 1
              },
              avgRating: {
                $avg: "$rating"
              }
            }
          }]));

        case 3:
          stats = _context.sent;
          console.log(stats);
          _context.next = 7;
          return regeneratorRuntime.awrap(Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
          }));

        case 7:
        case "end":
          return _context.stop();
      }
    }
  }, null, this);
};

reviewSchema.post("save", function () {
  // this constructor se refiere a Review
  this.constructor.calcAverage(this.tour);
});
reviewSchema.post(/^findOneAnd/, function _callee2(doc, next) {
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(doc.constructor.calcAverage(doc.tour));

        case 2:
          next();

        case 3:
        case "end":
          return _context2.stop();
      }
    }
  });
});
var Review = new mongoose.model('Review', reviewSchema);
module.exports = Review;