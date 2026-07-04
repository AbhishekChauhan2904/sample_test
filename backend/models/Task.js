const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true
    },
    inputText: {
      type: String,
      required: [true, 'Input text is required']
    },
    operationType: {
      type: String,
      required: true,
      enum: ['UPPERCASE', 'LOWERCASE', 'REVERSE', 'WORD_COUNT']
    },
    status: {
      type: String,
      enum: ['PENDING', 'RUNNING', 'SUCCESS', 'FAILED'],
      default: 'PENDING',
      index: true
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    logs: [
      {
        message: String,
        timestamp: { type: Date, default: Date.now }
      }
    ],
    startedAt: Date,
    completedAt: Date
  },
  { timestamps: true }
);
taskSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);
