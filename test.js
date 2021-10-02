
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
const currTagIdList = [1,2,3]
const body = {
  tagIdList: [1,2,3]
}
console.log(_.filter(currTagIdList, tagId => !_.includes(body.tagIdList, tagId)))