const cloud = require('wx-server-sdk')
// 云函数入口函数 
cloud.init()


const db = cloud.database()
/** 
 *     data1:{ 
      dreamContent: event.dreamContent, 
      dreamType: event.dreamType, 
      userId : event.userId, 
      dreamLocation: event.dreamLocation, 
      dreamState: event.dreamState, 
      dreamPic: event.dreamPic, 
      dreamdt: event.dreamdt, 
      dreamLikes: event.dreamLikes 
    }, 
 */
/** 
 *     mydream data 
 * dreamContent :"愿望内容" , 
 * dreamType : 0 , 
 * userId : "001" , 
 * dreamLocation : [经度，纬度] ， 
 * dreamState : true ,  
 * dreamPic : "愿望图片链接" ， 
 * dreamdt : 2019-02-19, 
 * dreamLikes: 12 
 *  
 */

exports.main = async(event, context) => {
  //将照片上传至云端需要刚才存储的临时地址
  const wxContext = cloud.getWXContext()
  return await db.collection('dream').add({
    data: {
      dreamContent: event.dreamContent,
      dreamType: event.dreamType,
      userId: event.userId,
      dreamLocation: event.dreamLocation,
      dreamState: event.dreamState,
      dreamPic: event.dreamPic,
      dreamdt: event.dreamdt,
      dreamLikes: event.dreamLikes
    }
  })
}