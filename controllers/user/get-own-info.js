const joi = require('joi')
const _ = require('lodash')
const md5 = require('md5')
const COMMON_RESPONSE_CODE = require('../../constants/response-code.constants').COMMON
const USER_ROLE = require('../../constants/user.constants').USER_ROLE
const { User: UserModel } = require('../../models')
const genValidationHandler = require('../../middlewares/gen-request-validation')

const validationHandler = genValidationHandler({
  body: joi.object({
   
  }).unknown(false)
})

async function handler(req, res) {
  const user = req.user

  const userInfo = await UserModel.findOne({
    where: {
      id: user.id
    }
  })
  if (!userInfo) {
    return res.json({
      code: COMMON_RESPONSE_CODE.FAILED,
      data: {
        message: 'Không tìm thấy thông tin người dùng.'
      }
    })
  }

  return res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      message: 'Lấy thông tin người dùng thành công.',
      user: _.pick(userInfo, ['id', 'email', 'fullname', 'role', 'phone'])
    }
  })
}

module.exports = [
  require('../../middlewares/auth'),
  validationHandler,
  handler
]