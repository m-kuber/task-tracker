// backend/src/controllers/taskController.js
const { Task, TeamMember } = require('../models');

async function ensureTeamMember(userId, teamId) {
  if (!teamId) return false;
  const m = await TeamMember.findOne({ where: { userId, teamId } });
  return !!m;
}

/**
 * POST /api/tasks
 * If body.teamId provided -> create team task (requires membership)
 * If no teamId -> create personal task owned by req.user.id
 */
exports.createTask = async (req, res) => {
  try {
    const { title, description, teamId, assigneeId, dueDate, priority } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    // If team task, verify membership
    if (teamId) {
      const isMember = await ensureTeamMember(req.user.id, teamId);
      if (!isMember) return res.status(403).json({ message: 'Not a member of the team' });
      // If assignee provided, ensure assignee is a team member
      if (assigneeId) {
        const aMember = await ensureTeamMember(assigneeId, teamId);
        if (!aMember) return res.status(400).json({ message: 'Assignee must be a team member' });
      }
    }

    const task = await Task.create({
      title,
      description: description || null,
      status: 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      assigneeId: assigneeId || null,
      teamId: teamId || null,
      userId: teamId ? null : req.user.id, // personal owner if not a team task
      createdBy: req.user.id
    });

    res.status(201).json({ task });
  } catch (err) {
    console.error('createTask error:', err);
    res.status(500).json({ message: 'Server error creating task' });
  }
};

/**
 * GET /api/tasks
 * Query: teamId=... (returns team tasks if member)
 * If no teamId => returns personal tasks for current user
 */
exports.listTasks = async (req, res) => {
  try {
    // Accept both "teamId" and "team_id" just in case frontend used different naming
    const rawTeamId = req.query.teamId ?? req.query.team_id;
    const status = req.query.status;

    const where = {};

    if (rawTeamId !== undefined && rawTeamId !== null && rawTeamId !== '') {
      // Parse integer, defend against string / bad values
      const teamId = Number.parseInt(rawTeamId, 10);
      if (Number.isNaN(teamId)) {
        return res.status(400).json({ message: 'Invalid teamId' });
      }

      // Check membership: only allow listing team tasks if requester is team member
      const isMember = await TeamMember.findOne({
        where: { teamId, userId: req.user.id }
      });
      if (!isMember) return res.status(403).json({ message: 'Not a member of the team' });

      where.teamId = teamId;
    } else {
      // No teamId -> personal tasks only
      where.userId = req.user.id;
    }

    if (status) where.status = status;

    const tasks = await Task.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    return res.json({ tasks });
  } catch (err) {
    console.error('listTasks error:', err);
    return res.status(500).json({ message: 'Server error listing tasks' });
  }
};

/**
 * GET /api/tasks/:id
 */
exports.getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Team task -> ensure membership
    if (task.teamId) {
      if (!(await ensureTeamMember(req.user.id, task.teamId))) {
        return res.status(403).json({ message: 'Not a member of the team' });
      }
    } else {
      // Personal -> only owner/creator allowed
      if (task.userId !== req.user.id && task.createdBy !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    res.json({ task });
  } catch (err) {
    console.error('getTask error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * PATCH /api/tasks/:id
 */
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.teamId) {
      if (!(await ensureTeamMember(req.user.id, task.teamId))) {
        return res.status(403).json({ message: 'Not a member' });
      }
      if (updates.assigneeId && !(await ensureTeamMember(updates.assigneeId, task.teamId))) {
        return res.status(400).json({ message: 'Assignee must be a team member' });
      }
    } else {
      // personal task: owner/creator only
      if (task.userId !== req.user.id && task.createdBy !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update personal task' });
      }
    }

    await task.update(updates);
    res.json({ task });
  } catch (err) {
    console.error('updateTask error:', err);
    res.status(500).json({ message: 'Server error updating task' });
  }
};

/**
 * DELETE /api/tasks/:id
 */
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (task.teamId) {
      const member = await TeamMember.findOne({ where: { teamId: task.teamId, userId: req.user.id } });
      if (!member) return res.status(403).json({ message: 'Not a member' });
      if (task.createdBy !== req.user.id && member.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to delete' });
      }
    } else {
      if (task.userId !== req.user.id && task.createdBy !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to delete personal task' });
      }
    }

    await task.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('deleteTask error:', err);
    res.status(500).json({ message: 'Server error deleting task' });
  }
};
