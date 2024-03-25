"use strict";

var express = require("express");

var viewController = require("./../controller/viewController");

var authController = require("./../controller/authController");

var stripeController = require("./../controller/stripeController.js");

var route = express.Router();
route.get("/", stripeController.newBooking, authController.isLoggued, viewController.overview);
route.get("/tour/:slug", authController.isLoggued, viewController.tour);
route.get("/login", authController.isLoggued, viewController.login);
route.get("/me", authController.protect, viewController.me);
route.get("/my-bookings", authController.protect, viewController.myBookings);
module.exports = route;