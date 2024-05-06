const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/airbnb');

const bookingSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    listingId:{
        type:String,
        required:true,
    },
    adults:{
        type:String,
        required:true,
    },
    children:{
        type:String,
        required:true,
    },
    infants:{
        type:String,
        required:true,
    },
    pets:{
        type:String,
        required:true,
    },
    start_date:{
        type:Date,
        required:true
    },
    end_date:{
        type:Date,
        required:true
    },
    total_amount:{
        type:String
    }
},
    {
       timestamps: true
});

const Booking = mongoose.model('booking',bookingSchema);
module.exports= Booking