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
    categoryId: joi.number().required().integer().positive().invalid(null)
  }).unknown(false),
  body: joi.object({
    title: joi.string().trim().invalid('', null),
    description: joi.string().trim().invalid('', null),
    active: joi.boolean().invalid(null)
  }).unknown(false)
})

async function updateHandler(req, res) {
  const { categoryId } = req.params
  const data = _.cloneDeep(req.body)
  if (_.isEmpty(data)) return res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      message: 'Cập nhật danh mục thành công.',
      category: {
        id: categoryId,
        ...data
      }
    }
  })

  const where = { id: categoryId }
  const category = await CategoryModel.findOne({ where })
  if (!category) {
    return res.json({
      code: COMMON_RESPONSE_CODE.FAILED,
      data: {
        message: 'Danh mục không tồn tại.'
      }
    })
  }
  
  await CategoryModel.update(data, { where })

  return res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      message: 'Cập nhật danh mục thành công.',
      category: {
        id: categoryId,
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