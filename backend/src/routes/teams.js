// backend/src/routes/teams.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const teamController = require('../controllers/teamController');

router.post('/', auth, teamController.createTeam);
router.post('/join', auth, teamController.joinTeam);
router.get('/', auth, teamController.listUserTeams);
router.get('/:id', auth, teamController.getTeamById);

module.exports = router;
