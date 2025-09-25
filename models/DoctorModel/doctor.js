const mongoose = require("mongoose");

const doctorProfileSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true 
  },
  specialization: { type: String, required: true },
  // qualifications removed
  experience: { type: Number, default: 0 },
  // availability removed
  consultationFee: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  totalPatientsTreated: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
  
});

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
