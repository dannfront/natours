const moongose = require('mongoose')
const slugify=require('slugify')

//creamos un schema con moongose.Schema({}) (plantilla) para los tour
const tourSchema = new moongose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal then 40 characters'],
      minlength: [10, 'A tour name must have more or equal then 10 characters']
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set:val=>Math.round(val*10)/10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation:{
      //GeoJson
      type:{
        type:String,
        default:'Point',
        enum:['Point']
      },
      coordinates:[Number],
      address:String,
      description:String

    },
    locations:[
      {
        type:{
          type:String,
          default:"Point",
          enum:['Point']
        },
        coordinates:[Number],
        addres:String,
        description:String,
        day:String
      }
    ],
    guides:[
      // esto sera un arreglo que guardara o hara referencia en este caso sera la id
      // para hacer referencia usaremos mo
      {
        //esto hara referencia al id del usuario
        type:moongose.Schema.ObjectId,
        // referencia a la coleccion de usuarios
        ref:'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);


// indices, como de un libro
tourSchema.index({price:1, ratingsAverage:-1})
tourSchema.index({slug:1})
tourSchema.index({startLocation:"2dsphere"})



//propiedades virtuales
tourSchema.virtual("numOfWeeks").get(function () {
  return this.duration / 7
})

//populate virtual
//esto retornara todo el documento que coincida con los campos referenciados
tourSchema.virtual("reviews",{
    //referencia al modelo 
    ref:"Review",
    //campo donde hara referencia 
    foreignField:"tour",
    //campo del modelo actual al cual se compara para ver si coinciden con el campo del modelo de referecia
    localField:"_id"
})

tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//middleware de documentos
tourSchema.pre("save", function (next) {
  //this apunta al documento
  console.log("antes de crear el documento")
  next()
})


tourSchema.pre(/^find/,function(next){
  // populate sirve para hacer referencias a otros documnetos
  this.populate({
    path:"guides",
    select:"-__v -passwordChange -paswordResetExpires -passwordResetToken"
})
next()
})
//middleware de consula
tourSchema.pre(/^find/, function (next) {
  //this apunta a la consulta
  this.find({ secret: { $ne: true } })
  next()
})

//middleware de agregacion
// tourSchema.pre('aggregate', function (next) {
//   //apunta a la agrupacion
//   this.pipeline().unshift({ $match: { secret: { $ne: true } } })
//   next()
// })

// guardamos los usuarios dentro de guides mediante la id
// esta es una de la formas usando middleware
// tourSchema.pre('save',async function(next){
//   const arrGuides=this.guides.map(async id => await User.findById(id))
//   this.guides=await Promise.all(arrGuides)
// })

//para crear un modelo de tour utilizamos moongose.model
const Tour = moongose.model('Tour', tourSchema)

module.exports = Tour