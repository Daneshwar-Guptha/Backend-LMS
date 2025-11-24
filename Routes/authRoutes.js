const express = require('express');
const authRoutes = express.Router();
const User = require('../model/User');

const bcrypt = require('bcrypt');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { auth } = require('../middleware/auth');
const { validateSignupData } = require('../utils/validations');


authRoutes.post('/user/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userData = await User.findOne({ email });
        if (userData) {
            throw new Error('Email already exists');
        }
        validateSignupData(req.body)

        const newUser = new User({
            name,
            email,
            password,
            role: 'user',
        });
        await newUser.save();

        res.status(201).json({
            message: 'User registered successfully'
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

authRoutes.post('/instructor/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userData = await User.findOne({ email });
        if (userData) {
            throw new Error('Email already exists');
        }

        validateSignupData(req.body);

        const newUser = new User({
            name,
            email,
            password,
            role: 'instructor',
        });
        await newUser.save();

        res.status(201).json({
            message: 'User registered successfully'
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

authRoutes.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({ email });
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!userData) {
            res.clearCookie('token');
            throw new Error("please register first");
        }
        const passwordValid = await userData.isPasswordMatch(password)
        if (!passwordValid) {
            throw new Error("Invalid password");
        }
        const token = jwt.sign({ id: userData._id }, JWT_SECRET, { expiresIn: '1d' });
        res.cookie('token', token, {
            httpOnly: false
        });
        res.status(200).send("successfuly login");
    } catch (error) {
        res.status(400).send(error.message);
    }
});

authRoutes.post('/logout', async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
        });
        res.status(200).send("Successfully logged out")
    } catch (error) {
        res.status(400).send(error.message);
    }
})

authRoutes.get('/user', auth, async (req, res) => {
    try {
        const userData = req.user;
        res.status(200).send(userData);
    } catch (error) {
        res.status(400).send(error.message);
    }

})


module.exports = authRoutes;
