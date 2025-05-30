const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Workspace = require('../models/Workspace');
const { auth } = require('../middleware/auth');

// Middleware to check if user has access to workspace
const hasWorkspaceAccess = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const hasAccess = workspace.owner.toString() === req.user._id.toString() ||
      workspace.members.some(m => m.user.toString() === req.user._id.toString());

    if (!hasAccess && workspace.settings.isPrivate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    req.workspace = workspace;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// List tasks in a workspace
router.get('/workspaces/:id/tasks', auth, hasWorkspaceAccess, async (req, res) => {
  try {
    const tasks = await Task.find({ workspace: req.params.id })
      .populate('assignee', 'username email')
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a task
router.post('/workspaces/:id/tasks', auth, hasWorkspaceAccess, [
  body('title').trim().notEmpty(),
  body('description').optional().trim(),
  body('status').optional().isIn(['todo', 'in_progress', 'review', 'done']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('assignee').optional().isMongoId(),
  body('dueDate').optional().isISO8601(),
  body('labels').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = new Task({
      ...req.body,
      workspace: req.params.id,
      createdBy: req.user._id
    });

    await task.save();
    await task.populate('assignee', 'username email');
    await task.populate('createdBy', 'username email');

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get task details
router.get('/tasks/:taskId', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('assignee', 'username email')
      .populate('createdBy', 'username email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to the workspace
    const workspace = await Workspace.findById(task.workspace);
    const hasAccess = workspace.owner.toString() === req.user._id.toString() ||
      workspace.members.some(m => m.user.toString() === req.user._id.toString());

    if (!hasAccess && workspace.settings.isPrivate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task
router.put('/tasks/:taskId', auth, [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('status').optional().isIn(['todo', 'in_progress', 'review', 'done']),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('assignee').optional().isMongoId(),
  body('dueDate').optional().isISO8601(),
  body('labels').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to the workspace
    const workspace = await Workspace.findById(task.workspace);
    const hasAccess = workspace.owner.toString() === req.user._id.toString() ||
      workspace.members.some(m => m.user.toString() === req.user._id.toString());

    if (!hasAccess && workspace.settings.isPrivate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = {};
    const allowedUpdates = ['title', 'description', 'status', 'priority', 'assignee', 'dueDate', 'labels'];
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.taskId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('assignee', 'username email')
     .populate('createdBy', 'username email');

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task
router.delete('/tasks/:taskId', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to the workspace
    const workspace = await Workspace.findById(task.workspace);
    const hasAccess = workspace.owner.toString() === req.user._id.toString() ||
      workspace.members.some(m => m.user.toString() === req.user._id.toString() && m.role === 'admin');

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await task.remove();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 