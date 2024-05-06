const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/airbnb');

const listingSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    place_name:{
        type:String,
        required:true,
    },
    place_area:{
        type:String,
        required:true,
    },
    place_city:{
        type:String,
        required:true,
    },
    
    place_province:{
        type:String,
        required:true,
    },
    place_city:{
        type:String,
        required:true,
    },
    place_category:{
        type:String,
        required:true,
    },
    rooms:{
        type:String,
        required:true,
        default:null
    },
    kitchen:{
        type:String,
        required:true,
        default:null
    },
    washrooms:{
        type:String,
        required:true,
        default:null
    },
    provide_services:{
        type:[String],
        required:true,
    },
    available_date:{
        type:String,
        required:true
    },
    end_date:{
        type:String,
        required:true
    },
    price_per_night:{
        type:String,
        required:true,
    },
    place_pictures:{
        type:[String]
    },
    filename:{
        type:[String]
    },
    place_country:{
        type:String
    },
},
    {
       timestamps: true
});

const Listing = mongoose.model('listing',listingSchema);
module.exports= Listing