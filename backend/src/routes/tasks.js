// backend/src/routes/tasks.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const taskController = require('../controllers/taskController');

router.post('/', auth, taskController.createTask);
router.get('/', auth, taskController.listTasks);
router.get('/:id', auth, taskController.getTask);
router.patch('/:id', auth, taskController.updateTask);
router.delete('/:id', auth, taskController.deleteTask);

module.exports = router;
