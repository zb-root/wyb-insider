let service = require('./service')
let router = require('./router')

module.exports = function (opts = {}) {
  ['db', 'gateway', 'lng', 'utcOffset']
    .forEach(function (key) {
      process.env[key] && (opts[key] = process.env[key])
    })
  opts.utcOffset = Number(opts.utcOffset)

  let o = service(opts)
  o.router = router
  return o
}
