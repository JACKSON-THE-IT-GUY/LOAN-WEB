const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
// ... existing imports ...
const authRoutes = require('./routes/auth');

// ... existing middleware ...
app.use('/api/auth', authRoutes); // This connects your auth file

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to JACFRAMES Database"))
  .catch(err => console.log(err));

// Sample Route
app.get('/', (req, res) => {
    res.send("JACFRAMES API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));