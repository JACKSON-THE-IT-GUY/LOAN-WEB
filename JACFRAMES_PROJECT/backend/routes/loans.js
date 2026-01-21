const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');

// Submit a new loan
router.post('/apply', async (req, res) => {
    try {
        const loanData = req.body;
        
        // Generate a random Reference Number (e.g., JAC-12345)
        const refNumber = "JAC-" + Math.floor(10000 + Math.random() * 90000);

        const newLoan = new Loan({
            ...loanData,
            referenceNumber: refNumber
        });

        await newLoan.save();
        res.status(201).json({ msg: "Loan submitted successfully!", ref: refNumber });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to save loan to database" });
    }
});

// Get loan history for a specific user
router.get('/history/:sin', async (req, res) => {
    try {
        const loans = await Loan.find({ sinNumber: req.params.sin });
        res.json(loans);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

module.exports = router;