const User = require('../model/user.js');
const axios = require('axios');
const Listing = require('../model/listing');
const Booking = require('../model/booking');
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

// multer requirement
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

const newApi = (req,res) =>{
    res.json({message:'hellow every one '});
    console.log(' Error API create');
}

// ============================== End SignUp and Login Controller ==================================




// ============================== Listing Api and Store , Delete and Update  =====================================
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'airbnb', 
      allowed_formats: ['jpg', 'jpeg', 'png'],
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
    },
  });
  
  const upload = multer({ storage: storage });
  
  const upload_picture = upload.array('place_pictures', 5);



const create_listing = async (req , res) => {

    const userId = req.user.id;

    const{place_name ,place_country,place_city,place_type, place_province,place_category,place_area,rooms,kitchen,washrooms,provide_services,available_date,end_date,price_per_night} = req.body;

    const place_pictures = req.files?.map(file => file.path); 
        const filename = req.files?.map(file => file.filename); 
    
        const requiredFields = ['place_name', 'place_country', 'place_city', 'place_type', 'place_category', 'place_area', 'rooms', 'kitchen', 'washrooms', 'provide_services', 'end_date','available_date', 'price_per_night'];

        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
          return res.status(400).json({ status: 402, message: 'Required fields are missing', missing_fields: missingFields });
        }
        
      const dataSave = new Listing({
        userId, place_name,place_country, place_province,place_city,place_type,place_category,place_area,rooms,kitchen,washrooms,provide_services,available_date, end_date,price_per_night,place_pictures,filename
      });
    
      try {
        
        const result = await dataSave.save();
        console.log(result.place_country);
        res.status(200).json({ status: 200, message: 'Data saved successfully', data: result });
      } catch (error) {
        res.status(500).json({ status: 500, message: 'Failed to save data', error: error.message });
      }
}

const showAll_listing = async (req, res) => {
  try {
    // const page = parseInt(req.query.page) || 1;
    // const pageSize = parseInt(req.query.pageSize) || 10;
    // const skip = (page - 1) * pageSize;
    // const all_listing = await Listing.find().skip(skip).limit(pageSize);
    // const totalListings = await Listing.countDocuments();
    // const totalPages = Math.ceil(totalListings / pageSize);
    // console.log(totalPages)


    const all_listing = await Listing.find();

      
      const  response = all_listing.map(user => user.userId);

      const listingIds = all_listing.map(listing => listing._id);
      const bookingData = await Booking.find({ listingId: { $in: listingIds } });

      const listingDataWithBooking = all_listing.map(listing => {
          const bookings = bookingData.filter(booking => booking.listingId.toString() === listing._id.toString());
          const bookingDates = bookings.map(booking => ({
              start_date: booking.start_date,
              end_date: booking.end_date
          }));
          return {
              _id: listing._id,
              place_name: listing.place_name,
              place_pictures:listing.place_pictures,
              bookingDates,
              place_area: listing.place_area,
              price_per_night: listing.price_per_night,
              available_date:listing.available_date,
              washrooms: listing.washrooms,
              place_category: listing.place_category,
              


          };
      });

      res.json({
          message: 'All records of user',
          status: 200,
          data: listingDataWithBooking
      });
  } catch (error) {
      res.status(500).json({ message: 'Error message on Code', status: 500 });
  }
}



 const delete_listing = async (req, res) => {
  const listingId = req.params.id;
 
  try {
    const listing_record = await Listing.findById(listingId);
    if (!listing_record) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    for (const imagePath of listing_record.filename) {
      const result = await cloudinary.uploader.destroy(imagePath);
      if (result.result === 'ok') {
        console.log({message:'Image deleted successfully'});
      } else {
        console.log('Failed to delete image:', result);
      }
    }

    const data = await Listing.findByIdAndDelete(listingId);
    if (data) {
      res.json({ success: true, message: 'Data deleted successfully' });
    } else {
      res.json({ success: false, message: 'Data Not deleted' }); // Corrected typo
    }

  } catch (error) {
    console.error('Error deleting images:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


const update_listing = async (req, res) => {

  const recordId = req.params.id;
  const listing_record = await Listing.findById(recordId);

  try {
   
    const {
      place_name,
      place_country,
      place_city,
      place_type,
      place_province,
      place_category,
      place_area,
      rooms,
      kitchen,
      washrooms,
      provide_services,
      available_date,
      end_date,
      price_per_night
    } = req.body;
console.log(req.body);
    const place_pictures = req.files?.map(file => file.path);
    const filename = req.files?.map(file => file.filename);


  const result = await Listing.updateMany({_id:req.params.id},{$set:{
    place_name,
    place_country,
    place_city,
    place_type,
    place_province,
    place_category,
    place_area,
    rooms,
    kitchen,
    washrooms,
    provide_services,
    available_date,
    end_date,
    price_per_night,
    place_pictures,
    filename
  }});
  


  if (result) {

  for (const imagePath of listing_record.filename) {    
    if (filename.includes(imagePath)) {
      continue; 
    }

    const cloudinaryResult = await cloudinary.uploader.destroy(imagePath);
    
    if (cloudinaryResult.result === 'ok') {
      console.log({ message: 'Image deleted successfully' });
    } else {
      console.log('Failed to delete image:', cloudinaryResult);
    }
  }
      res.json({
        message: 'Record updated successfully',
        status: 200,
        success: true,
      });
    }else{
      res.json({message:'data not update'});
    }
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({
      message: 'Internal server error',
      status: 500,
      success: false
    });
  }
};

const single_listing = async (req , res) => {
  const recordId = req.params.id;
  const result = await Listing.findById(recordId);
  console.log(result);
  if(result){
    res.json({
      status:200,
      message:'show one record',
      data:result
    })
  }else{
    res.json({
      status:404,
      message:'show not record against this id'
    })
  }
}



  async function getCoordinates(placeName) {
    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName)}&format=json`);
        if (response.data && response.data.length > 0) {
            const latitude = response.data[0].lat;
            const longitude = response.data[0].lon;
            console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
        } else {
            console.log("Place not found");
        }
    } catch (error) {
        console.error("Error fetching coordinates:", error);
    }
}


getCoordinates("india");




// =================================== End Listing Api and Store Image =================================
module.exports = {
    signup,
    verificationCode,
    userData,
    create_listing,
    upload_picture,
    newApi,
    showAll_listing,
    delete_listing,
    update_listing,
    single_listing,
    getCoordinates
}; 
