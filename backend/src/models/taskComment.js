const { DataTypes, Model } = require('sequelize');

class TaskComment extends Model {
  static initModel(sequelize) {
    TaskComment.init({
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      taskId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      },
      userId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    }, {
      sequelize,
      modelName: 'TaskComment',
      tableName: 'task_comments',
      timestamps: true
    });
    return TaskComment;
  }
}

module.exports = TaskComment;
