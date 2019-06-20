// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const MIX_LEN = 100
// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  const dream = db.collection('dream')
  const countResult = await dream.where({
    userId: event.userId
  }).count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  var tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = dream.where({
        userId: event.userId
      }).skip(i * MIX_LEN)
      .limit(MIX_LEN)
      .orderBy('dreamdt', 'desc')
      .get()
    tasks.push(promise)
  }
  // 等待所有
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  })
}