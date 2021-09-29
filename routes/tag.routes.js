const express = require('express')
const tagControllers = require('../controllers/tag')

const router = express.Router()

const path = '/tags'
router.post('/', tagControllers.create)
router.put('/:tagId', tagControllers.update)
router.get('/', tagControllers.getAll)


module.exports = {
  path,
  router
}