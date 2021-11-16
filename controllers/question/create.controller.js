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
  body: joi.object({
    exerciseId: joi.number().required().integer().positive().invalid(null),
    content: joi.string().trim().required().invalid('', null),
    correctAnswer: joi.number().required().integer().positive().invalid(null).valid(1, 2, 3, 4),
    answer1: joi.string().trim().required().invalid('', null),
    answer2: joi.string().trim().required().invalid('', null),
    answer3: joi.string().trim().required().invalid('', null),
    answer4: joi.string().trim().required().invalid('', null)
  }).unknown(false)
})

async function createHandler(req, res) {
  const [
    errMsg,
    questionInsertData
  ] = await transformInput(req)

  if (errMsg) return res.json({
    code: COMMON_RESPONSE_CODE.FAILED,
    data: {
      message: errMsg
    }
  })

  const question = await QuestionModel.create(questionInsertData)
  if (!question) return res.json({
    code: COMMON_RESPONSE_CODE.FAILED,
    data: {
      message: 'Thêm câu hỏi không thành công.'
    }
  })  


  return res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      message: 'Thêm câu hỏi thành công.',
      question: question
    }
  })
}

module.exports = [
  authMiddleware,
  requireRoleMiddleware(USER_ROLE.ADMIN, USER_ROLE.CREATOR),
  validationHandler,
  createHandler
]

async function transformInput(req) {
  
  const exercise = await ExerciseModel.findOne({ where: { active: true, id: req.body.exerciseId }})
  if (!exercise) return ['Đề thi không tồn tại.']
  const lastestQuestion = await QuestionModel.findAll({
    limit: 1,
    where: {
      exerciseId: exercise.id
    },
    order: [[ 'no', 'DESC' ]]
  })
  const nextNo = _.get(lastestQuestion, '[0].no', 0) + 1
  const data = _.cloneDeep(req.body)
  data.no = nextNo

  return [null, data]
}
