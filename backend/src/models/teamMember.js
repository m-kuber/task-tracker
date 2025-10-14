const { DataTypes, Model } = require('sequelize');

class TeamMember extends Model {
  static initModel(sequelize) {
    TeamMember.init(
      {
        id: {
          type: DataTypes.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        teamId: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,
        },
        userId: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,
        },
        role: {
          type: DataTypes.ENUM('member', 'admin'),
          defaultValue: 'member',
        },
      },
      {
        sequelize,
        modelName: 'TeamMember',
        tableName: 'team_members',
        timestamps: true,
      }
    );
    return TeamMember;
  }
}

module.exports = TeamMember;
