// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const userinfo = db.collection('userinfo')
  return await userinfo.add({
    data:{
      userId: event.userId,
      nickName: event.nickName,
      avatarUrl: event.avatarUrl,
      state: true,
      userType: 0
    }
  })
}