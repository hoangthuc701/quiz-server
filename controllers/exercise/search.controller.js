const joi = require('joi')
const _ = require('lodash')
const md5 = require('md5')
const async = require('async')
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
  ExerciseTag: ExerciseTagModel
} = require('../../models')
const genValidationHandler = require('../../middlewares/gen-request-validation')
const authMiddleware = require('../../middlewares/auth')

const validationHandler = genValidationHandler({
  body: joi.object({
    categoryIdList: joi.array().min(1).items(joi.number().required().integer().positive().invalid(null)),
    tagIdList: joi.array().min(1).items(joi.number().required().integer().positive().invalid(null)),
    offset: joi.number().min(0).invalid(null).default(0),
    limit: joi.number().min(1).invalid(null).default(20),
    isGetOwned: joi.boolean().invalid(null).default(false),
    order: joi.array().min(1).invalid(null).default([['id', 'DESC']]).items(
      joi.array().required().length(2).invalid(null).items(
        joi.string().required().invalid('', null)
      )
    )
  }).unknown(false)
})

async function searchHandler(req, res) {
  const queryOpts = transformInput({ req })
  const exerciseList = await ExerciseModel.findAll(queryOpts)
  await async.eachLimit(exerciseList, 20, async (exercise) => {
    const exerciseTagList = await ExerciseTagModel.findAll({ 
      where: { active: true, exerciseId: exercise.id },
      include: TagModel
    })
    const tags = _.map(exerciseTagList, exerciseTag => ({ id: _.get(exerciseTag, 'tag.id'), title: _.get(exerciseTag, 'tag.title'), description: _.get(exerciseTag, 'tag.description') }))
    exercise.tags = tags
  })
  const responseData = transformResponse({
    reqUser: req.user || {},
    exerciseList
  })

  return res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      message: 'Lấy thông tin đề thi thành công.',
      exercises: responseData || []
    }
  })
}

module.exports = [
  require('../../middlewares/auth-optional'),
  validationHandler,
  searchHandler
]

function transformInput({ req }) {
  const data = _.cloneDeep(req.body)
  const reqUser = _.get(req, 'user', {})
  const queryOpts = { 
    where: { active: true },
    include: [
      CategoryModel, 
      UserModel
    ],
    offset: data.offset,
    limit: data.limit,
    order: data.order
  }
  
  if ([USER_ROLE.ADMIN, USER_ROLE.CREATOR].includes(reqUser.role) && data.isGetOwned) queryOpts.where.createdBy = reqUser.id
  if (data.categoryIdList) queryOpts.where.categoryId = { [Op.in]: data.categoryIdList }
  if (data.tagIdList) queryOpts.where[Op.and] = [ 
    sequelize.literal(
      `EXISTS (
      SELECT 1 FROM exerciseTags et
      WHERE et.exerciseId = exercise.id and et.tagId in (${data.tagIdList.join(',')})
      )`
    )
  ]

  return queryOpts
}

function transformResponse({ exerciseList, reqUser = {} }) {
  const pickedExerciseList = [
    'id', 'title', 'description', 'duration',
    'category.id', 'category.title', 'category.description',
    'createdUser.id', 'createdUser.email',
    'tags'
  ]

  exerciseList = _.map(exerciseList, (exercise) => {
    exercise.createdUser = exercise.user
    return _.pick(exercise, pickedExerciseList)
  })

  return exerciseList
}