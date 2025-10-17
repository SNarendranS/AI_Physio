const mongoose = require('mongoose');

const painDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  injuryPlace: {
    type: String,
    required: true,
    trim: true
  },
  painType: {
    type: String,
    required: true,
    trim: true
  },
  painLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 5
  },
  description: {
    type: String,
    trim: true
  },
  doctorSlip: {
    data: Buffer,         // Binary image storage
    contentType: String // MIME type (e.g., 'image/jpeg', 'image/png')
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('PainData', painDataSchema);
