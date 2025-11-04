// backend/src/routes/teams.js
// backend/src/routes/teams.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const teamController = require('../controllers/teamController');

router.post('/', auth, teamController.createTeam);
router.post('/join', auth, teamController.joinTeam);
router.get('/', auth, teamController.listUserTeams);

// GET members of a team
router.get('/:id/members', auth, teamController.getTeamMembers);

// existing get team by id, etc.
router.get('/:id', auth, teamController.getTeamById);

module.exports = router;
