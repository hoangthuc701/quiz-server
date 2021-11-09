const joi = require('joi')
const moment = require('moment')
const _ = require('lodash')
const md5 = require('md5')
const crypto = require('crypto')
const COMMON_RESPONSE_CODE = require('../../constants/response-code.constants').COMMON
const USER_ROLE = require('../../constants/user.constants').USER_ROLE
const { User: UserModel } = require('../../models')
const genValidationHandler = require('../../middlewares/gen-request-validation')
const EmailService = require('../../service/emailService')

const validationHandler = genValidationHandler({
  body: joi.object({
    email: joi.string().trim().required().email().invalid('', null)
  }).unknown(false)
})

async function handler(req, res) {
  const { email } = req.body
  const user = await UserModel.findOne({
    where: {
      email
    }
  })
  if (!user) return res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được một email thay đổi mật khẩu'
    }
  })

  const verifyCode = await new Promise((rsl, rjt) => {
    crypto.randomBytes(100, (err, buf) => {
      if (err) return rjt(err)
      rsl(buf.toString('base64'))
    })
  })
  const hashedVerifyCode = md5(verifyCode)
  const verifyCodeExpiredAt = moment().add(10, 'minutes').toISOString()
  await UserModel.update(
    { verifyCode: hashedVerifyCode, verifyCodeExpiredAt, },
    { where: { id: user.id, } }
  )

  res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được một email thay đổi mật khẩu'
    }
  })

  const ms = new EmailService({
    email
  })
  ms.forgetPassword(verifyCode)
}

module.exports = [
  validationHandler,
  handler
]