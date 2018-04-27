let jm = require('jm-dao')
let event = require('jm-event')
let _schema = require('../../schema/insider')

module.exports = function (service, opts = {}) {
  let schema = opts.schema || _schema()

  let model = jm.dao({
    db: opts.db,
    modelName: opts.modelName || 'insider',
    tableName: opts.tableName,
    prefix: opts.tableNamePrefix,
    schema: schema,
    schemaExt: opts.schemaExt
  })
  event.enableEvent(model)

  model.addPermission = function (opts = {}, cb) {
    let conditions = {}
    if (opts.id) {
      conditions._id = opts.id
    } else {
      conditions = {mobile: opts.mobile, name: opts.name, idcard: opts.idcard}
    }
    service.user.get('/findUser', {conditions: conditions}, function (err, doc) {
      if (err || doc && doc.err) {
        console.log(doc || err)
        cb && cb(err, doc)
      } else {
        let ret = doc
        if (!ret) return
        service.acl.post('/users', {
          _id: ret._id,
          nick: ret.name,
          status: 1,
          visible: true,
          roles: ['insider'],
          creator: opts.creator
        }, function (err, doc) {
          if (err || doc && doc.err) {
            console.log(doc || err)
          }
          cb && cb(err, doc)
        })
      }
    })
  }

  model.removePermission = function (id, cb) {
    service.acl.delete('/users/' + id, {}, function (err, doc) {
      cb && cb(err, doc)
    })
  }

  return model
}
