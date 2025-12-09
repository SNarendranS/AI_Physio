const mongoose = require('mongoose');

const innerExerciseSchema = new mongoose.Schema({
  exerciseName: {
    type: String,
    required: true,
    trim: true
  },

  reps: {
    type: String,
    required: true
  },

  sets: {
    type: String,
    required: true
  },

  frequency: {
    type: String
  },

  precautions: {
    type: String
  },

  description: {
    type: String
  },

  completed: {
    type: Boolean,
    default: false
  }
});

const exerciseSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    painDataId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PainData',
      required: true
    },

    aiSummary: {
      type: String
    },

    exercises: [innerExerciseSchema],

    progress: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Progress auto-update
exerciseSchema.pre('save', function (next) {
  if (this.exercises.length > 0) {
    const total = this.exercises.length;
    const done = this.exercises.filter(e => e.completed).length;
    this.progress = Math.round((done / total) * 100);
  } else {
    this.progress = 0;
  }
  next();
});

module.exports = mongoose.model('Exercise', exerciseSchema);
