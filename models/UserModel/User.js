const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, "Name is required"] 
  },

  email: { 
    type: String, 
    required: [true, "Email is required"], 
    unique: true, 
    lowercase: true, 
    trim: true 
  },

  password: { 
    type: String, 
    required: [true, "Password is required"], 
    minlength: [6, "Password must be at least 6 characters long"],
    select: false // Hide password from queries by default
  },

  phone: { 
    type: String, 
    trim: true 
  },

  role: {
    type: String,
    enum: ['admin', 'hospital', 'doctor', 'nurse', 'ambulance', 'equipment'],
    required: [true, "Role is required"]
  },

  // If user is connected to a specific hospital
  hospitalId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Hospital',
    default: null 
  },

  isVerified: { 
    type: Boolean, 
    default: false 
  }, // For admin approval before login

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Optional: Improve query performance for common lookups
// Removed duplicate index definition for email to avoid Mongoose warning

const User = mongoose.model('User', userSchema);
module.exports = User;
