const mongoose = require("mongoose")
const Tour=require("./tourModel.js")

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, "this is a required field"],
        minlength: [20, "The minimum number of characters in the review is 20"]
    },
    rating: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0']
    },
    createdAt: {
        type: Date,
        default: Date.now(),
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
})

// los indices se ejecutan solos cuado mongo lo utilize
reviewSchema.index({tour:1,user:1},{unique:true})

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: "user"
    })
    next()
})

reviewSchema.statics.calcAverage = async function (tourId) {
    console.log(tourId)
    const stats = await this.aggregate([
        {

            $match: { tour: tourId },
        },
        {
            // Todos los documentos que tienen el mismo valor para el campo tour se agruparán juntos.
            $group: {
                _id: "$tour",
                nRating: { $sum: 1 },
                avgRating: { $avg: "$rating" }
            }
        }
    ])

    console.log(stats);
    await Tour.findByIdAndUpdate(tourId,{
        ratingsQuantity:stats[0].nRating,
        ratingsAverage:stats[0].avgRating
    })

}

reviewSchema.post("save", function () {
    // this constructor se refiere a Review
    this.constructor.calcAverage(this.tour)
})

reviewSchema.post(/^findOneAnd/,async function(doc,next){
    // this.r ahora es el dcumento poruqe dis solo es la consulta
    await doc.constructor.calcAverage(doc.tour)
    next();
})


const Review = new mongoose.model('Review', reviewSchema)

module.exports = Review