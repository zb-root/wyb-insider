let async = require('async')
let _ = require('lodash')
let mongoose = require('mongoose')
let daorouter = require('jm-ms-daorouter')
let MS = require('jm-ms-core')
let moment = require('moment')
let validator = require('validator')

let ms = new MS()
let ObjectId = mongoose.Types.ObjectId

module.exports = function (service, opts = {}) {
  let utils = service.utils
  let t = service.t
  let Err = service.Err
  let logger = service.getLogger('main', __filename)

  let defList = {
    conditions: {},
    options: {
      sort: [{'crtime': -1}]
    },
    fields: {},
    populations: null
  }
  let defGet = {
    conditions: {},
    fields: {},
    populations: null // 没有的话一定要是不传或者null,如果是{}则查不到数据
  }

  let listOpts = opts.list || defList
  let getOpts = opts.get || defGet

  let self = service.insider
  let router = ms.router()
  service.onReady().then(() => {
    router
      .use(daorouter(self, {
        list: listOpts,
        get: getOpts
      }))
    let routes = self.routes

    /**
     * @api {get} /infos 获取内部人员列表
     * @apiVersion 0.0.1
     * @apiGroup insider
     * @apiUse Error
     *
     * @apiParam {Number} [page=1] 第几页(可选).
     * @apiParam {Number} [rows=20] 一页几行(可选,默认20).
     * @apiParam {Object} [fields] 筛选字段(可选)
     * @apiParam {Object} [sort] 对查询数据排序(可选).
     * @apiParam {String} [search] 模糊查询(可选).
     * @apiParam {String} [startDate] 开始时间(可选).
     * @apiParam {String} [endDate] 结束时间(可选).
     * @apiParam {String} [utcOffset] 时区偏移(可选).
     * @apiParam {String} [name] 姓名(可选).
     * @apiParam {String} [mobile] 手机号(可选).
     * @apiParam {String} [idcard] 身证号(可选).
     * @apiParam {String} [department] 部门(可选).
     * @apiParam {Number} [state] 状态(可选).
     *
     * @apiParamExample {json} 请求参数例子:
     * {
     *  page: 1,
     *  rows: 10,
     *  fields: {status:1}
     * }
     *
     * @apiSuccessExample {json} 成功:
     * {
     *  page:1,
     *  pages:2,
     *  total:10,
     *  rows:[{}]
     * }
     */
    routes.before_list = function (opts, cb, next) {
      let data = opts.data || {}
      logger.debug(opts.originalUri + ' request params:' + JSON.stringify(data))
      let lng = data.lng
      if (data.page === undefined) data.page = 1
      if (data.rows === undefined) data.rows = 20
      let utcOffset = data.utcOffset
      let startDate = data.startDate
      let endDate = data.endDate
      let fields = data.fields
      let sort = data.sort
      let search = data.search
      let name = data.name
      let mobile = data.mobile
      let idcard = data.idcard
      let department = data.department
      let state = data.state

      opts.conditions || (opts.conditions = {})
      let conditions = opts.conditions
      if (startDate) {
        if (isNaN(Date.parse(startDate))) {
          return cb(null, t(Err.FA_PARAMS_FAIL, lng, {params: 'startDate'}))
        }
        startDate = new Date(startDate)
        conditions.crtime = conditions.crtime || {}
        conditions.crtime['$gte'] = startDate
      }
      if (endDate) {
        if (isNaN(Date.parse(endDate))) {
          return cb(null, t(Err.FA_PARAMS_FAIL, lng, {params: 'endDate'}))
        }
        endDate = new Date(endDate)
        conditions.crtime = conditions.crtime || {}
        conditions.crtime['$lte'] = endDate
      }

      if (search) {
        conditions.$or || (conditions.$or = [])
        let ary = conditions.$or
        let pattern = '.*?' + search + '.*?'
        ary.push({'name': {$regex: pattern}})
        ary.push({'mobile': {$regex: pattern}})
        ary.push({'idcard': {$regex: pattern}})
        ary.push({'department': {$regex: pattern}})
      }
      if (name) {
        // conditions.$or || (conditions.$or = [])
        // conditions.$or.push({name: {$regex: '.*?' + name + '.*?'}})
        conditions.name = {$regex: '.*?' + name + '.*?'}
      }
      if (mobile) {
        // conditions.$or || (conditions.$or = [])
        // conditions.$or.push({mobile: {$regex: '.*?' + mobile + '.*?'}})
        conditions.mobile = {$regex: '.*?' + mobile + '.*?'}
      }
      if (idcard) {
        // conditions.$or || (conditions.$or = [])
        // conditions.$or.push({idcard: {$regex: '.*?' + idcard + '.*?'}})
        conditions.idcard = {$regex: '.*?' + idcard + '.*?'}
      }
      if (department) {
        // conditions.$or || (conditions.$or = [])
        // conditions.$or.push({department: {$regex: '.*?' + department + '.*?'}})
        conditions.department = {$regex: '.*?' + department + '.*?'}
      }
      if (state != undefined) {
        conditions.state = state
      }

      if (fields) {
        if (typeof fields === 'string') {
          try {fields = JSON.parse(fields)} catch (e) {fields = null}
        }
        if (!_.isPlainObject(fields)) {
          return cb(null, t(Err.FA_PARAMS_FAIL, lng, {params: 'fields'}))
        }
        opts.fields = fields
      }

      if (sort) {
        if (typeof sort === 'string') {
          try {sort = JSON.parse(sort)} catch (e) {sort = null}
        }
        if (!_.isPlainObject(sort)) {
          return cb(null, t(Err.FA_PARAMS_FAIL, lng, {params: 'sort'}))
        }
        opts.options = {sort: sort}
      }

      next()
    }

    /**
     * @api {get} /infos/:id 获取某一内部人员信息
     * @apiVersion 0.0.1
     * @apiGroup insider
     * @apiUse Error
     *
     * @apiParam {Object} [fields] 筛选字段(可选)
     *
     * @apiParamExample {json} 请求参数例子:
     * {
     *  fields: {status:1}
     * }
     *
     * @apiSuccessExample {json} 成功:
     * {
     * }
     */
    routes.before_get = function (opts, cb, next) {
      let data = opts.data || {}
      let lng = data.lng
      let fields = data.fields
      if (fields) {
        if (typeof fields === 'string') {
          try {fields = JSON.parse(fields)} catch (e) {fields = null}
        }
        if (!_.isPlainObject(fields)) {
          return cb(null, t(Err.FA_PARAMS_FAIL, lng, {params: 'fields'}))
        }
        opts.fields = fields
      }
      next()
    }

    /**
     * @api {post} /infos 创建内部人员
     * @apiVersion 0.0.1
     * @apiGroup insider
     * @apiUse Error
     *
     * @apiParam {String} [name] 姓名(必填)
     * @apiParam {String} [mobile] 手机号(必填)
     * @apiParam {String} [idcard] 身份证号(必填)
     * @apiParam {String} [department] 部门(可选)
     * @apiParam {Number} [state] 权限状态(必填)
     *
     * @apiParamExample {json} 请求参数例子:
     * {
     * }
     *
     * @apiSuccessExample {json} 成功:
     * {
     * }
     */
    routes.before_create = function (opts, cb, next) {
      let data = opts.data || {}
      let lng = data.lng
      logger.debug(opts.originalUri + ' create params:' + JSON.stringify(data))
      let params = utils.requireField(data, ['name', 'mobile', 'idcard', 'state'])
      if (params) {
        return cb(null, t(Err.FA_REQUIRE, lng, {params: params}))
      }
      if (!utils.isIdCardNo(data.idcard)) {
        return cb(null, t(Err.FA_PARAMS_FAIL, lng, {params: 'idcard'}))
      }
      if (!validator.isMobilePhone(data.mobile.toString(), 'zh-CN')) {
        return cb(null, t(Err.FA_PARAMS_FAIL, lng, {params: 'mobile'}))
      }
      opts.data = _.pick(data, ['name', 'mobile', 'idcard', 'state', 'department', 'memo'])
      opts.data.crtime = new Date()
      opts.data.moditime = new Date()
      next()
    }

    routes.after_create = function (opts, cb, next) {
      let data = opts.data || {}
      let lng = data.lng
      if (opts.err && opts.err.code == 11000) {
        logger.warn(opts.err)
        return cb(null, t(Err.FA_EXISTS, lng))
      }
      next()

      if (!opts.err && data.state == 1) {
        service.insider.addPermission({
          name: data.name.toString(),
          idcard: data.idcard.toString(),
          mobile: data.mobile.toString(),
          creator: opts.headers.acl_user
        }, function (err, doc) {
          opts.doc.user = doc.id
          opts.doc.save(function (err) {})
        })
      }
    }

    /**
     * @api {post} /infos/:id 更新内部人员信息
     * @apiVersion 0.0.1
     * @apiGroup insider
     * @apiUse Error
     *
     * @apiParam {String} [name] 姓名(必填)
     * @apiParam {String} [mobile] 手机号(必填)
     * @apiParam {String} [idcard] 身份证号(必填)
     * @apiParam {String} [department] 部门(可选)
     * @apiParam {Number} [state] 权限状态(必填)
     *
     * @apiParamExample {json} 请求参数例子:
     * {
     * }
     *
     * @apiSuccessExample {json} 成功:
     * {
     * }
     */
    routes.before_update = function (opts, cb, next) {
      opts.data = _.omit(opts.data, ['moditime', 'crtime', 'user'])
      let data = opts.data
      let lng = data.lng

      if (data.idcard && !utils.isIdCardNo(data.idcard)) {
        return cb(null, t(Err.FA_PARAMS_FAIL, lng, {params: 'idcard'}))
      }
      if (data.mobile && !validator.isMobilePhone(data.mobile.toString(), 'zh-CN')) {
        return cb(null, t(Err.FA_PARAMS_FAIL, lng, {params: 'mobile'}))
      }
      opts.data.moditime = new Date()
      next()
    }

    routes.after_update = function (opts, cb, next) {
      let id = opts.params.id
      let data = opts.data || {}
      let state = data.state
      next()

      if (!opts.err && state != undefined) {
        service.insider.findOne({_id: id}, null, {lean:true}, function (err, insiderDoc) {
          if (insiderDoc) {
            if (state == 1) {
              service.insider.addPermission({
                mobile: insiderDoc.mobile,
                name: insiderDoc.name,
                idcard: insiderDoc.idcard,
                creator: opts.headers.acl_user
              }, function (err, doc) {
                if (err || doc && doc.err){
                  if(insiderDoc.user){
                    service.insider.removePermission(insiderDoc.user.toString(),function(err, doc){
                      service.insider.update({_id: id}, {$unset:{user:''}}, function (err, doc) {
                      })
                    })
                  }
                  return
                }
                service.insider.update({_id: id}, {user: doc.id}, function (err, doc) {
                })
              })
            } else {
              insiderDoc.user && service.insider.removePermission(insiderDoc.user.toString(),function(err, doc){
                service.insider.update({_id: id}, {$unset:{user:''}}, function (err, doc) {
                })
              })
            }
          }
        })
      }
    }

    routes.before_remove = function (opts, cb, next) {
      next()

      let id = opts.params.id || opts.data.id
      let ids = Array.isArray(id) ? id : id.toString().split(',')
      service.insider.find({_id: {$in: ids}}, function (err, docs) {
        if (docs) {
          docs.forEach(function (doc) {
            doc.user && service.insider.removePermission(doc.user.toString())
          })
        }
      })
    }

  })
  return router
}
