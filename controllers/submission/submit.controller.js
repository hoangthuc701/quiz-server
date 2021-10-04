const joi = require('joi')
const _ = require('lodash')
const moment = require('moment')
const md5 = require('md5')
const { Op } = require('sequelize')
const COMMON_RESPONSE_CODE = require('../../constants/response-code.constants').COMMON
const USER_ROLE = require('../../constants/user.constants').USER_ROLE
const { 
  Category: CategoryModel, 
  Tag: TagModel, 
  Exercise: ExerciseModel,
  Question: QuestionModel,
  ExerciseTag: ExerciseTagModel,
  Submission: SubmissionModel
} = require('../../models')
const genValidationHandler = require('../../middlewares/gen-request-validation')
const authMiddleware = require('../../middlewares/auth')
const requireRoleMiddleware = require('../../middlewares/require-role')

const validationHandler = genValidationHandler({
  body: joi.object({
    submissionId: joi.number().required().integer().positive().invalid(null),
    answerList: joi.array().required().invalid(null).min(1).items(joi.object({
      questionId: joi.number().required().integer().positive().invalid(null),
      answer: joi.number().integer().required().valid(1, 2, 3, 4)
    }))
  }).unknown(false)
})

async function submitHandler(req, res) {
  const [
    errMsg,
    submission,
    answerList,
    questionList
  ] = await transformInput(req)
  if (errMsg) return res.json({
    code: COMMON_RESPONSE_CODE.FAILED,
    data: {
      message: errMsg
    }
  })

  const nQuestion = _.get(questionList, 'length', 0)

  const inputAnswerMapping = {}
  _.forEach(answerList, inputAnswer => {
    inputAnswerMapping[inputAnswer.questionId] = inputAnswer.answer
  })

  let nCorrectAnswer = 0
  _.forEach(questionList, question => {
    const inputAnswer = inputAnswerMapping[question.id]
    if (inputAnswer && inputAnswer === question.correctAnswer) nCorrectAnswer++
  })

  await SubmissionModel.update({
    nQuestion,
    nCorrectAnswer
  }, { where: { id: submission.id } })
  
  return res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      message: 'Nộp bài làm thành công.',
      nQuestion,
      nCorrectAnswer
    }
  })
}

module.exports = [
  authMiddleware,
  validationHandler,
  submitHandler
]

async function transformInput(req) {
  const submission = await SubmissionModel.findOne({
    where: { 
      id: req.body.submissionId, 
      userId: req.user.id,
      nCorrectAnswer: null,
      nQuestion: null,
      expiredAt: {
        [Op.gte]: moment().subtract(20, 'seconds').toISOString()
      }
    }
  })
  if (!submission) return ['Bài làm không tồn tại']
  const questionList = await QuestionModel.findAll({ where: { exerciseId: submission.exerciseId }})
  answerList = req.body.answerList
  return [null, submission, answerList, questionList]
}