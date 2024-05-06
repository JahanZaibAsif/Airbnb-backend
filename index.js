const express = require('express');
const bodyParser = require('body-parser'); // Import body-parser
const AirbnbRoutes = require('./routes/airbnb');
const cors = require('cors'); // Import CORS middleware
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const session = require('express-session');
const secretKey = process.env.JWT_SECRET || 'default_secret_key';

app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: false
}));

// CORS configuration
app.use(cors({
    origin: '*', // Adjust with your React app's URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true // Enable credentials if needed
}));

app.use('/', AirbnbRoutes);

app.listen(4000, function() {
    console.log('Server is running on port 4000');
});
