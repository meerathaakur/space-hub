const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  file: {
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    key: String // For cloud storage reference
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for faster queries
documentSchema.index({ workspace: 1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ tags: 1 });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document; 