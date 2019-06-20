// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const likes = db.collection('likes')
  try {
    return await likes.where({
      type: event.type,
      userId: event.userId,
      infoId: _.in(event.infoId)
    }).get()
  } catch (e) {
    console.error(e)
  }
}