const express = require('express')
const submissionControllers = require('../controllers/submission')

const router = express.Router()

const path = '/submissions'
router.post('/start', submissionControllers.start)
router.post('/submit', submissionControllers.submit)
router.post('/search', submissionControllers.search)


module.exports = {
  path,
  router
}