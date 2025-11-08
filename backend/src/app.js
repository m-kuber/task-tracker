// backend/src/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/teams');
const taskRoutes = require('./routes/tasks');
const commentRoutes = require('./routes/comments');

const app = express();

const allowedOrigins = [
  "http://cc-cp-frontend.s3-website.ap-south-1.amazonaws.com",
  "https://d3sx0m1m1nstvk.cloudfront.net",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan('dev'));

// serve uploaded files (public)
const uploadsPath = path.join(__dirname, '..', 'uploads'); // backend/uploads
app.use('/uploads', express.static(uploadsPath));

app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/tasks', taskRoutes); // mounted here
app.use('/api', commentRoutes); // comments: /api/tasks/:taskId/comments etc.

app.get('/', (req, res) => res.json({ message: 'Task Tracker API' }));

module.exports = app;
