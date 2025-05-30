const express = require('express');
const router = express.Router();
const Whiteboard = require('../models/Whiteboard');
const Workspace = require('../models/Workspace');
const { auth } = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

// @route   GET /api/workspaces/:id/whiteboard
// @desc    Get whiteboard data for a workspace
// @access  Private
router.get('/workspaces/:id/whiteboard', auth, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is a member of the workspace
    if (!workspace.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to access this workspace' });
    }

    let whiteboard = await Whiteboard.findOne({ workspace: req.params.id })
      .populate('lastModifiedBy', 'name email')
      .populate('elements.createdBy', 'name email')
      .populate('elements.lastModifiedBy', 'name email');

    // If no whiteboard exists, create one
    if (!whiteboard) {
      whiteboard = new Whiteboard({
        workspace: req.params.id,
        elements: [],
        lastModifiedBy: req.user.id
      });
      await whiteboard.save();
    }

    res.json(whiteboard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/workspaces/:id/whiteboard
// @desc    Update whiteboard data
// @access  Private
router.post('/workspaces/:id/whiteboard', [
  auth,
  [
    check('elements').optional().isArray(),
    check('elements.*.type').optional().isIn(['rectangle', 'circle', 'line', 'text', 'image']),
    check('elements.*.x').optional().isNumeric(),
    check('elements.*.y').optional().isNumeric(),
    check('elements.*.width').optional().isNumeric(),
    check('elements.*.height').optional().isNumeric(),
    check('elements.*.fill').optional().isString(),
    check('elements.*.stroke').optional().isString(),
    check('elements.*.strokeWidth').optional().isNumeric(),
    check('elements.*.text').optional().isString(),
    check('elements.*.fontSize').optional().isNumeric(),
    check('elements.*.imageUrl').optional().isString(),
    check('background').optional().isString()
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
      return res.status(403).json({ message: 'Not authorized to modify this workspace' });
    }

    const { elements, background } = req.body;

    // Update or create whiteboard
    let whiteboard = await Whiteboard.findOne({ workspace: req.params.id });
    
    if (whiteboard) {
      // Update existing whiteboard
      if (elements) {
        whiteboard.elements = elements;
      }
      if (background) {
        whiteboard.background = background;
      }
      whiteboard.lastModifiedBy = req.user._id;
    } else {
      // Create new whiteboard
      whiteboard = new Whiteboard({
        workspace: req.params.id,
        elements: elements || [],
        background: background || '#ffffff',
        lastModifiedBy: req.user._id
      });
    }

    await whiteboard.save();
    
    // Populate references before sending response
    await whiteboard.populate('lastModifiedBy', 'name email');

    res.json(whiteboard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/whiteboard
// @desc    Create a new whiteboard
// @access  Private
router.post('/', [
  auth,
  [
    check('workspace', 'Workspace ID is required').not().isEmpty(),
    check('title', 'Title is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { workspace, title } = req.body;

    // Check if workspace exists
    const workspaceDoc = await Workspace.findById(workspace);
    if (!workspaceDoc) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is a member of the workspace
    if (!workspaceDoc.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to create whiteboard in this workspace' });
    }

    // Create new whiteboard
    const whiteboard = new Whiteboard({
      workspace,
      title,
      elements: [],
      background: '#ffffff',
      lastModifiedBy: req.user.id
    });

    await whiteboard.save();
    
    // Populate references
    await whiteboard.populate('lastModifiedBy', 'name email');

    res.json(whiteboard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/whiteboard/workspace/:workspaceId
// @desc    Get all whiteboards for a workspace
// @access  Private
router.get('/workspace/:workspaceId', auth, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is a member of the workspace
    if (!workspace.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to access this workspace' });
    }

    const whiteboards = await Whiteboard.find({ workspace: req.params.workspaceId })
      .populate('lastModifiedBy', 'name email')
      .sort({ updatedAt: -1 });

    res.json(whiteboards);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/whiteboard/:id
// @desc    Update whiteboard
// @access  Private
router.put('/:id', [
  auth,
  [
    check('title', 'Title is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const whiteboard = await Whiteboard.findById(req.params.id);
    if (!whiteboard) {
      return res.status(404).json({ message: 'Whiteboard not found' });
    }

    // Check if user is a member of the workspace
    const workspace = await Workspace.findById(whiteboard.workspace);
    if (!workspace.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to modify this whiteboard' });
    }

    const { title } = req.body;
    whiteboard.title = title;
    whiteboard.lastModifiedBy = req.user.id;

    await whiteboard.save();
    
    // Populate references
    await whiteboard.populate('lastModifiedBy', 'name email');

    res.json(whiteboard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/whiteboard/:id
// @desc    Delete whiteboard
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const whiteboard = await Whiteboard.findById(req.params.id);
    if (!whiteboard) {
      return res.status(404).json({ message: 'Whiteboard not found' });
    }

    // Check if user is a member of the workspace
    const workspace = await Workspace.findById(whiteboard.workspace);
    if (!workspace.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this whiteboard' });
    }

    await whiteboard.remove();
    res.json({ message: 'Whiteboard removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 