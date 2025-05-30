const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Workspace = require('../models/Workspace');
const { auth } = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// @route   GET /api/workspaces/:id/events
// @desc    Get all events for a workspace
// @access  Private
router.get('/:id/events', auth, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is a member of the workspace
    const isMember = workspace.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );
    const isOwner = workspace.owner.toString() === req.user._id.toString();

    if (!isMember && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to access this workspace' });
    }

    const events = await Event.find({ workspace: req.params.id })
      .populate('creator', 'name email')
      .populate('attendees', 'name email')
      .sort({ start: 1 });

    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ 
      message: 'Server Error',
      error: err.message 
    });
  }
});

// @route   POST /api/workspaces/:id/events
// @desc    Create a new event
// @access  Private
router.post('/:id/events', [
  auth,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('start', 'Start date is required').not().isEmpty(),
    check('end', 'End date is required').not().isEmpty()
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
    const isMember = workspace.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );
    const isOwner = workspace.owner.toString() === req.user._id.toString();

    if (!isMember && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to create events in this workspace' });
    }

    const {
      title,
      description,
      start,
      end,
      allDay,
      attendees,
      location,
      color,
      recurring,
      recurringPattern,
      recurringEndDate
    } = req.body;

    // Create new event
    const newEvent = new Event({
      title,
      description,
      start,
      end,
      allDay,
      workspace: req.params.id,
      creator: req.user._id,
      attendees: [], // Initialize as empty array
      location,
      color,
      recurring,
      recurringPattern,
      recurringEndDate
    });

    // If attendees are provided, validate and add them
    if (attendees && Array.isArray(attendees)) {
      // Filter out any invalid ObjectIds
      const validAttendeeIds = attendees.filter(id => mongoose.Types.ObjectId.isValid(id));
      newEvent.attendees = validAttendeeIds;
    }

    const event = await newEvent.save();
    await event.populate('creator', 'name email');
    await event.populate('attendees', 'name email');

    res.json(event);
  } catch (err) {
    console.error('Error creating event:', err);
    if (err.message === 'End date must be after start date') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ 
      message: 'Server Error',
      error: err.message 
    });
  }
});

// @route   PUT /api/workspaces/:id/events/:eventId
// @desc    Update an event
// @access  Private
router.put('/:id/events/:eventId', [
  auth,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('start', 'Start date is required').not().isEmpty(),
    check('end', 'End date is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is a member of the workspace
    const workspace = await Workspace.findById(event.workspace);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const isMember = workspace.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );
    const isOwner = workspace.owner.toString() === req.user._id.toString();

    if (!isMember && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to modify this event' });
    }

    const {
      title,
      description,
      start,
      end,
      allDay,
      attendees,
      location,
      color,
      recurring,
      recurringPattern,
      recurringEndDate
    } = req.body;

    // Update event fields
    event.title = title;
    event.description = description;
    event.start = start;
    event.end = end;
    event.allDay = allDay;
    event.attendees = attendees || event.attendees;
    event.location = location;
    event.color = color;
    event.recurring = recurring;
    event.recurringPattern = recurringPattern;
    event.recurringEndDate = recurringEndDate;

    await event.save();
    await event.populate('creator', 'name email');
    await event.populate('attendees', 'name email');

    res.json(event);
  } catch (err) {
    console.error('Error updating event:', err);
    if (err.message === 'End date must be after start date') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ 
      message: 'Server Error',
      error: err.message 
    });
  }
});

// @route   DELETE /api/workspaces/:id/events/:eventId
// @desc    Delete an event
// @access  Private
router.delete('/:id/events/:eventId', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is a member of the workspace
    const workspace = await Workspace.findById(event.workspace);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const isMember = workspace.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );
    const isOwner = workspace.owner.toString() === req.user._id.toString();

    if (!isMember && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await Event.deleteOne({ _id: req.params.eventId });
    res.json({ message: 'Event removed' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ 
      message: 'Server Error',
      error: err.message 
    });
  }
});

// @route   POST /api/events
// @desc    Create a new event
// @access  Private
router.post('/', [
  auth,
  [
    check('workspace', 'Workspace ID is required').not().isEmpty(),
    check('title', 'Title is required').not().isEmpty(),
    check('startTime', 'Start time is required').not().isEmpty(),
    check('endTime', 'End time is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { workspace, title, description, startTime, endTime, location } = req.body;

    // Check if workspace exists
    const workspaceDoc = await Workspace.findById(workspace);
    if (!workspaceDoc) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is a member of the workspace
    const isMember = workspaceDoc.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );
    const isOwner = workspaceDoc.owner.toString() === req.user._id.toString();

    if (!isMember && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to create events in this workspace' });
    }

    // Create new event
    const event = new Event({
      workspace,
      title,
      description,
      startTime,
      endTime,
      location,
      createdBy: req.user._id
    });

    await event.save();
    await event.populate('createdBy', 'name email');

    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/events/workspace/:workspaceId
// @desc    Get all events for a workspace
// @access  Private
router.get('/workspace/:workspaceId', auth, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is a member of the workspace
    const isMember = workspace.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );
    const isOwner = workspace.owner.toString() === req.user._id.toString();

    if (!isMember && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to view events in this workspace' });
    }

    const events = await Event.find({ workspace: req.params.workspaceId })
      .populate('createdBy', 'name email')
      .sort({ startTime: 1 });

    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/events/:id
// @desc    Update an event
// @access  Private
router.put('/:id', [
  auth,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('startTime', 'Start time is required').not().isEmpty(),
    check('endTime', 'End time is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is a member of the workspace
    const workspace = await Workspace.findById(event.workspace);
    const isMember = workspace.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );
    const isOwner = workspace.owner.toString() === req.user._id.toString();

    if (!isMember && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to modify this event' });
    }

    const { title, description, startTime, endTime, location } = req.body;

    // Update event
    event.title = title;
    event.description = description;
    event.startTime = startTime;
    event.endTime = endTime;
    event.location = location;

    await event.save();
    await event.populate('createdBy', 'name email');

    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is a member of the workspace
    const workspace = await Workspace.findById(event.workspace);
    const isMember = workspace.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );
    const isOwner = workspace.owner.toString() === req.user._id.toString();

    if (!isMember && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await event.remove();
    res.json({ message: 'Event removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 