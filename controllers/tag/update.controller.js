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
  params: joi.object({
    tagId: joi.number().required().integer().positive().invalid(null)
  }).unknown(false),
  body: joi.object({
    title: joi.string().trim().invalid('', null),
    description: joi.string().trim().invalid('', null),
    active: joi.boolean().invalid(null)
  }).unknown(false)
})

async function updateHandler(req, res) {
  const { tagId } = req.params
  const data = _.cloneDeep(req.body)
  if (_.isEmpty(data)) return res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      message: 'Cập nhật thẻ thành công.',
      category: {
        id: tagId,
        ...data
      }
    }
  })

  const where = { id: tagId }
  const tag = await TagModel.findOne({ where })
  if (!tag) {
    return res.json({
      code: COMMON_RESPONSE_CODE.FAILED,
      data: {
        message: 'Thẻ không tồn tại.'
      }
    })
  }
  
  await TagModel.update(data, { where })

  return res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      message: 'Cập nhật thẻ thành công.',
      category: {
        id: tagId,
        ...data
      }
    }
  })
}

module.exports = [
  authMiddleware,
  requireRoleMiddleware(USER_ROLE.ADMIN),
  validationHandler,
  updateHandler
]