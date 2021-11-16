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
  }).unknown(false),
  body: joi.object({
    content: joi.string().trim().invalid('', null),
    correctAnswer: joi.number().integer().positive().invalid(null).valid(1, 2, 3, 4),
    answer1: joi.string().trim().invalid('', null),
    answer2: joi.string().trim().invalid('', null),
    answer3: joi.string().trim().invalid('', null),
    answer4: joi.string().trim().invalid('', null)
  }).unknown(false)
})

async function createHandler(req, res) {
  const question = await QuestionModel.findOne({ where: { id: req.params.questionId } })
  if (!question) return res.json({
    code: COMMON_RESPONSE_CODE.FAILED,
    data: {
      message: 'Câu hỏi không tồn tại.'
    }
  })

  await QuestionModel.update(req.body, { where: {id: question.id }})

  return res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      message: 'Cập nhật câu hỏi thành công.',
      question: {
        ...question.dataValues,
        ...req.body
      }
    }
  })
}

module.exports = [
  authMiddleware,
  requireRoleMiddleware([USER_ROLE.ADMIN, USER_ROLE.CREATOR]),
  validationHandler,
  createHandler
]
