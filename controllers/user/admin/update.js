const joi = require('joi')
const moment = require('moment')
const _ = require('lodash')
const md5 = require('md5')
const crypto = require('crypto')
const COMMON_RESPONSE_CODE = require('../../../constants/response-code.constants').COMMON
const USER_ROLE = require('../../../constants/user.constants').USER_ROLE
const { User: UserModel } = require('../../../models')
const genValidationHandler = require('../../../middlewares/gen-request-validation')
const EmailService = require('../../../service/emailService')
const { Op } = require('sequelize')

const validationHandler = genValidationHandler({
  params: joi.object({ userId: joi.number().required().integer().positive().invalid(null) }).unknown(false),
  body: joi.object({
    fullname: joi.string().trim().optional().invalid('', null),
    phone: joi.string().optional().trim().invalid(''),
    active: joi.boolean().optional().invalid(null),
    avatarUrl: joi.string().optional().trim().invalid(''),
    description: joi.string().optional().trim().invalid(''),
  }).unknown(false)
})

async function handler(req, res) {
  const { params: { userId } } = req;
  const updateData = _.cloneDeep(req.body);

  await UserModel.update(
    updateData,
    {
      where: { id: userId, role: { [Op.ne]: USER_ROLE.ADMIN } },
    }
  );

  res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      message: "Cập nhật thông tin thành công",
    },
  });
}

module.exports = [
  require('../../../middlewares/auth'),
  require('../../../middlewares/require-role')(USER_ROLE.ADMIN),
  validationHandler,
  handler
]