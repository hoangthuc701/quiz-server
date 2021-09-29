const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ExerciseTag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ExerciseTag.belongsTo(models.Exercise, {
        foreignKey: 'exerciseId'
      })
      ExerciseTag.belongsTo(models.Tag, {
        foreignKey: 'tagId'
      })
    }
  }
  ExerciseTag.init(
    {
      exerciseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      tagId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
    },
    {
      sequelize,
      modelName: 'exerciseTag',
    }
  );
  return ExerciseTag;
};
