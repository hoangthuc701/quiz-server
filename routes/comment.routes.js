const express = require('express')
const commentControllers = require('../controllers/comment')

const router = express.Router()

const path = '/comments'
router.post('/', commentControllers.create)
router.post('/search', commentControllers.search)
router.put('/:commentId', commentControllers.update)


module.exports = {
  path,
  router
}