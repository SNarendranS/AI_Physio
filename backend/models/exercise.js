const mongoose = require('mongoose');

const innerExerciseSchema = new mongoose.Schema({
  exerciseName: {
    type: String,
    required: true,
    trim: true
  },

  exerciseType: {
    type: String,
    enum: ['repetition', 'hold'],
    required: true
  },

  rep: {
    type: Number,
    required: function () {
      return this.exerciseType === 'repetition';
    },
    min: 1
  },

  holdTime: {
    type: Number,
    required: function () {
      return this.exerciseType === 'hold';
    },
    min: 1
  },

  set: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 3
  },

  completedSets: {
    type: Number,
    default: 0,
    min: 0
  },

  targetArea: {
    type: String,
    trim: true
  },

  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },

  equipmentNeeded: {
    type: String,
    default: 'None'
  },

  aiTrackingEnabled: {
    type: Boolean,
    default: true
  },

  description: {
    type: String,
    trim: true
  },

  demoVideo: {
    type: String
  },

  image: {
    data: Buffer,
    contentType: String
  }
});

const exerciseSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      ref: 'User',
      required: true,
      lowercase: true,
      trim: true
    },

    painDataId: {
      type: String,
      required: true,
      unique: true
    },

    exercises: [innerExerciseSchema],

    progress: {
      type: Number,
      default: 0, // auto-calculated based on exercises completion
      min: 0,
      max: 100
    }
  },
  { timestamps: true }
);

// Auto-update total progress before saving
exerciseSchema.pre('save', function (next) {
  if (this.exercises.length > 0) {
    const totalSets = this.exercises.reduce((acc, ex) => acc + ex.set, 0);
    const completedSets = this.exercises.reduce((acc, ex) => acc + (ex.completedSets || 0), 0);
    this.progress = Math.min(100, Math.round((completedSets / totalSets) * 100));
  } else {
    this.progress = 0;
  }
  next();
});

module.exports = mongoose.model('Exercise', exerciseSchema);
