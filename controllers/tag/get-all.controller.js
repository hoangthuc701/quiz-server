const joi = require('joi')
const _ = require('lodash')
const md5 = require('md5')
const COMMON_RESPONSE_CODE = require('../../constants/response-code.constants').COMMON
const USER_ROLE = require('../../constants/user.constants').USER_ROLE
const { Category: CategoryModel, Tag: TagModel } = require('../../models')
const genValidationHandler = require('../../middlewares/gen-request-validation')

const validationHandler = genValidationHandler({
  query: joi.object({
    getInactive: joi.string().trim().valid('true', 'false')
  }).unknown(false)
})

async function getAllHandler(req, res) {
  const query = { active: true }
  if (req.query.getInactive === 'true') delete query.active

  const tags = await TagModel.findAll({
    where: query,
    attributes: ['id', 'title', 'description', 'active']
  })

  return res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      categories: tags || []
    }
  })
}

module.exports = [
  validationHandler,
  getAllHandler
]