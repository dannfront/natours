
// multer sirve para la carga de archivos 
const multer=require('multer')
const sharp = require('sharp')

const Tour = require('./../Model/tourModel.js')
// const ApiFetureds = require('../classController/apiFetureds.js')
const catchAsync = require('../utils/catchAsync.js')
const appError = require('../classController/appError.js')
const factoryFunction=require('./factoryFunctions.js');
// const Review = require('../Model/reviewModel.js');

// const multerStorage = multer.memoryStorage();
const multerStorage=multer.diskStorage({
    destination:function (req,file,cb){
        cb(null,'public/img/tours')
    },
    filename:function(req,file,cb){
        const nameImg=`user-${req.user.id}-${Date.now()}.${file.mimetype.split('/')[1]}`
        cb(null,nameImg)
    }
})

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

// upload.single('image') req.file
// upload.array('images', 5) req.files

exports.resizeTourImages = catchAsync(async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next();
    console.log(req.files);

  // 1) Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0])
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

exports.bestTours = async function (req, res, next) {
    //127.0.0.1:3000/api/v1/tours?page=1&limit=5&fields=name,difficulty,ratingAverage,summary,description,price&sort=-ratingAverage,-price
    req.query.fields = "name,ratingAverage,summary,description,price"
    req.query.sort = "-ratingAverage,-price"
    req.query.limit = "5"
    next()
}
////// pipiline
exports.toursStats = catchAsync(async function (req, res, next) {
    const stats = await Tour.aggregate([
        {
            $match: { ratingAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: '$difficulty',
                numTours: { $sum: 1 },
                averagePrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { averagePrice: 1 }
        }
    ])
    res.status(200).json({
        status: "succes",
        data: {
            stats
        }
    })
})
//funcion en utils
exports.toursPerYear = catchAsync(async function (req, res, next) {
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${+req.params.year}-01-01`),
                    $lte: new Date(`${+req.params.year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numToursMonth: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: { _id: 0 }
        },
        {
            $sort: { month: 1 }
        }
    ])
    res.status(200).json({
        status: "succes",
        data: {
            plan
        }
    })

})


exports.getToursWithin=catchAsync(async function(req,res,next){
    const {distance,latlng,unit}=req.params
    const [lat,lng]=latlng.split(",")
    const radius=unit==='mi'?distance/3963.2:distance/6378.1

    if(!lat||!lng) return next(new appError("please provided latitur al longitude in the format: lat,lng"))

    const tours=await Tour.find({
        startLocation:{$geoWithin:{$centerSphere:[[lng,lat],radius]}}
    })

    res.status(200).json({
        message:"succes",
        results:tours.length,
        data:tours
    })
})

exports.getDistances=catchAsync(async function(req,res,next){
    console.log(req.params);
    const {latlng,unit}=req.params
    const [lat,lng]=latlng.split(",")
    const multiplier=unit==='mi'?0.000621371:0.001

    if(!lat||!lng) return next(new appError("please provided latitur al longitude in the format: lat,lng"))

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: "distance",
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);

    res.status(200).json({
        message:"succes",
        results:distances.length,
        data:distances
    })
})


//funcion en utils
exports.getAllTours = factoryFunction.getDocuments(Tour)

//funcion en utils
exports.createTour = factoryFunction.createOne(Tour)

//funcion en utils
exports.showTour = factoryFunction.getOneDocuemnt(Tour,{path:"reviews"})
//funcion en utils
exports.updateTour = factoryFunction.updateOne(Tour)
//funcion en utils
exports.deleteTour = factoryFunction.deleteOne(Tour)

