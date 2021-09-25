const express = require('express')
const testControllers = require('../controllers/test')
const path = '/test'
const router = express.Router()

router.get('/hello', testControllers.hello)
router.get('/goodbye', testControllers.goodbye)


module.exports = {
  path,
  router
}