// backend
const Booking = require('../model/booking');
const moment = require('moment');
const stripe = require('stripe')(process.env.stripe_screat);

const create_booking = async (req, res) => {
    const userId = '65ce14ac157012fc545780eb';
    const listingId = req.body.id;
    const paymentMethodId = req.body.paymentMethodId;
    const total_amount = req.body.totalAmount; 

    const start_date = moment(req.body.startDate, 'DD-MM-YYYY').toDate(); 
    const end_date = moment(req.body.endDate, 'DD-MM-YYYY').toDate();
    const { adults, children, infants, pets } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: total_amount*100,
            currency: 'usd',
            payment_method_types: ['card'],
            payment_method: paymentMethodId,
            confirm: true,
        });

        if (paymentIntent.status === 'succeeded') {
            const dataBooking = await Booking.create({
                userId,
                listingId,
                start_date,
                end_date,
                adults,
                children,
                total_amount,
                infants,
                pets,
            });

            if (dataBooking) {
                res.status(200).json({ message: 'Payment confirmed successfully', });
            } else {
                return res.status(500).json({
                    error: 'Failed to create booking'
                });
            }
        } else {
            res.status(400).json({ message: 'Payment failed' });
        }
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
}

module.exports = {
    create_booking,
}

// Frontend: No changes needed
