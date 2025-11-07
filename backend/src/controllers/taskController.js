// backend/src/controllers/taskController.js

const fs = require('fs');
const path = require('path');
const { Task, Team, TeamMember, TaskAttachment, User } = require('../models');

// ✅ Create a new task
async function createTask(req, res) {
  try {
    const { title, description, status, dueDate, teamId } = req.body;
    const userId = req.user.id;

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      dueDate,
      userId,
      createdBy: userId,
      teamId: teamId || null,
    });

    res.status(201).json({ task });
  } catch (err) {
    console.error('createTask error:', err);
    res.status(500).json({ message: 'Server error creating task' });
  }
}

// ✅ List all tasks (personal or team-based)
async function listTasks(req, res) {
  try {
    const { teamId } = req.query;
    const userId = req.user.id;

    let tasks;
    if (teamId) {
      // Team tasks
      const team = await Team.findByPk(teamId);
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }

      // Ensure user is a team member
      const member = await TeamMember.findOne({ where: { teamId, userId } });
      if (!member && team.adminId !== userId) {
        return res.status(403).json({ message: 'Not authorized to view team tasks' });
      }

      tasks = await Task.findAll({
        where: { teamId },
        include: [{ model: TaskAttachment, as: 'attachments' }]
      });
    } else {
      // Personal tasks
      tasks = await Task.findAll({
        where: { userId, teamId: null },
        include: [{ model: TaskAttachment, as: 'attachments' }]
      });
    }

    res.json({ tasks });
  } catch (err) {
    console.error('listTasks error:', err);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
}

// ✅ Update a task
async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, status, dueDate } = req.body;

    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Check if user has permission to edit
    if (task.teamId) {
      const team = await Team.findByPk(task.teamId);
      const member = await TeamMember.findOne({ where: { teamId: team.id, userId } });
      if (!member && team.createdBy !== userId) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }
    } else if (task.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    await task.update({ title, description, status, dueDate });
    res.json({ task });
  } catch (err) {
    console.error('updateTask error:', err);
    res.status(500).json({ message: 'Server error updating task' });
  }
}

// ✅ Delete a task
async function deleteTask(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Check permissions (admin or creator)
    if (task.teamId) {
      const team = await Team.findByPk(task.teamId);
      if (team.createdBy !== userId) {
        return res.status(403).json({ message: "You don't have the privileges to delete tasks" });
      }
    } else if (task.userId !== userId) {
      return res.status(403).json({ message: "You don't have the privileges to delete tasks" });
    }

    await task.destroy();
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('deleteTask error:', err);
    res.status(500).json({ message: 'Server error deleting task' });
  }
}

// ✅ Upload file attachment
async function uploadAttachment(req, res) {
  try {
    const { id } = req.params; // Task ID
    const userId = req.user.id;

    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Permission check
    if (task.teamId) {
      const team = await Team.findByPk(task.teamId);
      const member = await TeamMember.findOne({ where: { teamId: team.id, userId } });
      if (!member && team.createdBy !== userId) {
        return res.status(403).json({ message: 'Not authorized to upload files' });
      }
    } else if (task.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to upload files' });
    }

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Store relative path for file serving (uploads/filename.ext)
    const relativePath = path.join('uploads', req.file.filename).replace(/\\/g, '/');

    const attachment = await TaskAttachment.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: relativePath,
      taskId: id,
      uploadedBy: userId,
    });

    res.status(201).json({ attachment });
  } catch (err) {
    console.error('uploadAttachment error:', err && err.stack ? err.stack : err);
    res.status(500).json({ message: 'Server error uploading attachment' });
  }
}

// ✅ List all attachments for a task
async function listAttachments(req, res) {
  try {
    const { id } = req.params; // Task ID
    const attachments = await TaskAttachment.findAll({ where: { taskId: id } });
    res.json({ attachments });
  } catch (err) {
    console.error('listAttachments error:', err);
    res.status(500).json({ message: 'Server error listing attachments' });
  }
}

// ✅ Delete an attachment
async function deleteAttachment(req, res) {
  try {
    const { id } = req.params; // Attachment ID

    const attach = await TaskAttachment.findByPk(id);
    if (!attach) return res.status(404).json({ message: 'Attachment not found' });

    // Delete file physically
    const filePath = path.resolve(process.cwd(), attach.path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await attach.destroy();
    res.json({ message: 'Attachment deleted' });
  } catch (err) {
    console.error('deleteAttachment error:', err);
    res.status(500).json({ message: 'Server error deleting attachment' });
  }
}

module.exports = {
  createTask,
  listTasks,
  updateTask,
  deleteTask,
  uploadAttachment,
  listAttachments,
  deleteAttachment,
};
