// pages/about/timeline.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dreamList: []

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.showModal()
    var that = this
    wx.cloud.callFunction({
      name: 'getAllDreams',
      data: {
        userId:app.globalData.openid
      },
      success: res => {
        console.log(res.result.data)
        if(res.result.data.length == 0){
          this.setData({
            haveDream:'false'
          })
          wx.showToast({
            title: '还没有发布任何愿望喔',
          })
          return;
        }
        var dreamlist = []
        for(let i = 0;i< res.result.data.length;i++){
          dreamlist[i] = res.result.data[i]
          var time = res.result.data[i].dreamdt
         dreamlist[i].dreamdt = time.slice(6,10)
         dreamlist[i].time = time.slice(11, 16)
          console.log(dreamlist[i].time)
          if(dreamlist[i].time > "12:00"){
           dreamlist[i].flag = true
          }
          else{
           dreamlist[i].flag = false
          }
        }
        console.log(dreamlist)
        that.setData({
          dreamList: dreamlist
        })
        this.hideModal()
      },
      fail:err => {
        this.hideModal()
        wx.showToast({
          title: '加载出错咯',
          icon: 'none'
        })
      }
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    console.log('saged')

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

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
  showDream:function(e) {
    console.log()
    wx.navigateTo({
      url: '../../dreaminfo/dreaminfo',
    })
  },
  goDreamDetail:function(e) {
    let dreamId = e.currentTarget.dataset.dreamId
    wx.navigateTo({
      url: "../../dreaminfo/dreaminfo?dreamId=" + dreamId
    })

  },
  showModal() {
    this.setData({
      modalName: 'Image'
    })
  },
  hideModal() {
    this.setData({
      modalName: null
    })
  },
})