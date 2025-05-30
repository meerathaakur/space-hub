const express = require('express');
const router = express.Router();
const Channel = require('../models/Channel');
const Message = require('../models/Message');
const Workspace = require('../models/Workspace');
const { auth } = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

// @route   GET /api/workspaces/:id/channels
// @desc    Get all channels in a workspace
// @access  Private
router.get('/workspaces/:id/channels', auth, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is a member of the workspace
    if (!workspace.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to access this workspace' });
    }

    const channels = await Channel.find({ 
      workspace: req.params.id,
      $or: [
        { isPrivate: false },
        { members: req.user.id }
      ]
    }).populate('createdBy', 'name email');

    res.json(channels);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/workspaces/:id/channels
// @desc    Create a new channel
// @access  Private
router.post('/workspaces/:id/channels', [
  auth,
  [
    check('name', 'Channel name is required').not().isEmpty(),
    check('name', 'Channel name must be between 2 and 50 characters').isLength({ min: 2, max: 50 })
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is a member of the workspace
    if (!workspace.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to create channels in this workspace' });
    }

    const { name, description, isPrivate, members } = req.body;

    // Check if channel name already exists in workspace
    const existingChannel = await Channel.findOne({ 
      workspace: req.params.id,
      name: name.toLowerCase()
    });

    if (existingChannel) {
      return res.status(400).json({ message: 'Channel with this name already exists' });
    }

    const newChannel = new Channel({
      name: name.toLowerCase(),
      description,
      workspace: req.params.id,
      createdBy: req.user.id,
      members: isPrivate ? [...members, req.user.id] : workspace.members,
      isPrivate: isPrivate || false
    });

    const channel = await newChannel.save();
    await channel.populate('createdBy', 'name email');
    
    res.json(channel);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/channels/:channelId/messages
// @desc    Get messages in a channel
// @access  Private
router.get('/channels/:channelId/messages', auth, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check if user has access to the channel
    if (channel.isPrivate && !channel.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to access this channel' });
    }

    const messages = await Message.find({ channel: req.params.channelId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('sender', 'name email')
      .populate('thread');

    res.json(messages.reverse());
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/channels/:channelId/messages
// @desc    Send a message in a channel
// @access  Private
router.post('/channels/:channelId/messages', [
  auth,
  [
    check('content', 'Message content is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const channel = await Channel.findById(req.params.channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check if user has access to the channel
    if (channel.isPrivate && !channel.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to send messages in this channel' });
    }

    const { content, attachments, thread } = req.body;

    const newMessage = new Message({
      content,
      channel: req.params.channelId,
      sender: req.user.id,
      attachments: attachments || [],
      thread: thread || null
    });

    const message = await newMessage.save();
    await message.populate('sender', 'name email');
    
    res.json(message);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 