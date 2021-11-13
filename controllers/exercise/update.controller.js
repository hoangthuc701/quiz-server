const joi = require('joi')
const _ = require('lodash')
const md5 = require('md5')
const { Op } = require('sequelize')
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
const requireRoleMiddleware = require('../../middlewares/require-role')

const validationHandler = genValidationHandler({
  params: joi.object({
    exerciseId: joi.number().required().integer().positive().invalid(null)
  }).unknown(false),
  body: joi.object({
    title: joi.string().trim().invalid('', null),
    description: joi.string().trim().invalid('', null),
    duration: joi.number().integer().positive().invalid(null),
    active: joi.boolean().invalid(null),
    categoryId: joi.number().integer().positive().invalid(null),
    tagIdList: joi.array().min(1).items(
      joi.number().required().integer().positive().invalid(null)
    )
  }).unknown(false)
})

async function updateHandler(req, res) {
  const { exerciseId } = req.params

  const [
    errMsg, 
    {
      updateExerciseData,
      insertedTagIdList,
      deletedTagIdList,
      exerciseTagList,
      exercise,
      category
    }
  ] = await transformInput(req)
  if (errMsg) return res.json({
    code: COMMON_RESPONSE_CODE.FAILED,
    data: {
      message: errMsg
    }
  })

  const jobPromiseList = []
  jobPromiseList.push(ExerciseModel.update(
    updateExerciseData,
    { where: { id: exerciseId } }
  ))

  if (!_.isEmpty(exerciseTagList)) {
    jobPromiseList.push(ExerciseTagModel.bulkCreate(exerciseTagList))
  }

  if (!_.isEmpty(deletedTagIdList)) {
    jobPromiseList.push(ExerciseTagModel.destroy({ where: { exerciseId, tagId: { [Op.in]: deletedTagIdList } } }))
  }

  await Promise.all(jobPromiseList)

  const responseData = await transformResponse({
    exercise,
    category
  })


  return res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      message: 'Cập nhật đề thi thành công.',
      exercise: responseData
    }
  })
}

module.exports = [
  authMiddleware,
  requireRoleMiddleware([USER_ROLE.ADMIN, USER_ROLE.CREATOR]),
  validationHandler,
  updateHandler
]

async function transformInput(req) {
  const [
    errMsg, 
    data
  ] = await validate(req)
  if (errMsg) return [errMsg, data]

  const body = _.cloneDeep(req.body)
  delete body.tagIdList

  data.updateExerciseData = body
  
  return [null, data]
}

async function validate({ params: { exerciseId }, body, user: reqUser }) {
  const data = {}
  const exercise = await ExerciseModel.findOne({ where: { id: exerciseId } })
  if (!exercise) return ['Đề thi không tồn tại.', data]
  if (reqUser.role !== USER_ROLE.ADMIN && exercise.createdBy !== reqUser.id) return ['Bạn không được phép chỉnh sửa đề thi này.', data]
  data.exercise = exercise

  if (body.categoryId) {
    const category = await CategoryModel.findOne({ where: { id: body.categoryId, active: true }})
    if (!category) return ['Danh mục không tồn tại', data]
    data.category = category
  }

  if (body.tagIdList) {
    const currTagList = await ExerciseTagModel.findAll({ where: { exerciseId, active: true } })
    const currTagIdList = _.map(currTagList, 'tagId')
    const insertedTagIdList = _.filter(body.tagIdList, tagId => !_.includes(currTagIdList, tagId))
    const deletedTagIdList = _.filter(currTagIdList, tagId => !_.includes(body.tagIdList, tagId))

    if (!_.isEmpty(insertedTagIdList)) {
      const nTag = await TagModel.count({ where: { active: true, id: { [Op.in]: insertedTagIdList } } }) 
      if (nTag !== insertedTagIdList.length) return ['Thẻ không tồn tại.', data]
    }
    console.log(insertedTagIdList)
    console.log(deletedTagIdList)
    data.insertedTagIdList = insertedTagIdList
    data.deletedTagIdList = deletedTagIdList
    data.exerciseTagList = _.map(insertedTagIdList, tagId => ({ tagId, exerciseId }))
  }

  return [null, data]
}

async function transformResponse({ exercise, category }) {
  let data = null
  const newestExercise = await ExerciseModel.findOne({ where: { id: exercise.id }, include: UserModel })
  newestExercise.category = category
  newestExercise.createdUser = newestExercise.user
  const exerciseTagList = await ExerciseTagModel.findAll({ where: { exerciseId: exercise.id }, include: TagModel })
  const tags = _.map(exerciseTagList, exerciseTag => ({ id: _.get(exerciseTag, 'tag.id'), title: _.get(exerciseTag, 'tag.title'), description: _.get(exerciseTag, 'tag.description') }))
  newestExercise.tags = tags
  return _.pick(newestExercise, [
    'id', 'title', 'description', 'duration',
    'category.id', 'category.title', 'category.description',
    'createdUser.id', 'createdUser.email',
    'tags'
  ])
}