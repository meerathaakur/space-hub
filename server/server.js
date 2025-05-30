require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const workspaceRoutes = require('./src/routes/workspaces');
const taskRoutes = require('./src/routes/tasks');
const documentRoutes = require('./src/routes/documents');
const channelRoutes = require('./src/routes/channels');
const whiteboardRoutes = require('./src/routes/whiteboard');
const activityRoutes = require('./src/routes/activities');
const eventRoutes = require('./src/routes/events');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api', taskRoutes);
app.use('/api', documentRoutes);
app.use('/api', channelRoutes);
app.use('/api/workspaces', whiteboardRoutes);
app.use('/api/workspaces', activityRoutes);
app.use('/api/workspaces', eventRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/space-hub', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
