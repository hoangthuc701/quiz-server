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
const authOptional = require('../../middlewares/auth-optional')

const validationHandler = genValidationHandler({
  body: joi.object({
    exerciseId: joi.number().required().integer().positive().invalid(null),
    active: joi.boolean().invalid(null),
    offset: joi.number().min(0).invalid(null).default(0),
    limit: joi.number().min(1).invalid(null).default(20),
    order: joi.array().min(1).invalid(null).default([['id', 'DESC']]).items(
      joi.array().required().length(2).invalid(null).items(
        joi.string().required().invalid('', null)
      )
    )
  }).unknown(false)
})

async function searchHandler(req, res) {
  const queryOpts = transformInput({ req })
  const commentList = await CommentModel.findAll(queryOpts)
  const responseData = transformResponse({
    commentList
  })

  return res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      message: 'Lấy thông tin bình luận thành công.',
      comments: responseData || []
    }
  })
}

module.exports = [
  authOptional,
  validationHandler,
  searchHandler
]

function transformInput({ req }) {
  const data = _.cloneDeep(req.body)

  const queryOpts = { 
    where: {
      exerciseId: data.exerciseId
    },
    include: [
      UserModel
    ],
    offset: data.offset,
    limit: data.limit,
    order: data.order
  }
  
  if (_.get(req, 'user.role', null) === USER_ROLE.ADMIN) {
    if (!_.isUndefined(data.active)) queryOpts.where.active = data.active
  } else {
    queryOpts.where.active = true
  }
  return queryOpts
}

function transformResponse({ commentList }) {

  commentList = _.map(commentList, comment => {
    return _.pick(comment, ['id', 'content', 'active', 'createdAt', 'updatedAt', 'user.id', 'user.email', 'user.fullname'])
  })

  return commentList
}