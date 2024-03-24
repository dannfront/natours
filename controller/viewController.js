const Tour=require("./../Model/tourModel.js")
const Booking=require("./../Model/bookingModel.js")
const catchAsync=require("./../utils/catchAsync.js")
const appError = require('../classController/appError.js')


exports.overview = catchAsync(async function (req, res, next) {

    const tours=await Tour.find()
    console.log(req.originalUrl);
    res.status(200).render("overview", {
        tours
    })
    
})

exports.myBookings=catchAsync(async function(req,res,next){
    //populate
    // encontrar todos lo documentos que continen la id del usurio
    const bookings=await Booking.find({user:req.user.id})
    //obtenemos todos los tour
    const tourId=bookings.map(el=>el.tour)
    //encontrat los tour por el id in significa que busque todos los documentos que constengan las id que esten en el arreglo de tourId
    const tours=await Tour.find({_id:{$in:tourId}})
    console.log(tours);
    res.status(200).render("overview", {
        title:"my bookings",
        tours
    })
})

exports.tour= catchAsync( async function(req,res,next){
    console.log(req.originalUrl);
    const tour=await Tour.findOne({slug:req.params.slug}).populate({
        path:"reviews",
        fields:"review rating user"
    })
    if(!tour){
        next(new appError("sorry this tour does not exist",404))
    }
    res.status(200).render("tour", {
        title:req.params.slug,
        tour
    })
})


exports.me=function(req,res){
    res.status(200).render("account",{
        title:req.user.name
    })
}

exports.login=function(req,res,next){
    res.status(200).render("login",{
        title:"login"
    })
}
