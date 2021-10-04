const config = require('config')
const jwt = require('../util/jwt')

module.exports = async function (req, res, next) {
  const accessToken = req.headers.authorization
  if (!accessToken) return next()

  const jwtSecret = config.get('jwtSecret')

  try {
    
    const decoded = await jwt.verifyAsync(accessToken, jwtSecret)
    req.user = decoded

  } catch (err) {
    
  }

  return next()
}