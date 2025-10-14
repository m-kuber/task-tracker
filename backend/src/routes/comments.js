const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');

router.post('/tasks/:taskId/comments', auth, commentController.addComment);
router.get('/tasks/:taskId/comments', auth, commentController.listComments);

module.exports = router;
