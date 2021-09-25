require('express-async-errors')
const _ = require('lodash')
const express = require('express')
const cors = require('cors')
const compression = require('compression')
require('dotenv').config()
const config = require('config')

config.getSafe = function(key) {
  try {
    return config.get(key)
  } catch (err){
    
  }
}

exports.start = async function () {
  // connect to db server
  await require('./models').load()

  // create express app - apply glocal middleware
  const app = express()
  if (config.getSafe('compression.enable')) app.use(compression(config.getSafe('compression.opts')))
  if (config.getSafe('cors.enable')) app.use(cors(config.getSafe('cors.opts')))
  app.use(express.json(config.getSafe('bodyParser.json')))
  app.use(express.urlencoded(config.getSafe('bodyParser.urlencoded')))
  app.disable('x-powered-by')

  // load routes
  await require('./routes').load(app)

  // error handle
  app.use((req, res) => {
    res.status(404).json({
      message: 'Endpoint not found!',
    })
  })
  app.use(function (err, req, res, next) {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return res.status(400).json({
        message: 'Invalid input!',
      })
    }
    console.error(err.stack || err.message)
    res.status(500).json({
      message: 'Unknow error!',
    })
  })

  // start server
  await new Promise((res) => {
    app.listen(config.getSafe('server.port'), () => {
      console.info(`Server is running @ PORT: ${config.getSafe('server.port')}`)
      res()
    })
  })
}
