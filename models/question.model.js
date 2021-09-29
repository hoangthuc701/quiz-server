const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Question.belongsTo(models.Exercise, {
        foreignKey: 'exerciseId'
      })
    }
  }
  Question.init(
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
      no: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      content: {
        type: DataTypes.STRING,
        allowNull: false
      },
      correctAnswer: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      answer1: {
        type: DataTypes.STRING,
        allowNull: false
      },
      answer2: {
        type: DataTypes.STRING,
        allowNull: false
      },
      answer3: {
        type: DataTypes.STRING,
        allowNull: false
      },
      answer4: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'question',
    }
  );
  return Question;
};
