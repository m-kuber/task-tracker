// backend/src/models/index.js
const Sequelize = require('sequelize');
const sequelize = require('../config/database');

// import model definition files (they must export initModel)
const User = require('./user');
const Team = require('./team');
const TeamMember = require('./teamMember');
const Task = require('./task');
const TaskComment = require('./taskComment');

const models = {};

// Initialize models
models.User = User.initModel(sequelize);
models.Team = Team.initModel(sequelize);
models.TeamMember = TeamMember.initModel(sequelize);
models.Task = Task.initModel(sequelize);
models.TaskComment = TaskComment.initModel(sequelize);

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

// TaskComment -> User
models.User.hasMany(models.TaskComment, { foreignKey: 'userId', as: 'comments' });
models.TaskComment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });

// export initialized models
module.exports = {
  sequelize,
  Sequelize,
  User: models.User,
  Team: models.Team,
  TeamMember: models.TeamMember,
  Task: models.Task,
  TaskComment: models.TaskComment,
};
