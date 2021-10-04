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
  Comment: CommentModel,
  ExerciseTag: ExerciseTagModel
} = require('../../models')
const genValidationHandler = require('../../middlewares/gen-request-validation')
const authMiddleware = require('../../middlewares/auth')
const requireRoleMiddleware = require('../../middlewares/require-role')

const validationHandler = genValidationHandler({
  params: joi.object({
    commentId: joi.number().required().integer().positive().invalid(null)
  }).unknown(false),
  body: joi.object({
    content: joi.string().trim().invalid('', null),
    active: joi.boolean().invalid(null)
  }).unknown(false)
})

async function updateHandler(req, res) {
  const [errMsg, { commentUpdateData }] = await transformInput({ req })
  if (errMsg) return res.json({
    code: COMMON_RESPONSE_CODE.FAILED,
    data: {
      message: errMsg
    }
  })
  
  await CommentModel.update(commentUpdateData, { where: { id: req.params.commentId }})
  const responseData = await transformResponse({
    commentId: req.params.commentId
  })

  return res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      message: 'Cập nhật bình luận thành công.',
      comment: responseData
    }
  })
}

module.exports = [
  authMiddleware,
  validationHandler,
  updateHandler
]

async function transformInput({ req }) {
  const where = { id: req.params.commentId }
  const isNotAdmin = req.user.role !== USER_ROLE.ADMIN
  if (isNotAdmin) {
    where.active = true
    where.userId = req.user.id
  }

  const comment = await CommentModel.findOne({ where })
  if (!comment) return ['Bình luận không tồn tại', {}]

  const commentUpdateData = _.cloneDeep(req.body)

  return [null, { commentUpdateData }]
}

async function transformResponse({ commentId }) {

  const comment = await CommentModel.findOne({ where: { id: commentId }, include: UserModel })

  return _.pick(comment, ['id', 'content', 'createdAt', 'updatedAt', 'user.id', 'user.email', 'user.fullname'])
}