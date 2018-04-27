let async = require('async')
let _ = require('lodash')
let moment = require('moment')
let MS = require('jm-ms-core')
let help = require('./help')
let insider = require('./insider')
let mongoose = require('mongoose')
let ObjectId = mongoose.Types.ObjectId

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
      .add('/info', 'get', function (opts, cb, next) {
        let data = opts.data
        let lng = data.lng
        let uid = data.uid
        let mobile = data.mobile
        let conditions = {state: 1}
        if (uid) {
          if (!ObjectId.isValid(uid)) {
            return cb(null, t(Err.FA_PARAMS_FAIL, lng, {params: 'uid'}))
          }
          conditions.user = uid
        }
        if (mobile) {
          conditions.mobile = mobile
        }
        service.insider.findOne(conditions, {mobile: 1, name: 1, idcard: 1, department: 1}, function (err, doc) {
          if (err) {
            console.log(err)
            return cb(null, t(Err.FA_SYS, lng))
          }
          cb(null, doc)
        })
      })
      .add('/info', 'post', function (opts, cb, next) {
        let data = opts.data
        let lng = data.lng
        let uid = data.uid
        if (!uid) return cb(null, {ret: 0})
        service.user.get('/users/' + uid, {}, function (err, user) {
          if (err || user && user.err) return cb(err, user)
          if (!user) return cb(null, {ret: 0})
          service.insider.findOneAndUpdate({user: uid}, {
            mobile: user.mobile,
            name: user.name,
            idcard: user.idcard,
            moditime: new Date()
          }, function (err, doc) {
            if (err || !doc) return cb(null, {ret: 0})
            cb(null, {ret: 1})
          })
        })
      })
      .add('/addPermission', 'post', function (opts, cb, next) {
        let data = opts.data
        let uid = data.uid
        if (!uid) return cb(null, {ret: 0})
        service.user.get('/users/' + uid, {}, function (err, user) {
          if (err || user && user.err) return cb(err, user)
          if (!user) return cb(null, {ret: 0})
          let name = user.name
          let mobile = user.mobile
          let idcard = user.idcard
          if (!name || !mobile || !idcard) return cb(null, {ret: 0})
          service.insider.findOneAndUpdate({name: name, idcard: idcard, mobile: mobile, state: 1}, {
            user: user._id,
            moditime: new Date()
          }, function (err, doc) {
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
