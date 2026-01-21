const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register User
router.post('/register', async (req, res) => {
    try {
        // We pull all possible variations from the frontend
        const { name, fullName, sin, sinNumber, email, password } = req.body;

        // Check if user already exists by email OR SIN
        const studentID = sin || sinNumber; // Use whichever one was provided
        let userExists = await User.findOne({ 
            $or: [{ email }, { sinNumber: studentID }] 
        });

        if (userExists) {
            return res.status(400).json({ msg: "User with this Email or SIN already exists" });
        }

        // Create new user using the field names defined in your User.js model
        const user = new User({
            fullName: fullName || name, // Fallback if one is missing
            email,
            sinNumber: studentID, // Maps to the sinNumber field in your model
            password
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        res.status(201).json({ msg: "User created successfully" });
        
    } catch (err) {
        console.error("Registration Error:", err.message);
        res.status(500).json({ error: "Server Error during registration" });
    }
});

// Login User
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.fullName,
                email: user.email,
                sin: user.sinNumber // Matches what the dashboard expects
            }
        });
    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).send("Server Error during login");
    }
});

module.exports = router;