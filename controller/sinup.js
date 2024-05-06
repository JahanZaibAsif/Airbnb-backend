const User = require('../model/user.js');
const express = require('express');
const session = require('express-session');
const app = express();
require('dotenv').config();
const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET || 'default_secret_key';
app.use(
  session({
    secret: secretKey,
    resave: true,
    saveUninitialized: true,
  })
);

const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
cloudinary.config({ 
  cloud_name: process.env.cloud_name, 
  api_key: process.env.api_key, 
  api_secret: process.env.api_secret,
});

// ==================================== SignUp and Login Controller ====================================

const signup = async (req, res) => {
console.log(req.headers);
   const accountSid = process.env.accountSid;
const authToken = process.env.authToken;

    const client = require('twilio')(accountSid, authToken);
    
    const {phone_no} = req.body;
  
    const code = Math.floor(100000 + Math.random() * 900000);
    const existUser = await User.findOne({phone_no});

    try {
        if(existUser){
             await client.messages.create({
              
            body: 'PLEASE VERIFY your number ' + code, 
            from: '+13012462919',
            to: phone_no
        }); 
        await User.findOneAndUpdate({ phone_no }, { code });
        res.json({ message: "Please verify the number for login : " + code });
        }else{
        await client.messages.create({
            body: 'PLEASE VERIFY your number ' + code, 
            from: '+16812011885',
            to: phone_no
        });
        const SinUp = new User({ phone_no,code });
        await SinUp.save();
        res.json({ message: "Please verify the number: "});
        }
        
    } catch (error) {
        console.error('Error sending SMS:', error);
        res.status(500).json({ error: 'Failed to send verification code' });
    }
};


const verificationCode = async (req , res) => {
    const {verifyCode} = req.body;
    const code = await User.findOne({code:verifyCode});
    const verify = await User.findOne({code:verifyCode,verify:true});
    if (verify) {
        const token = jwt.sign({ id: verify._id}, secretKey, {
            expiresIn: '30d',
        });
        req.session.token = token; 
        res.setHeader('Authorization', `Bearer ${token}`); 
        res.json({status:200,message:'Login Successful',token}); 
      } else if (code) {
        await User.updateOne({code:verifyCode},{$set:{verify:true}});
        const token = jwt.sign({ id: code._id}, secretKey, {
         expiresIn: '30d',
     });
     req.session.token = token;
     res.setHeader('Authorization', `Bearer ${token}`); 
     res.json({status:250,message:'Verify Completed Successfully and update the all record',token});      
      } else{
            res.json({status:400,message:'Please Provide the Correct Code'});
      }
}

const userData = async (req,res,) => {
    const userId = req.user.id;
    const{first_name,last_name,email,password} = req.body;
    await User.updateMany({_id:userId},{$set:{first_name,last_name,email,password}});
    res.json({status:200,message:'User Update Successfully',userId});
}


// ============================== End SignUp and Login Controller ==================================





module.exports = {
    signup,
    verificationCode,
    userData,
    
}; 
