const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const users = require('../model/user');
const { verificationCode } = require('./sinup');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());


const emailsignup = async (req, res) => {
    try {
        const { first_name, last_name, email, password, phone_no } = req.body;

        const existingUser = await users.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const verificationCode = Math.floor(100000 + Math.random() * 900000);

        const newUser = new users({ first_name, last_name, email, password: hashedPassword, phone_no, verificationCode });
        await newUser.save();

        sendVerificationEmail(email, verificationCode, first_name);

        res.status(201).json({ message: 'User created. Check your email for verification code.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};



const confirmEmail = async (req, res) => {
    try {
        const { verificationCode } = req.body;
        const user = await users.findOne({ verificationCode });

        if (!user) {
            return res.status(404).json({ message: 'User not found or verification code is incorrect' });
        }

        await users.findOneAndUpdate({ verificationCode }, { verify: true });
        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


app.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = users.find(user => user.email === email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check password
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Generate JWT token for authentication
        const token = jwt.sign({ email: user.email }, 'secretkey');

        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Email verification function
function sendVerificationEmail(email, verificationCode) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'jahanzaibasif969@gmail.com',
          pass: 'jghi tent lwnq jzmc',
        },
      });

    // Email content
    const mailOptions = {
        from: 'jahanzaibasif969@gmail.com',
        to: email,
        subject: 'Email Verification Code',
        html: `<p>Your Verification Code ${verificationCode}</p>`,
      };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = {
    emailsignup,
    confirmEmail
}
