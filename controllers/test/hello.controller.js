const { Account, Info } = require('../../models')

module.exports = function(req, res) {
  // Info.create({
  //   address: '227 Nguyen Van Cu'
  // }).then(console.log)
  // Account.findOne({
  //   where: {
  //     id: 1
  //   },
  //   include: [Info]
  // }).then((ac) => {
  //   console.log(ac)
  //   console.log(ac.info)
  // })
  res.json({
    msg: `Hello ${req.query.name}`
  })
}