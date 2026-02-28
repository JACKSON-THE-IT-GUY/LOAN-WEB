const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('../models/User'); // Import your user model

// Configure multer for local storage (temporary)
const upload = multer({ dest: 'uploads/' });

router.post('/profile-picture', upload.single('avatar'), async (req, res) => {
    try {
        // Logic to upload file to Cloudinary/S3 goes here
        // For now, storing a placeholder URL
        const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;

        // Update user in DB
        await User.findByIdAndUpdate(req.user.id, { avatar: imageUrl });

        res.json({ success: true, imageUrl });
    } catch (err) {
        res.status(500).json({ msg: 'Upload failed' });
    }
});

module.exports = router;