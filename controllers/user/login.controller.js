const joi = require('joi')
const _ = require('lodash')
const md5 = require('md5')
const config = require('config')
const jwt = require('../../util/jwt')
const COMMON_RESPONSE_CODE = require('../../constants/response-code.constants').COMMON
const USER_ROLE = require('../../constants/user.constants').USER_ROLE
const { User: UserModel } = require('../../models')
const genValidationHandler = require('../../middlewares/gen-request-validation')

const validationHandler = genValidationHandler({
  body: joi.object({
    email: joi.string().trim().required().email().invalid('', null),
    password: joi.string().trim().required().invalid('', null)
  }).unknown(false)
})

async function registerHandler(req, res) {
  const data = _.cloneDeep(req.body)

  const user = await UserModel.findOne({
    where: {
      email: data.email
    }
  })
  if (!user) {
    return res.json({
      code: COMMON_RESPONSE_CODE.FAILED,
      data: {
        message: 'Email không tồn tại.'
      }
    })
  }

  if (!user.active) {
    return res.json({
      code: COMMON_RESPONSE_CODE.FAILED,
      data: {
        message: 'Tài khoản đã bị khóa.'
      }
    })
  }

  const hashedPassword = md5(data.password)
  if (user.password !== hashedPassword) {
    return res.json({
      code: COMMON_RESPONSE_CODE.FAILED,
      data: {
        message: 'Mật khẩu không chính xác.'
      }
    })
  }

  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role
  }
  const jwtSecret = config.get('jwtSecret')
  const accessToken = await jwt.signAsync(jwtPayload, jwtSecret)

  return res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      message: 'Đăng nhập thành công.',
      user: _.pick(user, ['id', 'email', 'fullname', 'role', 'phone', 'avatarUrl', 'description']),
      accessToken
    }
  })
}

module.exports = [
  validationHandler,
  registerHandler
]