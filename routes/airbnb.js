
const express = require('express');
const multer = require('multer');
const upload = multer();
const router = express.Router();
const cors = require('cors'); 
const corsOptions = {
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
};
router.use(cors(corsOptions));

const SinUpController = require('../controller/sinup');
const bookingController = require('../controller/booking');
const listingController = require('../controller/listing')
const emailController = require('../controller/emailverify')
const { checkRoute } = require('./middleware');

router.get('/',  (req , res) => {
    res.send('Hello everyone');
});

router.post('/signup', upload.none(), SinUpController.signup);
router.post('/emailsignup', upload.none(), emailController.emailsignup);
router.post('/emailverification', upload.none(), emailController.confirmEmail);


router.post('/verificationCode', upload.none(), SinUpController.verificationCode);
router.post('/userData', checkRoute, SinUpController.userData);
router.post('/create_listing', listingController.upload_picture, checkRoute, listingController.create_listing);
router.get('/show_listing', checkRoute, SinUpController.showAll_listing);
router.delete('/:id/delete_listing/', checkRoute, SinUpController.delete_listing);
router.put('/:id/update_listing', checkRoute, listingController.upload_picture, listingController.update_listing);
router.post('/newApi', SinUpController.newApi);
router.get('/:id/single_listing', checkRoute, listingController.single_listing);
router.post('/create_booking', upload.none(), bookingController.create_booking);
router.get('/create_booking', checkRoute, listingController.getCoordinates);

module.exports = router;
