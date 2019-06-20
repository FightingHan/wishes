// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const comment = db.collection('comment')
  return await comment.where({
      dreamId: event.dreamId,
      userId: event.userId
    })
    .skip(event.startIndex) 
    .limit(20)
    .orderBy('commentdt','desc')// 跳过结果集中的前 0 条，从第 11 条开始返回
    .get({})
}