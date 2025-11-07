// backend/src/routes/tasks.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { upload } = require('../middleware/upload');
const taskController = require('../controllers/taskController');

// Task CRUD
router.post('/', authMiddleware, taskController.createTask);
router.get('/', authMiddleware, taskController.listTasks);
router.patch('/:id', authMiddleware, taskController.updateTask);
router.delete('/:id', authMiddleware, taskController.deleteTask);

// Attachments
router.post('/:id/attachments', authMiddleware, upload.single('file'), taskController.uploadAttachment);
router.get('/:id/attachments', authMiddleware, taskController.listAttachments);
router.delete('/attachments/:id', authMiddleware, taskController.deleteAttachment);

module.exports = router;
