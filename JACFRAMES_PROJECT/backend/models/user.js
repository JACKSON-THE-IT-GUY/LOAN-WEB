const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    // CHANGED THIS from 'sin' to 'sinNumber' to match your frontend
    sinNumber: {
        type: String,
        required: true,
        unique: true // Added unique to prevent duplicate IDs
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);