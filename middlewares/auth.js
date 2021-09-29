const config = require('config')
const jwt = require('../util/jwt')

module.exports = async function (req, res, next) {
  const accessToken = req.headers.authorization
  if (!accessToken) return res.status(401).json({
    message: 'Unauthorized'
  })

  const jwtSecret = config.get('jwtSecret')

  try {
    
    const decoded = await jwt.verifyAsync(accessToken, jwtSecret)
    req.user = decoded
    return next()

  } catch (err) {
    return res.status(401).json({
      message: 'Unauthorized'
    })
  }
}