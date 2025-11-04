// backend/src/routes/tasks.js
// backend/src/routes/tasks.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const taskController = require('../controllers/taskController');
const { upload } = require('../middleware/upload');

// existing task routes
router.post('/', auth, taskController.createTask);
router.get('/', auth, taskController.listTasks);
router.get('/:id', auth, taskController.getTask);
router.patch('/:id', auth, taskController.updateTask);
router.delete('/:id', auth, taskController.deleteTask);

// attachments
// upload single file field name: 'file'
router.post('/:id/attachments', auth, upload.single('file'), taskController.uploadAttachment);
router.get('/:id/attachments', auth, taskController.listAttachments);

// delete attachment by attachment id
router.delete('/attachments/:id', auth, taskController.deleteAttachment);

module.exports = router;