
require('dotenv').config()
const config = require('config')


// config.get = function(key) {
//   try {
//     return config.get(key)
//   } catch (err){
//     console.log(err.message)
//     if (err.name === 'RangeError') return undefined
//     throw err
//   }
// }

console.log(config.get('db'))
console.log(config.get('nothing'))