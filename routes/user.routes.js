const express = require('express')
const userControllers = require('../controllers/user')

const router = express.Router()

const path = '/users'
router.post('/register', userControllers.register)
router.post('/login', userControllers.login)
router.post('/forget-password', userControllers.forgetPwd)
router.put('/reset-password', userControllers.resetPwd)
router.put('/update-password', userControllers.updatePwd)
router.put('/update-own-info', userControllers.updateOwnInfo)
router.get('/own-info', userControllers.getOwnInfo)
router.post('/test-auth', userControllers.testAuth)


module.exports = {
  path,
  router
}