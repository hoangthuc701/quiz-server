const express = require('express')
const feedbackControllers = require('../controllers/feedback')

const router = express.Router()

const path = '/feedbacks'
router.post('/', feedbackControllers.create)


module.exports = {
  path,
  router
}