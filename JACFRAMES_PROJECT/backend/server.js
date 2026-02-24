const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

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
app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));