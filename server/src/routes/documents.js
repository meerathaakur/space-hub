const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const Document = require('../models/Document');
const Workspace = require('../models/Workspace');
const { auth } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Add file type restrictions if needed
    cb(null, true);
  }
});

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

// List documents in a workspace
router.get('/workspaces/:id/documents', auth, hasWorkspaceAccess, async (req, res) => {
  try {
    const documents = await Document.find({ workspace: req.params.id })
      .populate('uploadedBy', 'username email')
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload a document
router.post('/workspaces/:id/documents', auth, hasWorkspaceAccess, upload.single('file'), [
  body('name').trim().notEmpty(),
  body('description').optional().trim(),
  body('tags').optional().isArray(),
  body('isPublic').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const document = new Document({
      name: req.body.name,
      description: req.body.description,
      file: {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`,
        key: req.file.filename
      },
      workspace: req.params.id,
      uploadedBy: req.user._id,
      tags: req.body.tags || [],
      isPublic: req.body.isPublic || false
    });

    await document.save();
    await document.populate('uploadedBy', 'username email');

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get document details
router.get('/documents/:docId', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.docId)
      .populate('uploadedBy', 'username email');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user has access to the workspace
    const workspace = await Workspace.findById(document.workspace);
    const hasAccess = workspace.owner.toString() === req.user._id.toString() ||
      workspace.members.some(m => m.user.toString() === req.user._id.toString());

    if (!hasAccess && !document.isPublic && workspace.settings.isPrivate) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete document
router.delete('/documents/:docId', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.docId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user has access to the workspace
    const workspace = await Workspace.findById(document.workspace);
    const hasAccess = workspace.owner.toString() === req.user._id.toString() ||
      workspace.members.some(m => m.user.toString() === req.user._id.toString() && m.role === 'admin');

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete the file from storage
    const fs = require('fs');
    const filePath = path.join(__dirname, '../../uploads', document.file.key);
    fs.unlinkSync(filePath);

    await document.remove();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 