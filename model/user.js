const { verify } = require('jsonwebtoken');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/airbnb');

const userSchema  = new mongoose.Schema({
    first_name:{
        type:String,
        default: null
    },
    
    last_name:{
        type:String,
        default: null
    },

    email: {
        type: String,
        default: null
    },

    password:{
        type:String,
        default: null
    },

    phone_no:{
        type:String,
        default: null
    },
    code:{
        type:String,
    },
    verificationCode:{
        type: String,
        default: false
    },
    verify:{
        type: Boolean,
        default: false
    }
    
});

const User = mongoose.model('user',userSchema);

module.exports = User 
