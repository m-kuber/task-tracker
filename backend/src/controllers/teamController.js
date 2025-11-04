// backend/src/controllers/teamController.js
const { Team, TeamMember, User, Task } = require('../models');
const { nanoid } = require('nanoid');

/** helper to generate a short unique code */
function generateTeamCode() {
  return nanoid(6).toUpperCase();
}

/** POST /api/teams -> create team and add creator as admin */
exports.createTeam = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    // generate short unique code - ensure uniqueness (simple loop)
    let code;
    for (let i = 0; i < 5; i++) {
      code = generateTeamCode();
      const existing = await Team.findOne({ where: { code } });
      if (!existing) break;
      code = null;
    }
    if (!code) return res.status(500).json({ message: 'Could not generate team code' });

    const team = await Team.create({ name, code, createdBy: userId });
    await TeamMember.create({ teamId: team.id, userId, role: 'admin' });

    return res.status(201).json({ team: { id: team.id, name: team.name, code: team.code } });
  } catch (err) {
    console.error('createTeam error:', err);
    return res.status(500).json({ message: 'Server error creating team' });
  }
};

/** POST /api/teams/join -> join a team by code */
exports.joinTeam = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Team code is required' });

    const team = await Team.findOne({ where: { code } });
    if (!team) return res.status(404).json({ message: 'Invalid team code' });

    const existing = await TeamMember.findOne({ where: { teamId: team.id, userId } });
    if (existing) return res.status(400).json({ message: 'Already a member' });

    const membership = await TeamMember.create({ teamId: team.id, userId, role: 'member' });
    return res.json({ message: 'Joined', team: { id: team.id, name: team.name, code: team.code } });
  } catch (err) {
    console.error('joinTeam error:', err);
    return res.status(500).json({ message: 'Server error joining team' });
  }
};

/** GET /api/teams -> list teams user belongs to */
exports.listUserTeams = async (req, res) => {
  try {
    const userId = req.user.id;

    const memberships = await TeamMember.findAll({
      where: { userId },
      include: [{ model: Team, as: 'team', attributes: ['id', 'name', 'code', 'createdBy'] }],
    });

    const teams = memberships.map(m => ({
      id: m.team.id,
      name: m.team.name,
      code: m.team.code,
      role: m.role
    }));

    return res.json({ teams });
  } catch (err) {
    console.error('listUserTeams error:', err);
    return res.status(500).json({ message: 'Server error fetching teams' });
  }
};

/** GET /api/teams/:id -> return team + members + optional task counts */
exports.getTeamById = async (req, res) => {
  try {
    const userId = req.user.id;
    const teamId = req.params.id;

    // ensure membership
    const membership = await TeamMember.findOne({ where: { teamId, userId } });
    if (!membership) return res.status(403).json({ message: 'Not a member of this team' });

    // fetch team with member records (TeamMembers include user)
    const team = await Team.findByPk(teamId, {
      attributes: ['id', 'name', 'code', 'createdBy'],
      include: [
        {
          model: TeamMember,
          as: 'TeamMembers',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
        },
      ],
    });

    if (!team) return res.status(404).json({ message: 'Team not found' });

    // compute task counts (efficiently)
    const counts = await Task.findAll({
      where: { teamId },
      attributes: ['status', [Task.sequelize.fn('COUNT', Task.sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true
    });

    const countsObj = { todo: 0, inprogress: 0, done: 0 };
    counts.forEach(c => { if (c.status) countsObj[c.status] = Number(c.count || 0); });

    const members = (team.TeamMembers || []).map(m => ({
      id: m.user?.id || null,
      name: m.user?.name || null,
      email: m.user?.email || null,
      role: m.role
    }));

    return res.json({
      id: team.id,
      name: team.name,
      code: team.code,
      createdBy: team.createdBy,
      members,
      counts: countsObj
    });
  } catch (err) {
    console.error('getTeamById error:', err);
    return res.status(500).json({ message: 'Server error fetching team' });
  }
};

/**
 * GET /api/teams/:id/members
 */
exports.getTeamMembers = async (req, res) => {
  try {
    const teamId = Number(req.params.id);
    if (Number.isNaN(teamId)) return res.status(400).json({ message: 'Invalid team id' });

    // ensure requester is a member
    const myMembership = await TeamMember.findOne({ where: { teamId, userId: req.user.id } });
    if (!myMembership) return res.status(403).json({ message: 'Not a member' });

    const members = await TeamMember.findAll({
      where: { teamId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'ASC']]
    });

    const out = members.map(m => ({
      id: m.user?.id || null,
      name: m.user?.name || null,
      email: m.user?.email || null,
      role: m.role
    }));

    return res.json({ members: out });
  } catch (err) {
    console.error('getTeamMembers error:', err);
    return res.status(500).json({ message: 'Server error fetching members' });
  }
};