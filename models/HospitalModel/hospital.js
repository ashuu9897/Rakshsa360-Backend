const mongoose = require("mongoose");


const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String, required: true },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DoctorProfile' }],
  equipments: [{
    name: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    description: { type: String }
  }],
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Hospital manager account
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Hospital", hospitalSchema);
