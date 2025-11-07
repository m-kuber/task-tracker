// backend/src/routes/teams.js
// backend/src/routes/teams.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const teamController = require('../controllers/teamController');

router.post('/', authMiddleware, teamController.createTeam);
router.post('/join', authMiddleware, teamController.joinTeam);
router.get('/', authMiddleware, teamController.listUserTeams);

// DELETE routes should come before GET routes with similar patterns
// Remove a member from a team (admin only)
router.delete('/:teamId/members/:userId', authMiddleware, teamController.removeTeamMember);

// Delete a team (creator only)
router.delete('/:teamId', authMiddleware, teamController.deleteTeam);

// GET members of a team
router.get('/:id/members', authMiddleware, teamController.getTeamMembers);

// Get team by id
router.get('/:id', authMiddleware, teamController.getTeamById);

module.exports = router;
