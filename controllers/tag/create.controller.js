const joi = require('joi')
const _ = require('lodash')
const md5 = require('md5')
const COMMON_RESPONSE_CODE = require('../../constants/response-code.constants').COMMON
const USER_ROLE = require('../../constants/user.constants').USER_ROLE
const { Category: CategoryModel, Tag: TagModel } = require('../../models')
const genValidationHandler = require('../../middlewares/gen-request-validation')
const authMiddleware = require('../../middlewares/auth')
const requireRoleMiddleware = require('../../middlewares/require-role')

const validationHandler = genValidationHandler({
  body: joi.object({
    title: joi.string().trim().required().invalid('', null),
    description: joi.string().trim().required().invalid('', null)
  }).unknown(false)
})

async function createHandler(req, res) {
  const data = _.cloneDeep(req.body)
  data.createdBy = req.user.id

  const createdTag = await TagModel.create(data)
  if (!createdTag) {
    return res.json({
      code: COMMON_RESPONSE_CODE.FAILED,
      data: {
        message: 'Tạo thẻ thất bại.'
      }
    })
  }

  createdTag.createdUser = req.user

  return res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      message: 'Tạo thẻ thành công.',
      category: _.pick(createdTag, ['id', 'title', 'description', 'createdUser.id', 'createdUser.email'])
    }
  })
}

module.exports = [
  authMiddleware,
  requireRoleMiddleware(USER_ROLE.ADMIN),
  validationHandler,
  createHandler
]