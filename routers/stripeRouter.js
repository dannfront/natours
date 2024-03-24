const express=require("express")

const stripeController=require("./../controller/stripeController.js")
const authController=require("./../controller/authController")
const router=express.Router()

router.use(authController.protect)
router.get('/checkout-sessions/:tourId',stripeController.getCheckoutSession)


router.route('/')
.get(stripeController.getAllBooking)
.post(stripeController.createBooking)

router.use(authController.restricted("admin"))
router.route('/:id')
    .get(stripeController.getOneBooking)
    .patch(stripeController.updateBooking)
    .delete(stripeController.deleteBooking)
module.exports=router