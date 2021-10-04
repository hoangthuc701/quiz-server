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
  Submission: SubmissionModel,
  Feedback: FeedbackModel
} = require('../../models')
const genValidationHandler = require('../../middlewares/gen-request-validation')
const authMiddleware = require('../../middlewares/auth')
const requireRoleMiddleware = require('../../middlewares/require-role')

const validationHandler = genValidationHandler({
  body: joi.object({
    submissionId: joi.number().required().integer().positive().invalid(null),
    content: joi.string().trim().required().invalid('', null)
  }).unknown(false)
})

async function createHandler(req, res) {
  const [
    errMsg,
    submission,
    feedbackInsertData
  ] = await transformInput(req)
  if (errMsg) return res.json({
    code: COMMON_RESPONSE_CODE.FAILED,
    data: {
      message: errMsg
    }
  })

  const feedback = await FeedbackModel.create(feedbackInsertData)
  if (!feedback) return res.json({
    code: COMMON_RESPONSE_CODE.FAILED,
    data: {
      message: 'Phản hồi thất bại.'
    }
  })
  
  return res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      message: 'Phản hồi thành công.',
      feedback: _.pick(feedback, ['id', 'content'])
    }
  })
}

module.exports = [
  authMiddleware,
  validationHandler,
  createHandler
]

async function transformInput(req) {
  const submission = await SubmissionModel.findOne({
    where: { 
      id: req.body.submissionId, 
      userId: req.user.id,
      [Op.or]: [
        {
          nCorrectAnswer: { [Op.ne]: null },
          nQuestion: { [Op.ne]: null },
        },
        {
          expiredAt: {
            [Op.lt]: moment().toISOString()
          }
        }
      ]
    },
    include: ExerciseModel
  })
  if (!submission) return ['Bài làm không tồn tại']
  const feedbackInsertData = {
    exerciseId: _.get(submission, 'exercise.id', null),
    content: req.body.content,
    userId: req.user.id
  }
  return [null, submission, feedbackInsertData]
}