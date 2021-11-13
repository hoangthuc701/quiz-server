const joi = require('joi')
const _ = require('lodash')
const md5 = require('md5')
const sequelize = require('sequelize')
const { Op } = sequelize
const COMMON_RESPONSE_CODE = require('../../constants/response-code.constants').COMMON
const USER_ROLE = require('../../constants/user.constants').USER_ROLE
const { 
  User: UserModel,
  Category: CategoryModel, 
  Tag: TagModel, 
  Exercise: ExerciseModel,
  Question: QuestionModel,
  ExerciseTag: ExerciseTagModel,
  Feedback: FeedbackModel
} = require('../../models')
const genValidationHandler = require('../../middlewares/gen-request-validation')
const authOptionalMdw = require('../../middlewares/auth-optional')

const validationHandler = genValidationHandler({
  params: joi.object({
    exerciseId: joi.number().required().integer().positive().invalid(null)
  }).unknown(false)
})

async function getOneHandler(req, res) {
  const { exerciseId } = req.params

  const exercise = await ExerciseModel.findOne({ where: { id: exerciseId, active: true }, include: [CategoryModel, UserModel] })
  if (!exercise) return res.json({
    code: COMMON_RESPONSE_CODE.FAILED,
    data: {
      message: 'Đề thi không tồn tại.'
    }
  })

  const [ 
    exerciseTagList,
    questionList,
    feedbackList,
  ] = await Promise.all([
    ExerciseTagModel.findAll({ where: { exerciseId, active: true }, include: TagModel }),
    QuestionModel.findAll({ where: { exerciseId } }),
    FeedbackModel.findAll({ where: { exerciseId, active: true }, include: [UserModel] })
  ])
  
  const responseData = transformResponse({
    reqUser: req.user || {},
    exercise,
    exerciseTagList,
    questionList,
    feedbackList
  })

  return res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      message: 'Lấy thông tin đề thi thành công.',
      exercise: responseData
    }
  })
}

module.exports = [
  authOptionalMdw,
  validationHandler,
  getOneHandler
]

function transformResponse({ exercise, exerciseTagList, questionList, feedbackList, reqUser = {} }) {
  exercise.questions = questionList
  exercise.createdUser = exercise.user

  const pickedQuestionAttrList = [
    'id', 'no', 'content',
    'answer1', 'answer2', 'answer3', 'answer4'
  ]
  if (reqUser.role === USER_ROLE.ADMIN || (reqUser.role === USER_ROLE.CREATOR && reqUser.id === _.get(exercise, 'user.id', null))) {
    pickedQuestionAttrList.push('correctAnswer')
  }
  const pickedExerciseList = [
    'id', 'title', 'description', 'duration',
    'category.id', 'category.title', 'category.description',
    'createdUser.id', 'createdUser.email',
    'tags',
    'questions'
  ]

  const feedbacks = _.map(feedbackList, feedback => ({ id: feedback.id, content: feedback.content, createdUser: _.pick(feedback.user, ['id', 'email', 'fullname', 'role', 'phone', 'avatarUrl', 'description']) }))
  const tags = _.map(exerciseTagList, exerciseTag => ({ id: _.get(exerciseTag, 'tag.id'), title: _.get(exerciseTag, 'tag.title'), description: _.get(exerciseTag, 'tag.description') }))
  exercise = _.pick(exercise, pickedExerciseList)
  exercise.tags = tags
  exercise.questions = _.map(exercise.questions, (question) => _.pick(question, pickedQuestionAttrList))
  if (reqUser.role === USER_ROLE.ADMIN || (reqUser.role === USER_ROLE.CREATOR && reqUser.id === _.get(exercise, 'createdUser.id', null))) exercise.feedbacks = feedbacks
  return exercise
}