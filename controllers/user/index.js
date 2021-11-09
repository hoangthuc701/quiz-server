
module.exports = {
  register: require('./register.controller'),
  login: require('./login.controller'),
  testAuth: require('./test-auth'),
  forgetPwd: require('./forget-pwd'),
  resetPwd: require('./reset-password'),
  updatePwd: require('./update-password')
}