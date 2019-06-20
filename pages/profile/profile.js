// pages/profile/profile.js
const app = getApp();
Page({
  data: {
    userInfo: {},
    sumDream: 0,
    sumLikes: 0,
    sumComment: 0,
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.attached()
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    /**
     * 在app.json中登录过了，在此获取用户的信息
     */
    console.log(app.globalData.userInfo)
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.attached()

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  attached: function() {
    var that = this
    var sum = 0
    var sumDream = 0
    wx.cloud.callFunction({
      name: 'getAllDreams',
      data: {
        userId: app.globalData.openid,
      },
      success: res => {
        res.result.data.forEach(function (item, index) {
          sum += item.dreamLikes;
        })
        sumDream = res.result.data.length
        wx.cloud.callFunction({
          name: 'getAllComment',
          data:{
            userId: app.globalData.openid
          },
          success: res => {
            res.result.data.forEach(function (item, index) {
              sum += item.likes;
            })
            const e = {
              sumDream: sumDream,
              sumLikes: sum,
              sumComment: res.result.data.length,
              i: 0
            }
            that.numDH(e)
          }
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  numDH: function(e) {
    var that = this
    if (e.i < 18) {
      setTimeout(function () {
        that.setData({
          sumDream: e.i,
          sumLikes: e.i,
          sumComment: e.i
        })
        e.i++
        that.numDH(e);
      }, 26)
    } else {
      that.setData({
        sumDream: that.coutNum(e.sumDream),
        sumLikes: that.coutNum(e.sumLikes),
        sumComment: that.coutNum(e.sumComment)
      })
      that.data.i = 0
    }
  },
  coutNum(e) {
    if (e > 1000 && e < 10000) {
      e = (e / 1000).toFixed(1) + 'k'
    }
    if (e > 10000) {
      e = (e / 10000).toFixed(1) + 'W'
    }
    return e
  }
})