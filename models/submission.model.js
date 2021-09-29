const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Submission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Submission.belongsTo(models.Exercise, {
        foreignKey: 'exerciseId'
      })
      Submission.belongsTo(models.User, {
        foreignKey: 'userId'
      })
    }
  }
  Submission.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      exerciseId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      nQuestion: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      nCorrectAnswer: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'submission',
    }
  );
  return Submission;
};
