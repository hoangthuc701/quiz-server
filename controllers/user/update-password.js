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
    oldPassword: joi.string().trim().required().invalid('', null),
    password: joi.string().trim().required().invalid('', null),
    confirmPassword: joi.string().trim().required().invalid('', null)
  }).unknown(false)
})

async function handler(req, res) {
  const { oldPassword, password, confirmPassword } = req.body;
  const user = req.user
  if (password !== confirmPassword) {
    return res.json({
      code: COMMON_RESPONSE_CODE.FAILED,
      data: {
        message: "Mật khẩu và xác nhận mật khẩu không giống nhau.",
      },
    });
  }

  const auser = await UserModel.findOne({
    where: {
      id: user.id,
      password: md5(oldPassword)
    }
  });
  if (!auser) {
    return res.json({
      code: COMMON_RESPONSE_CODE.FAILED,
      data: {
        message: "Mật khẩu không chính xác.",
      },
    });
  }

  const hashedPassword = md5(password)

  await UserModel.update(
    { password: hashedPassword },
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
  require('../../middlewares/auth'),
  validationHandler,
  handler
]