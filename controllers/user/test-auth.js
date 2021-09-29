const joi = require('joi')
const _ = require('lodash')
const md5 = require('md5')
const config = require('config')
const jwt = require('../../util/jwt')
const COMMON_RESPONSE_CODE = require('../../constants/response-code.constants').COMMON
const USER_ROLE = require('../../constants/user.constants').USER_ROLE
const { User: UserModel } = require('../../models')
const genValidationHandler = require('../../middlewares/gen-request-validation')
const authMiddleware = require('../../middlewares/auth')
const requireRoleMiddleware = require('../../middlewares/require-role')


async function testAuthHandler(req, res) {
  return res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      message: 'test thanh cong.',
      user: _.pick(req.user, ['id', 'email', 'fullname', 'fullname', 'phone'])
    }
  })
}

module.exports = [
  authMiddleware,
  requireRoleMiddleware(USER_ROLE.ADMIN),
  testAuthHandler
]