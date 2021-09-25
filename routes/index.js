const _ = require('lodash')
const filehound = require('filehound')

exports.load = async (app) => {
  const routeFilePaths = await filehound.create()
    .path(__dirname)
    .ext('.js')
    .not()
    .glob('index.js')
    .find()
  _.forEach(routeFilePaths, (routeFilePath) => {
    const route = require(routeFilePath)
    app.use(route.path, route.router)
  })
}