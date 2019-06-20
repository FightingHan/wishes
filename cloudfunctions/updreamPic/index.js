// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const fs = require('fs')
const path = require('path')

// 云函数入口函数
exports.main = async (event, context) => {
  if (event.dreamPic == null)
  return {
    result: {
      fileID:null
    }
  }
  var wxContext = cloud.getWXContext()
  var filePath = event.dreamPic
  var name = Math.random().toString(36).substr(2, 15)
  var cloudPath = 'dreamPic/' + name + event.picPath.match(/\.[^.]+?$/)[0]
  var fileStream = fs.createReadStream(path.join('dreamPic/', name + event.picPath.match(/\.[^.]+?$/)[0]))
  return cloud.uploadFile({
    cloudPath,
    fileContent: fileStream
  })
}