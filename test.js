
require('dotenv').config()
const config = require('config')
const _ = require('lodash')
const async = require('async')


// config.get = function(key) {
//   try {
//     return config.get(key)
//   } catch (err){
//     console.log(err.message)
//     if (err.name === 'RangeError') return undefined
//     throw err
//   }
// }
function f(ms) {
  return new Promise((res, rej) => {
    if (ms === 0) return rej()
    return setTimeout(() => {
      console.log('done', ms)
      res()
    }, ms)
  })
}

// const jobs = [500, 1000, 0, 700, 300];

const jobs = [f(500), f(1000), f(0), f(700), f(300)];
(async () => {
    await Promise.all(jobs)
    console.log('doneeeeee')
})()