const express=require("express")
const viewController=require("./../controller/viewController")
const authController=require("./../controller/authController")
const stripeController=require("./../controller/stripeController.js")

const route=express.Router()

route.get("/",stripeController.newBooking,authController.isLoggued,viewController.overview)
route.get("/tour/:slug",authController.isLoggued,viewController.tour)
route.get("/login",authController.isLoggued,viewController.login)


route.get("/me",authController.protect,viewController.me)
route.get("/my-bookings",authController.protect,viewController.myBookings)

module.exports=route