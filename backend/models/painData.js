const mongoose = require('mongoose');

const painDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  userEmail: {
    type: String,
    ref: 'User',
    required: true,
    lowercase: true,
    trim: true
  },

  // New fields aligned with AI Physio backend
  chiefComplaint: {
    type: String,
    required: true,
    trim: true
  },

  painSeverity: {
    type: Number,
    required: true,
    min: 0,
    max: 10,
    default: 5
  },

  history: {
    type: String,
    trim: true,
    default: ""
  },

  goals: {
    type: [String],
    default: []
  },

  extraContext: {
    type: String,
    trim: true,
    default: ""
  },

  injuryArea: {
    type: String,
    trim: true
  },

  doctorSlip: {
    data: Buffer,
    contentType: String
  },

  // AI sync tracking
  aiSessionId: {
    type: String
  },

  aiTriage: {
    type: String
  },

  aiReasons: {
    type: [String],
    default: []
  }

}, { timestamps: true });

module.exports = mongoose.model('PainData', painDataSchema);
