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
    
  }).unknown(false)
})

async function searchHandler(req, res) {
  const submissionList = await SubmissionModel.findAll({
    where: {
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
    include: ExerciseModel,
    order: [['createdAt', 'DESC']]
  })
  
  const responseData = transformResponse({ submissionList })
  return res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      message: 'Lấy lịch sử làm bài thành công.',
      submissionList: responseData || []
    }
  })
}

module.exports = [
  authMiddleware,
  validationHandler,
  searchHandler
]

function transformResponse({ submissionList }) {
  const responseData = _.map(submissionList, submission => {
    const data = _.pick(submission, [
      'id',
      'expiredAt',
      'createdAt',
      'nQuestion',
      'answerList',
      'nCorrectAnswer',
      'exercise.id',
      'exercise.title',
      'exercise.description',
      'exercise.duration',
      'exercise.categoryId'
    ])
    data.answerList = JSON.parse(data.answerList)
    return data
  })

  return responseData
}