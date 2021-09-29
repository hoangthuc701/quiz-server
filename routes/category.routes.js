const express = require('express')
const categoryControllers = require('../controllers/category')

const router = express.Router()

const path = '/categories'
router.post('/', categoryControllers.create)
router.put('/:categoryId', categoryControllers.update)
router.get('/', categoryControllers.getAll)


module.exports = {
  path,
  router
}