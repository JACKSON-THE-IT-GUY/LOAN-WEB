const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// UPDATED CORS: Allow both local testing and your Render frontend
const allowedOrigins = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'https://jacframes-innovation-loan-form.onrender.com', // Your frontend URL
    'https://jacframes-innovation.onrender.com' // Potential secondary Render URL
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

// Serve frontend static files
// Note: On Render, if files are in root, path.join(__dirname, '..') is correct
app.use(express.static(path.join(__dirname, '..'))); 

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect Database
mongoose.connect(process.env.MONGODB_URI) // Ensure this matches your .env key
    .then(() => console.log('MongoDB Connected: JACFRAMES Database'))
    .catch(err => console.log('Database connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth', require('./routes/upload'));
app.use('/api/loans', require('./routes/loans'));

const PORT = process.env.PORT || 5000;

// On Render, we don't necessarily need to force '0.0.0.0' in the code, 
// but it doesn't hurt.
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});