const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

app.use(cors({
    origin: [
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'http://10.21.233.160:5500', // Live Server IP
        'http://10.21.233.160:5000'  // Backend IP (since you serve static files here too)
    ],
    credentials: true
}));
// Serve frontend static files so the dashboard is reachable from other devices
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect Database
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected: JACFRAMES Database'))
    .catch(err => console.log('Database connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
// mount upload routes under auth path (upload-avatar)
app.use('/api/auth', require('./routes/upload'));
app.use('/api/loans', require('./routes/loans'));

const PORT = process.env.PORT || 5000;
// Bind to 0.0.0.0 so the server is reachable on the local network
app.listen(PORT, '0.0.0.0', () => console.log(`Server started on http://0.0.0.0:${PORT}`));