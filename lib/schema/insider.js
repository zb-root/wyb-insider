let mongoose = require('mongoose')

let Schema = mongoose.Schema

// 内部人员信息
let schemaDefine = {
  user: {type: Schema.Types.ObjectId, ref: 'user'}, // 绑定某一用户
  mobile: {type: String, unique: true, sparse: true, index: true}, // 手机号
  name: {type: String}, // 姓名
  idtype: {type: Number, default: 0}, // 身份证类型，默认0 居民身份证
  idcard: {type: String}, // 身份证号
  department: {type: String}, // 部门
  state: {type: Number, default: 1}, // 权限状态(0:暂停使用,1:正常使用)
  moditime: {type: Date}, // 更新时间
  crtime: {type: Date, default: Date.now} // 创建时间
}

module.exports = function (schema) {
  schema || (schema = new Schema())
  schema.add(schemaDefine)
  return schema
}
