
require('dotenv').config()
const config = require('config')
const _ = require('lodash')


// config.get = function(key) {
//   try {
//     return config.get(key)
//   } catch (err){
//     console.log(err.message)
//     if (err.name === 'RangeError') return undefined
//     throw err
//   }
// }
const exercise = {
  id: 1,
  title: 'Title de thi',
  description: 'desc de thi',
  duration: 30,
  category: { id: 1, title: 'cate title', description: 'cate desc', dasdasd: 'asdd' },
  createdUser: { id: 1, email: 'haudeptrai', asd:'asd' },
  tags: [{ id: 1, title: 'tag1', description: 'tag1 decs' }, { id: 1, title: 'tag1', description: 'tag1 decs', asdasd:'asdasd' }]
}
console.log(_.pick(exercise, [
  'id', 'title', 'description', 'duration',
  'category.id', 'category.title', 'category.description',
  'tags.id', 'tags.title', 'tags.description',
  'createdUser.id', 'createdUser.email'
]))