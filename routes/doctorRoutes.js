const express = require('express');
const DoctorProfile = require('../models/DoctorModel/doctor');
const auth = require('../middleware/auth');
const User = require('../models/UserModel/User');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Middleware to check admin role
function adminOnly(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
}

// Admin creates a doctor
router.post('/create-doctor', auth, adminOnly, async (req, res) => {
    try {
        const { name, email, password, phone, specialization, experience, consultationFee } = req.body;
        if (!name || !email || !password || !specialization) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            role: 'doctor',
            isVerified: true
        });
        await newUser.save();
        const newDoctorProfile = new DoctorProfile({
            user: newUser._id,
            specialization,
            experience,
            consultationFee
        });
        await newDoctorProfile.save();
        res.status(201).json({ message: 'Doctor created successfully', doctor: { id: newUser._id, name, email, specialization } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get all doctors (protected route)
router.get('/all-doctors', auth, async (req, res) => {
    try {
        const doctors = await DoctorProfile.find({}).populate('user', 'name email role');
        res.status(200).json({ doctors });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
