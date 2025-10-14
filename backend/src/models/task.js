const { DataTypes, Model } = require('sequelize');

class Task extends Model {
  static initModel(sequelize) {
    Task.init({
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('todo', 'inprogress', 'done'),
        defaultValue: 'todo'
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      assigneeId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true
      },
      teamId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true
      },
      userId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true
      },
      createdBy: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      }
    }, {
      sequelize,
      modelName: 'Task',
      tableName: 'tasks',
      timestamps: true
    });
    return Task;
  }
}

module.exports = Task;
