// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  const dream = db.collection('dream');
  if (event.dreamType == 6) {
    return await dream.where({
        userId: event.userId
      })
      .skip(event.startIndex)
      .limit(20)
      .orderBy('dreamdt', 'desc')
      .get({})
  } else {
    return await dream.where({
        dreamType: event.dreamType,
        userId: event.userId
      })
      .skip(event.startIndex)
      .limit(20)
      .orderBy('dreamdt', 'desc')
      .get({})
  }
}