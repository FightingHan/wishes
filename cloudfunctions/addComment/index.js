// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

/**
 * commentdt: 评论时间，
 * content: 评论内容，
 * dreamId: 评论的愿望id
 * islegal: true,
 * likes: 0,
 * userId: 
 */

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const coomment = db.collection('comment')
  return await coomment.add({
    data: {
      commentdt: event.commentdt,
      comment: event.comment,
      dreamId: event.dreamId,
      islegal: true,
      likes: 0,
      userId: wxContext.OPENID     
    }
  })
}