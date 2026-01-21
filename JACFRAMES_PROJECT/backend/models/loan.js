const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fullName: String,
    school: String,
    program: String,
    yearOfStudy: String,
    contactNumber: String,
    sinNumber: String,
    amount: Number,
    repayment: Number,
    status: { type: String, default: 'Pending' },
    referenceNumber: { type: String, unique: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Loan', LoanSchema);