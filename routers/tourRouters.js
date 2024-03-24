const express = require('express')
const tourHanddler = require('../controller/tourController.js')
const authHanddler = require('../controller/authController.js')
const reviewRouter = require('../routers/reviewRouter.js')

//express.router() es un objeto que no sirve para definir rutas
const router = express.Router()

router.use('/:tourId/reviews',reviewRouter)

////////////
router.route('/best-5-tours')
    .get(tourHanddler.bestTours, tourHanddler.getAllTours)


router.route('/stats-tours')
    .get(tourHanddler.toursStats)

router.route('/tours-pear-year/:year')
    .get(tourHanddler.toursPerYear)

// ruta para la geocalizacion
router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourHanddler.getToursWithin)
router.route('/distance/:latlng/unit/:unit').get(tourHanddler.getDistances)

router.use(authHanddler.protect)

//ponemos la ruta que mostrara la api
router.route('/')
    .get(tourHanddler.getAllTours)
    .post(authHanddler.restricted("admin","lead guide"),tourHanddler.createTour)

//url con parametros, cunado un valor no se sabe si se pasara el resulatado sera indefinido pero se debe de poner una URl
router.route('/:id')
    .get(tourHanddler.showTour)
    .patch(authHanddler.restricted("admin","lead guide"), tourHanddler.uploadTourImages, tourHanddler.resizeTourImages, tourHanddler.updateTour)
    .delete(authHanddler.restricted('admin', 'editor'), tourHanddler.deleteTour);

//rutas anidadas
// router.route('/:tourId/reviews').post(authHanddler.protect, authHanddler.restricted('user'), reviewHanddler.newReview)

module.exports = router;