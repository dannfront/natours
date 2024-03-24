const stripe = require('stripe')(process.env.SECRET_KEY_STRIPE)
const Tour = require("./../Model/tourModel.js")
const Booking = require("./../Model/bookingModel.js")
const catchAsync = require("./../utils/catchAsync.js")
const appError = require('../classController/appError.js')
const factoryFunction=require('./factoryFunctions.js');


exports.getCheckoutSession = catchAsync(async function (req, res, next) {
    //obtenemos el tour
    const tour = await Tour.findById(req.params.tourId)
    console.log("hola");
    //preparamos y creamos el checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode:"payment",
        // adonde redireccionara si es succes 
        success_url: `${req.protocol}://${req.get('host')}?tour=${tour.id}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        // sirve para almacener una referencia a un objeto
        client_reference_id: req.params.tourId,
        line_items: [{
            price_data: {
                currency: 'usd',
                product_data: {
                    name: `${tour.name} tour`,
                    description: tour.summary,
                    images: [`https://www.natours.dev/img/tours/${tour.imageCover}`]
                },
                unit_amount: tour.price * 100
            },
            quantity: 1
        }]

    })
    // respuesta
    res.status(200).json({
        status: "succes",
        session
    })
})

exports.newBooking=catchAsync(async function(req,res,next){
    const {tour,user,price}=req.query

    if(!tour&&!user&&!price)return next()
    await Booking.create({tour,user,price})
    console.log('kkkk');
    res.redirect(req.originalUrl.split("?")[0])
})


exports.createBooking=factoryFunction.createOne(Booking)
exports.deleteBooking=factoryFunction.deleteOne(Booking)
exports.getAllBooking=factoryFunction.getDocuments(Booking)
exports.getOneBooking=factoryFunction.getOneDocuemnt(Booking)
exports.updateBooking=factoryFunction.updateOne(Booking)