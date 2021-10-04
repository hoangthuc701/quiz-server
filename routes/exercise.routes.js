const express = require('express')
const exerciseControllers = require('../controllers/exercise')

const router = express.Router()

const path = '/exercises'
router.post('/', exerciseControllers.create)
router.put('/:exerciseId', exerciseControllers.update)
router.get('/:exerciseId', exerciseControllers.getOne)
router.post('/search', exerciseControllers.search)


module.exports = {
  path,
  router
}