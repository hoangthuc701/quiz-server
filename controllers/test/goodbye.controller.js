

module.exports = function(req, res) {
  res.json({
    msg: `Goodbye ${req.query.name}`
  })
}