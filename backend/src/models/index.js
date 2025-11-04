// backend/src/models/index.js
const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const User = require('./user');
const Team = require('./team');
const TeamMember = require('./teamMember');
const Task = require('./task');
const TaskComment = require('./taskComment');
const TaskAttachment = require('./taskAttachment');

const models = {};

// Initialize models
models.User = User.initModel(sequelize);
models.Team = Team.initModel(sequelize);
models.TeamMember = TeamMember.initModel(sequelize);
models.Task = Task.initModel(sequelize);
models.TaskComment = TaskComment.initModel(sequelize);
models.TaskAttachment = TaskAttachment.initModel(sequelize);

// Associations

// Team creator
models.User.hasMany(models.Team, { foreignKey: 'createdBy', as: 'createdTeams' });
models.Team.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });

// Many-to-many: User <-> Team via TeamMember
models.User.belongsToMany(models.Team, { through: models.TeamMember, foreignKey: 'userId', as: 'teams' });
models.Team.belongsToMany(models.User, { through: models.TeamMember, foreignKey: 'teamId', as: 'members' });

// TeamMember relations
models.Team.hasMany(models.TeamMember, { foreignKey: 'teamId', as: 'TeamMembers', onDelete: 'CASCADE' });
models.TeamMember.belongsTo(models.Team, { foreignKey: 'teamId', as: 'team' });

models.User.hasMany(models.TeamMember, { foreignKey: 'userId', as: 'UserTeamMemberships' });
models.TeamMember.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });

// Team -> Task
models.Team.hasMany(models.Task, { foreignKey: 'teamId', as: 'tasks', onDelete: 'CASCADE' });
models.Task.belongsTo(models.Team, { foreignKey: 'teamId', as: 'team' });

// Tasks and Users
models.User.hasMany(models.Task, { foreignKey: 'userId', as: 'PersonalTasks' });
models.User.hasMany(models.Task, { foreignKey: 'assigneeId', as: 'AssignedTasks' });
models.User.hasMany(models.Task, { foreignKey: 'createdBy', as: 'CreatedTasks' });

models.Task.belongsTo(models.User, { foreignKey: 'userId', as: 'Owner' });
models.Task.belongsTo(models.User, { foreignKey: 'assigneeId', as: 'Assignee' });
models.Task.belongsTo(models.User, { foreignKey: 'createdBy', as: 'Creator' });

// Task -> TaskComment
models.Task.hasMany(models.TaskComment, { foreignKey: 'taskId', as: 'comments', onDelete: 'CASCADE' });
models.TaskComment.belongsTo(models.Task, { foreignKey: 'taskId', as: 'task' });

// TaskAttachment -> Task
models.Task.hasMany(models.TaskAttachment, { foreignKey: 'taskId', as: 'attachments', onDelete: 'CASCADE' });
models.TaskAttachment.belongsTo(models.Task, { foreignKey: 'taskId', as: 'task' });

// TaskAttachment -> User (uploader)
models.User.hasMany(models.TaskAttachment, { foreignKey: 'uploadedBy', as: 'uploads' });
models.TaskAttachment.belongsTo(models.User, { foreignKey: 'uploadedBy', as: 'uploader' });

// TaskComment -> User
models.User.hasMany(models.TaskComment, { foreignKey: 'userId', as: 'comments' });
models.TaskComment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  Sequelize,
  User: models.User,
  Team: models.Team,
  TeamMember: models.TeamMember,
  Task: models.Task,
  TaskComment: models.TaskComment,
  TaskAttachment: models.TaskAttachment,
};
