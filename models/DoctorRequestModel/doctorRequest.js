const mongoose = require('mongoose');

const doctorRequestSchema = new mongoose.Schema({
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'DoctorProfile', required: false }, // doctor can be assigned later
    description: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DoctorRequest', doctorRequestSchema);
