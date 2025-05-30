const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Workspace = require('../models/Workspace');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Middleware to check if user is workspace admin
const isWorkspaceAdmin = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const member = workspace.members.find(m => 
      m.user.toString() === req.user._id.toString() && m.role === 'admin'
    );

    if (!member && workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    req.workspace = workspace;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all workspaces for current user
router.get('/', auth, async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    }).populate('owner', 'username email')
      .populate('members.user', 'username email');

    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new workspace
router.post('/', auth, [
  body('name').trim().notEmpty(),
  body('description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const workspace = new Workspace({
      ...req.body,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });

    await workspace.save();
    await workspace.populate('owner', 'username email');
    await workspace.populate('members.user', 'username email');

    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get workspace details
router.get('/:id', auth, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('owner', 'username email')
      .populate('members.user', 'username email');

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user has access
    const hasAccess = workspace.owner.toString() === req.user._id.toString() ||
      workspace.members.some(m => m.user._id.toString() === req.user._id.toString());

    if (!hasAccess && workspace.settings.isPrivate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update workspace
router.put('/:id', auth, isWorkspaceAdmin, [
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('settings').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = {};
    const allowedUpdates = ['name', 'description', 'settings'];
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const workspace = await Workspace.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('owner', 'username email')
     .populate('members.user', 'username email');

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete workspace
router.delete('/:id', auth, isWorkspaceAdmin, async (req, res) => {
  try {
    await Workspace.findByIdAndDelete(req.params.id);
    res.json({ message: 'Workspace deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get workspace members
router.get('/:id/members', auth, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('members.user', 'username email');

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user has access
    const hasAccess = workspace.owner.toString() === req.user._id.toString() ||
      workspace.members.some(m => m.user._id.toString() === req.user._id.toString());

    if (!hasAccess && workspace.settings.isPrivate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(workspace.members);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add member to workspace
router.post('/:id/members', auth, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is already a member
    const isMember = workspace.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );
    const isOwner = workspace.owner.toString() === req.user._id.toString();

    if (isMember || isOwner) {
      return res.status(400).json({ message: 'User is already a member of this workspace' });
    }

    // Add user to workspace members
    workspace.members.push({
      user: req.user._id,
      role: 'member',
      joinedAt: new Date()
    });

    await workspace.save();
    await workspace.populate('members.user', 'username email');

    res.json({ 
      message: 'Successfully joined workspace',
      workspace: {
        id: workspace._id,
        name: workspace.name,
        members: workspace.members
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update member role
router.put('/:id/members/:userId', auth, isWorkspaceAdmin, [
  body('role').isIn(['admin', 'member'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { role } = req.body;
    const workspace = req.workspace;

    // Don't allow changing owner's role
    if (workspace.owner.toString() === req.params.userId) {
      return res.status(400).json({ message: 'Cannot change owner\'s role' });
    }

    const memberIndex = workspace.members.findIndex(
      m => m.user.toString() === req.params.userId
    );

    if (memberIndex === -1) {
      return res.status(404).json({ message: 'Member not found' });
    }

    workspace.members[memberIndex].role = role;
    await workspace.save();
    await workspace.populate('members.user', 'username email');

    res.json(workspace.members);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove member from workspace
router.delete('/:id/members/:userId', auth, isWorkspaceAdmin, async (req, res) => {
  try {
    const workspace = req.workspace;

    // Don't allow removing the owner
    if (workspace.owner.toString() === req.params.userId) {
      return res.status(400).json({ message: 'Cannot remove workspace owner' });
    }

    workspace.members = workspace.members.filter(
      m => m.user.toString() !== req.params.userId
    );

    await workspace.save();
    await workspace.populate('members.user', 'username email');

    res.json(workspace.members);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/workspaces/:id/members
// @desc    Add a member to workspace
// @access  Private
router.post('/:id/members', auth, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is already a member
    const isMember = workspace.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );
    const isOwner = workspace.owner.toString() === req.user._id.toString();

    if (isMember || isOwner) {
      return res.status(400).json({ message: 'User is already a member of this workspace' });
    }

    // Add user to workspace members
    workspace.members.push({
      user: req.user._id,
      role: 'member',
      joinedAt: new Date()
    });

    await workspace.save();
    await workspace.populate('members.user', 'username email');

    res.json({ 
      message: 'Successfully joined workspace',
      workspace: {
        id: workspace._id,
        name: workspace.name,
        members: workspace.members
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 