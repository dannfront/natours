const Review = require('./../Model/reviewModel.js')
const catchAsync=require('./../utils/catchAsync.js')
const factoryFunction=require('./factoryFunctions.js')


exports.getAllTReviews=factoryFunction.getDocuments(Review)
exports.middlewareCreateReview=function(req,res,next){

    if(!req.body.tour) req.body.tour=req.params.tourId
    if(!req.body.user) req.body.user=req.user.id
    next()
}

exports.newReview=factoryFunction.createOne(Review)

exports.getAllTReviews

exports.updateReview=factoryFunction.updateOne(Review)

exports.getReview=factoryFunction.getOneDocuemnt(Review)

exports.deleteReview=factoryFunction.deleteOne(Review)
