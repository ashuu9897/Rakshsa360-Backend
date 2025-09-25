const express = require('express');
const DoctorRequest = require('../models/DoctorRequestModel/doctorRequest');
const Hospital = require('../models/HospitalModel/hospital');
const auth = require('../middleware/auth');

const router = express.Router();

// Hospital creates a doctor request (protected)
router.post('/doctor-request', auth, async (req, res) => {
    try {
        const { hospitalId, doctorId, description } = req.body;
        if (!hospitalId || !description || !doctorId) {
            return res.status(400).json({ message: 'hospitalId, doctorId and description are required.' });
        }
        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found.' });
        }
        // doctorId is mapped here
        const doctorRequest = new DoctorRequest({ hospital: hospitalId, doctor: doctorId, description });
        await doctorRequest.save();
        const populatedRequest = await DoctorRequest.findById(doctorRequest._id).populate('hospital', 'name email').populate('doctor', 'specialization');
        res.status(201).json({ message: 'Doctor request created.', doctorRequest: populatedRequest });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Doctors and admins view all doctor requests (protected)
router.get('/doctor-requests', auth, async (req, res) => {
    try {
        const { role } = req.user;
        if (role !== 'doctor' && role !== 'admin' && role !== 'hospital') {
            return res.status(403).json({ message: 'Access denied. Only doctors, admins, and hospitals can view requests.' });
        }
        const requests = await DoctorRequest.find({}).populate('hospital', 'name email').populate('doctor', 'specialization');
        res.status(200).json({ doctorRequests: requests });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.get('/my-requests', auth, async (req, res) => {
    try {
        const { role, _id } = req.user;
        if (role !== 'doctor') {
            return res.status(403).json({ message: 'Access denied. Only doctors can view their requests.' });
        }
        const requests = await DoctorRequest.find({ doctor: _id }).populate('hospital', 'name email').populate('doctor', 'specialization');
        res.status(200).json({ doctorRequests: requests });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.get('/hospital-requests', auth, async (req, res) => {
    try {
        const { role, _id } = req.user;
        if (role !== 'hospital') {
            return res.status(403).json({ message: 'Access denied. Only hospitals can view their requests.' });
        }
        // Find hospital profile using user ID
        const hospitalProfile = await Hospital.findOne({ createdBy: _id });
        if (!hospitalProfile) {
            return res.status(404).json({ message: 'Hospital profile not found.' });
        }
        // Find requests made by this hospital profile
        const requests = await DoctorRequest.find({ hospital: hospitalProfile._id }).populate('hospital', 'name email').populate('doctor', 'specialization');
        res.status(200).json({ doctorRequests: requests });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
