const { TaskComment, Task, TeamMember } = require('../models');

async function ensureTeamMember(userId, teamId) {
  const m = await TeamMember.findOne({ where: { userId, teamId } });
  return !!m;
}

exports.addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { body } = req.body;
    if (!body) return res.status(400).json({ message: 'Comment required' });

    const task = await Task.findByPk(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (!await ensureTeamMember(req.user.id, task.teamId)) {
      return res.status(403).json({ message: 'Not a member' });
    }

    const comment = await TaskComment.create({ taskId, userId: req.user.id, body });
    res.status(201).json({ comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.listComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findByPk(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (!await ensureTeamMember(req.user.id, task.teamId)) {
      return res.status(403).json({ message: 'Not a member' });
    }

    const comments = await TaskComment.findAll({ where: { taskId }, order: [['createdAt', 'ASC']] });
    res.json({ comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
