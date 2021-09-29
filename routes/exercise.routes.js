const express = require('express')
const exerciseControllers = require('../controllers/exercise')

const router = express.Router()

const path = '/exercises'
router.post('/', exerciseControllers.create)


module.exports = {
  path,
  router
}