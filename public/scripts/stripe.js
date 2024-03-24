
const stripe=Stripe('pk_test_51Ow7RsRrjXyajTmrGyMfs3phn3TTFPOHlbTOj0bNL5rUpt9Ssfv6QwF5f6wdFcqs1fGb6Eo7iGcZFTksk99OAk7000LyTMKDKw')

export default async function pago(tourId){
    try {
        const session= await fetch(`/api/v1/bookings/checkout-sessions/${tourId}`)
        const dataSession=await session.json()
        await stripe.redirectToCheckout({
            sessionId: dataSession.session.id,
          });
    } catch (error) {
        console.error(error)
    }
}