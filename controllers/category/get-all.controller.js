const joi = require('joi')
const _ = require('lodash')
const md5 = require('md5')
const COMMON_RESPONSE_CODE = require('../../constants/response-code.constants').COMMON
const USER_ROLE = require('../../constants/user.constants').USER_ROLE
const { Category: CategoryModel } = require('../../models')
const genValidationHandler = require('../../middlewares/gen-request-validation')

const validationHandler = genValidationHandler({
  query: joi.object({
    active: joi.string().trim().valid('true', 'false')
  }).unknown(false)
})

async function getAllHandler(req, res) {
  const query = {}
  if (req.query.active === 'true') query.active = true
  const categories = await CategoryModel.findAll({
    where: query,
    attributes: ['id', 'title', 'description', 'active']
  })

  return res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      categories: categories || []
    }
  })
}

module.exports = [
  validationHandler,
  getAllHandler
]