// backend/src/models/taskAttachment.js
const { DataTypes, Model } = require('sequelize');

class TaskAttachment extends Model {
  static initModel(sequelize) {
    TaskAttachment.init({
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      filename: {               // stored filename on disk
        type: DataTypes.STRING,
        allowNull: false
      },
      originalName: {           // original uploaded filename
        type: DataTypes.STRING,
        allowNull: false
      },
      mimeType: {
        type: DataTypes.STRING,
        allowNull: true
      },
      size: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true
      },
      path: {                   // relative path e.g. uploads/xxxx.png
        type: DataTypes.STRING,
        allowNull: false
      },
      taskId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      },
      uploadedBy: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false
      }
    }, {
      sequelize,
      modelName: 'TaskAttachment',
      tableName: 'task_attachments',
      timestamps: true,
      indexes: [{ fields: ['taskId'] }, { fields: ['uploadedBy'] }]
    });

    return TaskAttachment;
  }
}

module.exports = TaskAttachment;
