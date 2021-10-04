const joi = require('joi')
const _ = require('lodash')
const md5 = require('md5')
const COMMON_RESPONSE_CODE = require('../../constants/response-code.constants').COMMON
const USER_ROLE = require('../../constants/user.constants').USER_ROLE
const { 
  User: UserModel,
  Comment: CommentModel,
  Exercise: ExerciseModel
} = require('../../models')
const genValidationHandler = require('../../middlewares/gen-request-validation')
const authMiddleware = require('../../middlewares/auth')

const validationHandler = genValidationHandler({
  body: joi.object({
    exerciseId: joi.number().required().positive().invalid(null),
    content: joi.string().trim().required().invalid('', null)
  }).unknown(false)
})

async function createHandler(req, res) {
  const [errMsg, { commentInsertData }] = await transformInput(req)
  if (errMsg) return res.json({
    code: COMMON_RESPONSE_CODE.FAILED,
    data: {
      message: errMsg
    }
  })

  const comment = await CommentModel.create(commentInsertData)
  if (!comment) {
    return res.json({
      code: COMMON_RESPONSE_CODE.FAILED,
      data: {
        message: 'Bình luận thất bại.'
      }
    })
  }

  const responseData = await transformResponse({ comment })
  return res.json({
    code: COMMON_RESPONSE_CODE.SUCCEEDED,
    data: {
      message: 'Bình luận thành công.',
      comment: responseData
    }
  })
}

module.exports = [
  authMiddleware,
  validationHandler,
  createHandler
]

async function transformInput({ body, user }) {
  const commentInsertData = _.cloneDeep(body)
  commentInsertData.userId = user.id
  
  const exercise = await ExerciseModel.findOne({ where: { active: true, id: commentInsertData.exerciseId }})
  if (!exercise) return ['Đề thi không tồn tại.', { commentInsertData }]

  return [null, { commentInsertData }]
}

async function transformResponse({ comment }) {
  const user = await UserModel.findOne({ where: { id: comment.userId }})
  comment.user = user
  return _.pick(comment, ['id', 'active', 'content', 'createdAt', 'updatedAt', 'user.id', 'user.email', 'user.fullname'])
}