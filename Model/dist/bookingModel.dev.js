"use strict";

var mongoose = require('mongoose');

var bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'bookin must belong to a tour']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'bookin must belong to a tour']
  },
  price: {
    type: String,
    required: [true, 'Booking must have a price']
  },
  createAt: {
    type: Date,
    "default": Date.now()
  },
  paid: {
    type: Boolean,
    "default": true
  }
});
bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: "name price"
  });
  next();
});
var Bookin = mongoose.model("Booking", bookingSchema);
module.exports = Bookin;