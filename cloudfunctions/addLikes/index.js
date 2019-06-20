// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  const likes = db.collection('likes')
  await likes.add({
    data: {
      userId: wxContext.OPENID,
      infoId: event.infoId,
      type: event.type,
    }
  })
  const comment = db.collection('comment')
  const dream = db.collection('dream')
  if (event.type == 1) {
    try {
      return await comment.where({
        _id: event.infoId
      }).update({
        data: {
          likes: _.inc(1)
        },
      })
    } catch (e) {
      console.error(e)
    }
  } else if (event.type == 0) {
    try {
      return await dream.where({
        _id: event.infoId
      }).update({
        data: {
          dreamLikes: _.inc(1)
        },
      })
    } catch (e) {
      console.error(e)
    }
  }
}