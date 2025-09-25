const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel/User');
const Hospital = require('../models/HospitalModel/hospital');
const DoctorProfile = require('../models/DoctorModel/doctor');

const router = express.Router();

// Signup Route
router.post('/signup', async (req, res) => {
    try {
        const rolesRequiringHospital = ['nurse', 'ambulance', 'equipment'];
        const {
            name,
            email,
            password,
            phone,
            role,
            hospitalId,
            address,
            specialization,
            experience,
            consultationFee
        } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Please provide all required fields: name, email, password, role' });
        }
        if (role === 'doctor') {
            if (!specialization || !experience || !consultationFee) {
                return res.status(400).json({ message: 'Please provide specialization, experience, and consultationFee for doctor signup.' });
            }
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            role,
            hospitalId: rolesRequiringHospital.includes(role) ? hospitalId : null
        });
        await newUser.save();
        if (role === 'hospital') {
            const newHospital = new Hospital({
                name,
                address: address || '',
                contact: phone || '',
                email,
                createdBy: newUser._id
            });
            await newHospital.save();
        }
        if (role === 'doctor') {
            const newDoctorProfile = new DoctorProfile({
                user: newUser._id,
                specialization,
                experience,
                consultationFee
            });
            await newDoctorProfile.save();
        }
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error'
            , error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, username, password, role } = req.body;
        let user;
        // Doctor login: only username and password required
        if (username && password && !email && (!role || role === 'doctor')) {
            user = await User.findOne({ name: username, role: 'doctor' }).select('+password');
            if (!user) {
                return res.status(400).json({ message: 'Invalid username or password' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid username or password' });
            }
        } else {
            // Default: email, password, and role required
            if (!email || !password || !role) {
                return res.status(400).json({ message: 'Please provide email, password, and role' });
            }
            user = await User.findOne({ email }).select('+password');
            if (!user) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }
            if (user.role !== role) {
                return res.status(403).json({ message: `Role mismatch. You are registered as ${user.role}.` });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }
        }
        user.password = undefined;
        let doctors = [];
        let hospitalId = null;
        if (user.role === 'hospital') {
            const hospital = await Hospital.findOne({ createdBy: user._id });
            if (hospital) {
                hospitalId = hospital._id;
            }
        }
        // Generate JWT token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1d' });
        res.status(200).json({
            message: 'Login successful',
            token,
            user: { ...user._doc, hospitalId },
            role: user.role,
            doctors
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Admin signup route
router.post('/admin-signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please provide username, email, and password' });
        }
        const Admin = require('../models/AdminModel/Admin');
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new Admin({
            username,
            email,
            password: hashedPassword
        });
        await newAdmin.save();
        res.status(201).json({ message: 'Admin registered successfully', admin: { username, email } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Admin login route
router.post('/admin-login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }
        const Admin = require('../models/AdminModel/Admin');
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        // Generate JWT token
        const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1d' });
        res.status(200).json({
            message: 'Admin login successful',
            token,
            admin: { username: admin.username, email: admin.email },
            role: 'admin'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
