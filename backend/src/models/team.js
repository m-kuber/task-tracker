const { DataTypes, Model } = require('sequelize');

class Team extends Model {
  static initModel(sequelize) {
    Team.init(
      {
        id: {
          type: DataTypes.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        code: {
          type: DataTypes.STRING(10),
          allowNull: false,
          unique: true,
        },
        createdBy: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'Team',
        tableName: 'teams',
        timestamps: true,
      }
    );
    return Team;
  }
}

module.exports = Team;
