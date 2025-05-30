const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const Workspace = require('../models/Workspace');
const { auth } = require('../middleware/auth');

// @route   GET /api/workspaces/:id/activities
// @desc    Get recent activity for a workspace
// @access  Private
router.get('/workspaces/:id/activities', auth, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is a member of the workspace
    if (!workspace.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to access this workspace' });
    }

    // Get query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get activities with pagination
    const activities = await Activity.find({ workspace: req.params.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .populate({
        path: 'target',
        select: 'title content name',
        options: { lean: true }
      });

    // Get total count for pagination
    const total = await Activity.countDocuments({ workspace: req.params.id });

    res.json({
      activities,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 