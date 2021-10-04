const express = require('express')
const questionControllers = require('../controllers/question')

const router = express.Router()

const path = '/questions'
router.post('/', questionControllers.create)
router.put('/:questionId', questionControllers.update)
router.delete('/:questionId', questionControllers.delete)


module.exports = {
  path,
  router
}