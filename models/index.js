const _ = require('lodash')
const filehound = require('filehound')
const Sequelize = require('sequelize')
const config = require('config')

const dbConfig = config.get('db')

const sequelize = new Sequelize(
  dbConfig.db,
  dbConfig.user,
  dbConfig.password,
  dbConfig.config
);

async function load() {
  const modelFilePaths = await filehound.create()
  .path(__dirname)
  .ext('.js')
  .not()
  .glob('index.js')
  .find()
  _.forEach(modelFilePaths, (modelFilePath) => {
    const model = require(modelFilePath)(sequelize, Sequelize.DataTypes)
    exports[_.upperFirst(model.name)] = model
  })

  _.forEach(exports, (model) => {
    model.associate && model.associate(exports)
  })

  sequelize.sync()
}

exports.sequelize = sequelize
exports.Sequelize = Sequelize
exports.load = load