const joi = require('joi')
const _ = require('lodash')
const md5 = require('md5')
const async = require('async')
const sequelize = require('sequelize')
const { Op } = sequelize
const COMMON_RESPONSE_CODE = require('../../../constants/response-code.constants').COMMON
const USER_ROLE = require('../../../constants/user.constants').USER_ROLE
const { 
  User: UserModel,
  Category: CategoryModel, 
  Tag: TagModel, 
  Exercise: ExerciseModel,
  Question: QuestionModel,
  ExerciseTag: ExerciseTagModel
} = require('../../../models')
const genValidationHandler = require('../../../middlewares/gen-request-validation')
const authMiddleware = require('../../../middlewares/auth')

const validationHandler = genValidationHandler({
  body: joi.object({
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
  const userList = await UserModel.findAll(queryOpts)

  return res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      message: 'Lấy thông tin người dùng thành công.',
      users: _.map(userList, (user) => _.pick(user, ['id', 'email', 'fullname', 'role', 'active', 'phone', 'avatarUrl', 'description']))
    }
  })
}

module.exports = [
  require('../../../middlewares/auth-optional'),
  validationHandler,
  searchHandler
]

function transformInput({ req }) {
  const data = _.cloneDeep(req.body)
  const queryOpts = {
    where: { role: { [Op.ne]: USER_ROLE.ADMIN } }, 
    offset: data.offset,
    limit: data.limit,
    order: data.order
  }

  return queryOpts
}
