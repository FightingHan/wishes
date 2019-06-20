// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const userinfo = db.collection('userinfo')
  try {
    return await userinfo.where({
      userId: _.in(event.userId)
    }).field({
      nickName: true,
      avatarUrl: true,
      userId: true
    }).get()
  } catch (e) {
    console.error(e)
  }
}