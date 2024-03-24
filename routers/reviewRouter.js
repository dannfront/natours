const express = require('express')
const reviewController = require('../controller/reviewController.js')
const userAuthController = require('../controller/authController.js')


//merge params
const router = express.Router({ mergeParams: true })

router.use(userAuthController.protect)

router.route('/')
    .get(reviewController.getAllTReviews)
    .post(userAuthController.restricted('user'), reviewController.middlewareCreateReview, reviewController.newReview)

router.route('/:id')
    .get(reviewController.getReview)
    .delete(userAuthController.restricted("admin", "user"), reviewController.deleteReview)
    .patch(userAuthController.restricted("admin", "user"), reviewController.updateReview)


module.exports = router