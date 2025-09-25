const express = require('express');
const router = express.Router();
const Hospital = require('../models/HospitalModel/hospital');

// GET all hospital details
router.get('/hospital-details', async (req, res) => {
  try {
    const hospitals = await Hospital.find()
      .populate('doctors')
      .populate('bookings')
      .populate('createdBy');
    res.json(hospitals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
