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
const { Op } = require('sequelize')

const validationHandler = genValidationHandler({
  body: joi.object({
    token: joi.string().trim().required().invalid('', null),
    password: joi.string().trim().required().invalid('', null),
    confirmPassword: joi.string().trim().required().invalid('', null)
  }).unknown(false)
})

async function handler(req, res) {
  const { token, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.json({
      code: COMMON_RESPONSE_CODE.FAILED,
      data: {
        message: "Mật khẩu và xác nhận mật khẩu không giống nhau.",
      },
    });
  }

  const user = await UserModel.findOne({
    where: {
      verifyCode: md5(token),
      verifyCodeExpiredAt: {
        [Op.gte]: new Date().toISOString()
      }
    }
  });
  if (!user) {
    return res.json({
      code: COMMON_RESPONSE_CODE.FAILED,
      data: {
        message: "Link khôi phục mật khẩu không chính xác hoặc đã hết hạn.",
      },
    });
  }

  const hashedPassword = md5(password)

  await UserModel.update(
    { verifyCode: null, verifyCodeExpiredAt: null, password: hashedPassword },
    {
      where: { id: user.id },
    }
  );

  res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      message: "Cập nhật mật khẩu thành công",
    },
  });
}

module.exports = [
  validationHandler,
  handler
]