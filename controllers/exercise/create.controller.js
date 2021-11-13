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
    title: joi.string().trim().required().invalid('', null),
    description: joi.string().trim().required().invalid('', null),
    duration: joi.number().required().integer().positive().invalid(null),
    categoryId: joi.number().required().integer().positive().invalid(null),
    tagIdList: joi.array().required().min(1).items(
      joi.number().required().integer().positive().invalid(null)
    ),
    questionList: joi.array().required().min(1).items(joi.object({
      content: joi.string().trim().required().invalid('', null),
      correctAnswer: joi.number().required().integer().positive().invalid(null).valid(1, 2, 3, 4),
      answer1: joi.string().trim().required().invalid('', null),
      answer2: joi.string().trim().required().invalid('', null),
      answer3: joi.string().trim().required().invalid('', null),
      answer4: joi.string().trim().required().invalid('', null)
    })),
  }).unknown(false)
})

async function createHandler(req, res) {
  const [
    inputExercise,
    inputTagIdList,
    inputQuestionList
  ] = transformInput(req)

  const category = await CategoryModel.findOne({ where: { id: inputExercise.categoryId, active: true } })
  if (!category) return res.json({
    code: COMMON_RESPONSE_CODE.FAILED,
    data: {
      message: 'Danh mục không tồn tại.'
    }
  })

  const tagList = await TagModel.findAll({ where: { active: true, id: { [Op.in]: inputTagIdList } } })
  if (_.get(tagList, 'length', null) !== inputTagIdList.length) return res.json({
    code: COMMON_RESPONSE_CODE.FAILED,
    data: {
      message: 'Thẻ không tồn tại.'
    }
  })

  const createdExercise = await ExerciseModel.create(inputExercise)
  if (!createdExercise) return res.json({
    code: COMMON_RESPONSE_CODE.FAILED,
    data: {
      message: 'Tạo đề thi thất bại.'
    }
  })

  const createdExerciseTagList = await ExerciseTagModel.bulkCreate(
    _.map(inputTagIdList, tagId => ({ exerciseId: createdExercise.id, tagId }))
  )
  if (_.get(createdExerciseTagList, 'length', 0) < 1) return res.json({
    code: COMMON_RESPONSE_CODE.FAILED,
    data: {
      message: 'Tạo nhãn cho đề thi thất bại.'
    }
  })

  inputQuestionList.forEach((question, idx) => {
    question.no = idx + 1
    question.exerciseId = createdExercise.id
  })
  const createdQuestionList = await QuestionModel.bulkCreate(inputQuestionList)
  if (_.get(createdQuestionList, 'length', 0) < 1) return res.json({
    code: COMMON_RESPONSE_CODE.FAILED,
    data: {
      message: 'Tạo câu hỏi cho đề thi thất bại.'
    }
  })

  const responseData = transformResponse({
    exercise: createdExercise,
    user: req.user,
    category,
    tagList,
    questionList: createdQuestionList 
  })

  return res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      message: 'Tạo đề thi thành công.',
      exercise: responseData
    }
  })
}

module.exports = [
  authMiddleware,
  requireRoleMiddleware([USER_ROLE.ADMIN, USER_ROLE.CREATOR]),
  validationHandler,
  createHandler
]

function transformInput(req) {
  const inputExercise = _.cloneDeep(req.body)
  const inputTagIdList = inputExercise.tagIdList
  const inputQuestionList = inputExercise.questionList
  inputExercise.createdBy = req.user.id
  delete inputExercise.tagIdList
  delete inputExercise.questionList

  return [
    inputExercise,
    inputTagIdList,
    inputQuestionList
  ]
}

function transformResponse({
  exercise,
  user,
  category,
  tagList,
  questionList 
}) {

  exercise.category = category
  exercise.tags = tagList
  exercise.questions = questionList
  exercise.createdUser = user

  const pickedTagAttrList =  ['id', 'title', 'description']
  const pickedQuestionAttrList = [
    'id', 'no', 'content', 'correctAnswer', 
    'answer1', 'answer2', 'answer3', 'answer4'
  ]
  const pickedExerciseList = [
    'id', 'title', 'description', 'duration',
    'category.id', 'category.title', 'category.description',
    'createdUser.id', 'createdUser.email',
    'tags',
    'questions'
  ]

  exercise = _.pick(exercise, pickedExerciseList)
  exercise.tags = _.map(exercise.tags, (tag) => _.pick(tag, pickedTagAttrList))
  exercise.questions = _.map(exercise.questions, (question) => _.pick(question, pickedQuestionAttrList))

  return exercise
}