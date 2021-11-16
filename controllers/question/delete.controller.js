const joi = require('joi')
const _ = require('lodash')
const md5 = require('md5')
const { Op } = require('sequelize')
const COMMON_RESPONSE_CODE = require('../../constants/response-code.constants').COMMON
const USER_ROLE = require('../../constants/user.constants').USER_ROLE
const { 
  Category: CategoryModel, 
  Tag: TagModel, 
  Exercise: ExerciseModel,
  Question: QuestionModel,
  ExerciseTag: ExerciseTagModel
} = require('../../models')
const genValidationHandler = require('../../middlewares/gen-request-validation')
const authMiddleware = require('../../middlewares/auth')
const requireRoleMiddleware = require('../../middlewares/require-role')

const validationHandler = genValidationHandler({
  params: joi.object({
    questionId: joi.number().required().integer().positive().invalid(null),
  }).unknown(false)
})

async function createHandler(req, res) {
  await QuestionModel.destroy({ where: { id: req.params.questionId } })
  
  return res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      message: 'Xóa câu hỏi thành công.'
    }
  })
}

module.exports = [
  authMiddleware,
  requireRoleMiddleware(USER_ROLE.ADMIN, USER_ROLE.CREATOR),
  validationHandler,
  createHandler
]
