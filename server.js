const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
// FIX: Explicitly allow CORS for all origins and methods to fix upload failures
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-auth-token']
}));
app.use(express.json());
// Serve static files from the 'uploads' folder
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Database Connection (Uses Environment Variable for Production)
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jacframes';
mongoose.connect(dbURI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  sin: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  resetCode: String,
  resetCodeExpires: Date
});
const User = mongoose.model('User', UserSchema);

// Multer Configuration for Avatar Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Email Transporter Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'shadewalker709@gmail.com', // Your Gmail
    pass: 'qneytanamngrnery' // Your App Password
  }
});

// Helper Function to send email
async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: 'shadewalker709@gmail.com',
    to: to,
    subject: subject,
    text: text
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// --- API Endpoints ---

// 1. Register User
app.post('/api/auth/register', async (req, res) => {
  const { name, email, sin, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ name, email, sin, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    res.json({ msg: 'Registration successful' });
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// 2. Login User
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    const token = jwt.sign({ id: user._id }, 'secretKey', { expiresIn: '1h' });
    // Send user data back to save in localStorage
    res.json({ 
      token, 
      user: { id: user._id, name: user.name, sin: user.sin, avatar: user.avatar } 
    });
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// 3. Upload Avatar
app.post('/api/auth/upload-avatar', upload.single('avatar'), async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
    
    const decoded = jwt.verify(token, 'secretKey');
    const user = await User.findById(decoded.id);
    
    if (!user || !req.file) return res.status(400).json({ msg: 'User not found or no file uploaded' });

    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();
    
    res.json({ avatar: user.avatar });
  } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// 4. Forgot Password (OTP)
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const otp = crypto.randomInt(100000, 999999).toString();
    
    user.resetCode = crypto.createHash('sha256').update(otp).digest('hex');
    user.resetCodeExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail(user.email, "JACFRAMES Password Reset Code", `Your 6-digit verification code is: ${otp}`);
    
    res.json({ msg: "OTP sent to your email." });
  } catch (err) { res.status(500).json({ msg: "Server error" }); }
});

// 5. Verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
        const user = await User.findOne({
            email,
            resetCode: hashedOTP,
            resetCodeExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ msg: "Invalid or expired code" });

        res.json({ msg: "Code verified" });
    } catch (err) { res.status(500).json({ msg: "Server error" }); }
});

// 6. Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: "User not found" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetCode = undefined;
        user.resetCodeExpires = undefined;
        await user.save();

        res.json({ msg: "Password updated successfully" });
    } catch (err) { res.status(500).json({ msg: "Server error" }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));