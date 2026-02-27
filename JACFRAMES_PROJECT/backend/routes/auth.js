const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- GOOGLE LOGIN ROUTE ---
router.post('/google-login', async (req, res) => {
    const { idToken } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user if they don't exist
            // We use a prefix 'G-' for the SIN since Google doesn't provide one
            user = new User({
                fullName: name,
                email: email,
                sinNumber: `G-${googleId.substring(0, 8)}`, 
                password: await bcrypt.hash(Math.random().toString(36), 12)
            });
            await user.save();
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: { 
                id: user._id, 
                name: user.fullName, 
                email: user.email,
                sin: user.sinNumber 
            }
        });
    } catch (err) {
        console.error("Google Login Error:", err.message);
        res.status(400).json({ msg: "Google authentication failed" });
    }
});

// --- EXISTING REGISTER ROUTE ---
router.post('/register', async (req, res) => {
    try {
        const { name, fullName, sin, sinNumber, email, password } = req.body;
        const studentID = sin || sinNumber;

        let userExists = await User.findOne({ 
            $or: [{ email }, { sinNumber: studentID }] 
        });

        if (userExists) {
            return res.status(400).json({ msg: "User with this Email or SIN already exists" });
        }

        const user = new User({
            fullName: fullName || name,
            email,
            sinNumber: studentID,
            password
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        res.status(201).json({ msg: "User created successfully" });
    } catch (err) {
        console.error("Registration Error:", err.message);
        res.status(500).json({ error: "Server Error during registration" });
    }
});

// --- EXISTING LOGIN ROUTE ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: {
                id: user._id,
                name: user.fullName,
                email: user.email,
                sin: user.sinNumber
            }
        });
    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).send("Server Error during login");
    }
});

module.exports = router;