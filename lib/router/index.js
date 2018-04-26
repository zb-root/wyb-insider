let async = require('async')
let _ = require('lodash')
let moment = require('moment')
let MS = require('jm-ms-core')
let help = require('./help')
let insider = require('./insider')

let ms = new MS()

module.exports = function (opts = {}) {
  let service = this
  let router = ms.router()
  let t = service.t
  let Err = service.Err
  let logger = service.getLogger('main', __filename)

  this.onReady().then(() => {
    router
      .use(help(service))
      .use('/infos', insider(service))
  })

  return router
}
