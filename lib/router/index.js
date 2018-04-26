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
      .add('/addPermission', 'post', function (opts, cb, next) {
        let data = opts.data
        let uid = data.id
        if (!uid) return cb(null, {ret: 0})
        service.user.get('/users/' + uid, {}, function (err, user) {
          if (err || user && user.err) return cb(err, user)
          if (!user) return cb(null, {ret: 0})
          let mobile = user.mobile
          if (!mobile) return cb(null, {ret: 0})
          service.insider.findOneAndUpdate({mobile: mobile, state: 1}, {state: 1, user: user._id}, function (err, doc) {
            if (err || !doc) return cb(null, {ret: 0})
            service.acl.post('/users', {
              _id: user._id,
              nick: user.name,
              status: 1,
              visible: true,
              roles: ['insider'],
              creator: opts.headers.acl_user
            }, function (err, doc) {
              if (err || doc && doc.err) {
                console.log(doc || err)
                cb(null, {ret: 0})
                return
              }
              cb(null, {ret: 1})
            })
          })
        })
      })
  })

  return router
}
