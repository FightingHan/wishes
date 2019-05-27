Page({

  /**
   * 页面的初始数据
   */
  data: {
    dreamPic: '',
    markers: [
    ]

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  addmarkers: function() {
    const db = wx.cloud.database()
    const dream = db.collection('dream')
    var that = this;
    dream.get({
      success(res) {
        console.log(res.data[0]);
        for (var i = 0; i < res.data.length; i++) {
          // that.data.markers[i].id=i;
          // mark.id=i;
          var param = {};
          var string = "markers[" + i + "].id";
          param[string] = res.data[i].dreamId;
          that.setData(param);

          var string = "markers[" + i + "].iconPath";
          param[string] = "../../icons/creation.png";
          that.setData(param);

          var string = "markers[" + i + "].latitude";
          param[string] = res.data[i].dreamLocation.latitude;
          that.setData(param);

          var string = "markers[" + i + "].longitude";
          param[string] = res.data[i].dreamLocation.longitude;
          that.setData(param);

          var string = "markers[" + i + "].width";
          param[string] = 30;
          that.setData(param);

          var string = "markers[" + i + "].height";
          param[string] = 30;
          that.setData(param);
        }
        //   console.log(res.data[1])
        var markk = that.data.markers;
        that.setData({
          markers: markk
        })
      }
    })
  },
  select: function() {
    const db = wx.cloud.database()
    const dream = db.collection('dream')
    var that = this;
    dream.where({
      dreamId: "1"
    }).get({
      success(res) {
        console.log(res.data[0].dreamPic);
        that.setData({
          dreamPic: res.data[0].dreamPic
        });
      }
    })
  },

  add: function() {
    console.log('scdvdv')
    const db = wx.cloud.database()
    const dream = db.collection('dream')
    dream.add({
      data: {
        dreamContent: '又是快乐的一天',
        dreamId: '1',
        dreamLocation: new db.Geo.Point(104.0568588879, 30.5443232220),
        dreamPic: 'http://qty83k.creatby.com/materials/origin/cc09a72b7456da9c074c33dfffc1f94b_origin_2.jpg',
        dreamType: 1,
        userId: '002'
      },
      success: function(res) {
        console.log(res + 'bjmkbkv')
      }
    })
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

  }
})