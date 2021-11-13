const joi = require('joi')
const _ = require('lodash')
const md5 = require('md5')
const sequelize = require('sequelize')
const { Op } = sequelize
const COMMON_RESPONSE_CODE = require('../../../constants/response-code.constants').COMMON
const USER_ROLE = require('../../../constants/user.constants').USER_ROLE
const { 
  User: UserModel,
  Category: CategoryModel, 
  Tag: TagModel, 
  Exercise: ExerciseModel,
  Question: QuestionModel,
  ExerciseTag: ExerciseTagModel,
  Feedback: FeedbackModel
} = require('../../../models')
const genValidationHandler = require('../../../middlewares/gen-request-validation')
const authOptionalMdw = require('../../../middlewares/auth-optional')

const validationHandler = genValidationHandler({
  params: joi.object({
    userId: joi.number().required().integer().positive().invalid(null)
  }).unknown(false)
})

async function getOneHandler(req, res) {
  const { userId } = req.params

  const user = await UserModel.findOne({ where: { id: userId, role: { [Op.ne]: USER_ROLE.ADMIN } } })
  if (!user) return res.json({
    code: COMMON_RESPONSE_CODE.FAILED,
    data: {
      message: 'Người dùng không tồn tại.'
    }
  })

  return res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      message: 'Lấy thông tin người dùng thành công.',
      user: _.pick(user, ['id', 'email', 'fullname', 'role', 'active', 'phone', 'avatarUrl', 'description'])
    }
  })
}

module.exports = [
  authOptionalMdw,
  validationHandler,
  getOneHandler
]
