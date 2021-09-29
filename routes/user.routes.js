const express = require('express')
const userControllers = require('../controllers/user')

const router = express.Router()

const path = '/users'
router.post('/register', userControllers.register)
router.post('/login', userControllers.login)
router.post('/test-auth', userControllers.testAuth)


module.exports = {
  path,
  router
}