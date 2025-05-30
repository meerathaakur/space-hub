const mongoose = require('mongoose');

const whiteboardSchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  elements: [{
    type: {
      type: String,
      required: true,
      enum: ['rectangle', 'circle', 'line', 'text', 'image']
    },
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    color: String,
    text: String,
    fontSize: Number,
    points: [{
      x: Number,
      y: Number
    }],
    imageUrl: String,
    rotation: Number,
    opacity: Number,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  background: {
    type: String,
    default: '#ffffff'
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster queries
whiteboardSchema.index({ workspace: 1 });

module.exports = mongoose.model('Whiteboard', whiteboardSchema); 