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
    exerciseId: joi.number().required().integer().positive().invalid(null),
  }).unknown(false)
})

async function startHandler(req, res) {
  const [
    errMsg,
    submissionInsertData
  ] = await transformInput(req)
  if (errMsg) return res.json({
    code: COMMON_RESPONSE_CODE.FAILED,
    data: {
      message: errMsg
    }
  })

  const submission = await SubmissionModel.create(submissionInsertData)
  if (!submission) return res.json({
    code: COMMON_RESPONSE_CODE.FAILED,
    data: {
      message: 'Bắt đầu làm bài thất bại.'
    }
  })

  return res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      message: 'Bát đầu làm bài thành công.',
      submissionId: submission.id
    }
  })
}

module.exports = [
  authMiddleware,
  validationHandler,
  startHandler
]

async function transformInput(req) {
  const exercise = await ExerciseModel.findOne({ where: { active: true, id: req.body.exerciseId }})
  if (!exercise) return ['Đề thi không tồn tại']
  const data = {
    exerciseId: req.body.exerciseId,
    userId: req.user.id,
    expiredAt: moment().add(exercise.duration, 'minutes').toISOString()
  }

  return [null, data]
}