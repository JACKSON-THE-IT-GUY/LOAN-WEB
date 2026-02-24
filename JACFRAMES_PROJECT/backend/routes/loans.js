const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const auth = require('../middleware/auth');

// Submit a new loan
router.post('/apply', async (req, res) => {
    try {
        const loanData = req.body;
        // ensure the client has settled previous loan(s)
        if(!loanData || !loanData.sinNumber) {
            return res.status(400).json({ msg: 'Missing sinNumber in loan data' });
        }
        const existing = await Loan.findOne({ sinNumber: loanData.sinNumber, status: { $ne: 'Paid' } });
        if (existing) {
            return res.status(400).json({ msg: 'You have an unpaid loan. Please settle it before applying for a new one.' });
        }

        // Generate a random Reference Number (e.g., JAC-12345)
        const refNumber = "JAC-" + Math.floor(10000 + Math.random() * 90000);

        const newLoan = new Loan({
            ...loanData,
            referenceNumber: refNumber,
            status: loanData.status || 'Pending'
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
        const loans = await Loan.find({ sinNumber: req.params.sin }).sort({ date: -1 });
        res.json(loans);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// Mark a loan as paid
router.put('/:id/pay', auth, async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id);
        if(!loan) return res.status(404).json({ msg: 'Loan not found' });
        loan.status = 'Paid';
        loan.paidAt = new Date();
        await loan.save();
        res.json({ msg: 'Loan marked as paid', loan });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Approve a loan
router.put('/:id/approve', auth, async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id);
        if(!loan) return res.status(404).json({ msg: 'Loan not found' });
        loan.status = 'Approved';
        loan.approvedAt = new Date();
        await loan.save();
        res.json({ msg: 'Loan approved', loan });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;