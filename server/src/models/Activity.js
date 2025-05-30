const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'task_created',
      'task_updated',
      'task_completed',
      'document_created',
      'document_updated',
      'message_sent',
      'channel_created',
      'member_joined',
      'member_left',
      'whiteboard_updated'
    ]
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  target: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetModel'
  },
  targetModel: {
    type: String,
    enum: ['Task', 'Document', 'Message', 'Channel', 'Whiteboard']
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for faster queries
activitySchema.index({ workspace: 1, createdAt: -1 });
activitySchema.index({ user: 1 });
activitySchema.index({ target: 1 });

module.exports = mongoose.model('Activity', activitySchema); 