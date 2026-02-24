const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const User = require('../models/User');

// ensure uploads/profile exists; multer will create directories if needed when using diskStorage callback
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads', 'profile'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.png';
    const name = `avatar_${req.user && req.user.id ? req.user.id : Date.now()}_${Date.now()}${ext}`;
    cb(null, name);
  }
});

const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB limit

// POST /api/auth/upload-avatar
router.post('/upload-avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if(!req.file) return res.status(400).json({ msg: 'No file uploaded' });
    const relPath = '/uploads/profile/' + req.file.filename;
    // update user
    const userId = req.user.id;
    await User.findByIdAndUpdate(userId, { avatar: relPath });
    return res.json({ avatar: relPath });
  } catch (err) {
    console.error('Avatar upload error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
