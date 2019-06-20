// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const likes = db.collection('likes')
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  try {
    return await likes.where({
      userId: event.userId
    }).remove()
  } catch (e) {
    console.error(e)
  }

}