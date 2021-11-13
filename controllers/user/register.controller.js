const joi = require('joi')
const _ = require('lodash')
const md5 = require('md5')
const COMMON_RESPONSE_CODE = require('../../constants/response-code.constants').COMMON
const USER_ROLE = require('../../constants/user.constants').USER_ROLE
const { User: UserModel } = require('../../models')
const genValidationHandler = require('../../middlewares/gen-request-validation')

const validationHandler = genValidationHandler({
  body: joi.object({
    email: joi.string().trim().required().email().invalid('', null),
    fullname: joi.string().trim().required().invalid('', null),
    phone: joi.string().trim().invalid(''),
    password: joi.string().trim().required().invalid('', null),
    confirmPassword: joi.string().trim().required().invalid('', null),
    role: joi.number().optional().default(USER_ROLE.NORMAL).valid(USER_ROLE.NORMAL, USER_ROLE.CREATOR)
  }).unknown(false)
})

async function registerHandler(req, res) {
  const data = _.cloneDeep(req.body)
  if (data.password !== data.confirmPassword) {
    return res.json({
      code: COMMON_RESPONSE_CODE.FAILED,
      message: 'Xác nhận mật khẩu không chính xác.'
    })
  }

  const existUser = await UserModel.findOne({
    where: {
      email: data.email
    }
  })
  if (existUser) {
    return res.json({
      code: COMMON_RESPONSE_CODE.FAILED,
      data: {
        message: 'Email đã tồn tại.'
      }
    })
  }

  const hashedPassword = md5(data.password)
  delete data.confirmPassword
  data.password = hashedPassword

  const createdUser = await UserModel.create(data)
  if (!createdUser) {
    return res.json({
      code: COMMON_RESPONSE_CODE.FAILED,
      data: {
        message: 'Đăng kí thất bại.'
      }
    })
  }

  return res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      message: 'Đăng kí thành công.',
      user: _.pick(createdUser, ['id', 'email', 'fullname', 'role', 'phone'])
    }
  })
}

module.exports = [
  validationHandler,
  registerHandler
]