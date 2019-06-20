const app = getApp();
const dreampic = [
  '../../icons/love.png',
  '../../icons/music.png',
  '../../icons/gift.png',
  '../../icons/book.png',
  '../../icons/life.png'
]
var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js');

// 实例化API核心类
var qqmapsdk = new QQMapWX({
  key: 'VC4BZ-LA4KS-I5UO4-6OKRX-E24WZ-ODFFW' // 必填
});
Page({
  /**
   * 页面的初始数据
   */
  data: {
    dreamPic: '',
    markers: [],
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isHide: false,
    dreamNumber: 0,
    startIndex: 0, //当前有的愿望条数
    modalName: '',
    model: [{
        url: '../../icons/love.png',
        text: '表白专用>-<'
      },
      {
        url: '../../icons/book.png',
        text: '考试稳过！！！'
      },
      {
        url: '../../icons/gift.png',
        text: '随便说点啥'
      },
      {
        url: '../../icons/life.png',
        text: '分享生活中的趣事'
      },
      {
        url: '../../icons/music.png',
        text: '记录欢快的心情哇'
      },
      {
        url: '../../icons/search.png',
        text: '随机看看吧就'
      }
    ],
    longitude: 103.97077,
    latitude: 30.56222,
    flag: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.showLoadModal()
    var that = this;
    var type = options.type
    var dreamtype = 6
    if(type != null){
      dreamtype = parseInt(type)
    }
    that.data.type = dreamtype
    console.log(options)
    // 查看是否授权
    wx.getSetting({
      success: function(res) {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: function(res) {
              // 用户已经授权过,不需要显示授权页面,所以不需要改变 isHide 的值
              //用户授权成功后，调用微信的 wx.login 接口，从而获取code
              wx.login({
                success: res => {
                  // 获取到用户的 code 之后：res.code
                  console.log("用户的code:" + res.code);
                }
              });
            }
          });
        } else {
          // 用户没有授权
          // 改变 isHide 的值，显示授权页面
          that.setData({
            isHide: true
          });
        }
      }
    })
    var that = this
    wx.cloud.callFunction({
      name: 'getDreamList',
      data: {
        startIndex: that.data.startIndex,
        dreamType: dreamtype
      },
      success: res => {
        if (res.result.data.length == 0) {
          this.hideLoadModal()
          wx.showToast({
            title: '还没有这种类型的愿望嘞，快去发布哇！',
            icon: 'none'
          })
          return;
        }
        console.log(res.result.data);
        that.data.deamList = res.result.data
        for (var i = 0; i < res.result.data.length; i++) {
          // that.data.markers[i].id=i;
          // mark.id=i;
          var param = {};
          var string = "markers[" + i + "].id";
          param[string] = res.result.data[i]._id;
          that.setData(param);

          var string = "markers[" + i + "].iconPath";
          param[string] = dreampic[res.result.data[i].dreamType];
          that.setData(param);

          var string = "markers[" + i + "].latitude";
          param[string] = res.result.data[i].dreamLocation.latitude;
          that.setData(param);

          var string = "markers[" + i + "].longitude";
          param[string] = res.result.data[i].dreamLocation.longitude;
          that.setData(param);

          var string = "markers[" + i + "].width";
          param[string] = 56;
          that.setData(param);

          var string = "markers[" + i + "].height";
          param[string] = 56;
          that.setData(param);
        }
        //   console.log(res.data[1])
        var markk = that.data.markers;
        that.setData({
          markers: markk,
          startIndex: that.data.startIndex + res.result.data.length,
          type: dreamtype
        })
        this.hideLoadModal()
        wx.showToast({
          title: '找到了' + res.result.data.length + '条愿望喔',
          icon: 'none'
        })
      },
      fail: err => {
        this.hideLoadModal()
        wx.showToast({
          title: '出现问题咯',
          icon: 'none'
        })
        console.log(err)
      }
    })


  },


  //在Page({})中使用下列代码
  //数据回填方法
  backfill: function (e) {
    var id = e.currentTarget.id;
    for (var i = 0; i < this.data.suggestion.length; i++) {
      if (i == id) {
        this.setData({
          backfill: this.data.suggestion[i].title
        });
      }
    }
  },
  close: function(){
    this.setData({
      backfill: "",
      suggestion: []
    });
  
  },

  changeLocation:function(e){
    console.log(e)
    var longitude = e.currentTarget.dataset.longitude
    var latitude = e.currentTarget.dataset.latitude
    this.setData({
      longitude: longitude,
      latitude: latitude,
      flag: true
    })

  },

  //触发关键词输入提示事件
  getsuggest: function (e) {
    var _this = this;
    //调用关键词提示接口
    qqmapsdk.getSuggestion({
      //获取输入框值并设置keyword参数
      keyword: e.detail.value, //用户输入的关键词，可设置固定值,如keyword:'KFC'
      //region:'北京', //设置城市名，限制关键词所示的地域范围，非必填参数
      success: function (res) {//搜索成功后的回调
        console.log(res);
        var sug = [];
        for (var i = 0; i < res.data.length; i++) {
          sug.push({ // 获取返回结果，放到sug数组中
            title: res.data[i].title,
            id: res.data[i].id,
            addr: res.data[i].address,
            city: res.data[i].city,
            district: res.data[i].district,
            latitude: res.data[i].location.lat,
            longitude: res.data[i].location.lng
          });
        }
        _this.setData({ //设置suggestion属性，将关键词搜索结果以列表形式展示
          suggestion: sug
        });
      },
      fail: function (error) {
        console.error(error);
      },
      complete: function (res) {
        console.log(res);
      }
    });
  },

  refresh: function() {
    this.showLoadModal()
    var that = this
    wx.cloud.callFunction({
      name: 'getDreamList',
      data: {
        startIndex: that.data.startIndex,
        dreamType: that.data.type
      },
      success: res => {
        if (res.result.data.length == 0) {
          wx.showToast({
            title: '没有新的愿望啦!',
            icon: 'none'
          })
          this.hideLoadModal()
          return;
        }
        console.log(res.result.data);
        that.data.deamList = res.result.data
        for (var i = 0; i < res.result.data.length; i++) {
          // that.data.markers[i].id=i;
          // mark.id=i;
          var param = {};
          var string = "markers[" + i + "].id";
          param[string] = res.result.data[i]._id;
          that.setData(param);

          var string = "markers[" + i + "].iconPath";
          param[string] = dreampic[res.result.data[i].dreamType];
          that.setData(param);

          var string = "markers[" + i + "].latitude";
          param[string] = res.result.data[i].dreamLocation.latitude;
          that.setData(param);

          var string = "markers[" + i + "].longitude";
          param[string] = res.result.data[i].dreamLocation.longitude;
          that.setData(param);

          var string = "markers[" + i + "].width";
          param[string] = 56;
          that.setData(param);

          var string = "markers[" + i + "].height";
          param[string] = 56;
          that.setData(param);
        }
        //   console.log(res.data[1])
        var markk = that.data.markers;
        that.setData({
          markers: markk,
          startIndex: that.data.startIndex + res.result.data.length,
        })
        this.hideLoadModal()
        wx.showToast({
          title: '又多捞出来了' + res.result.data.length + '条愿望喔',
          icon: 'none'
        })
      },
      fail: err => {
        wx.showToast({
          title: '刷新失败咯',
          icon: 'none'
        })
      }
    })
  },

  //用户初次授权
  bindGetUserInfo: function(e) {
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      var that = this;
      // 获取到用户的信息了，打印到控制台上看下
      console.log("用户的信息如下：");
      console.log(e.detail.userInfo);
      wx.cloud.callFunction({
        name: 'addUser',
        data: {
          userId: app.globalData.openid,
          nickName: e.detail.userInfo.nickName,
          avatarUrl: e.detail.userInfo.avatarUrl
        },
        success: res => {
          wx.showToast({
            title: '欢迎加入！！！',
          })
        }
      })
      app.globalData.userInfo = e.detail.userInfo
      //授权成功后,通过改变 isHide 的值，让实现页面显示出来，把授权页面隐藏起来
      that.setData({
        isHide: false
      });
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function(res) {
          // 用户没有授权成功，不需要改变 isHide 的值
          if (res.confirm) {
            console.log('用户点击了“返回授权”');
          }
        }
      });
    }
  },
  /**
   * 视野缩放的时候改变marker的高度
   */
  changeMarker: function(e) {
    var that = this
    for (var i = 0; i < that.data.markers.lengths; i++) {
      // that.data.markers[i].id=i;
      // mark.id=i;
      var param = {};
      var string = "markers[" + i + "].width";
      param[string] = 6;
      that.setData(param);

      var string = "markers[" + i + "].height";
      param[string] = 6;
      that.setData(param);
    }
    //   console.log(res.data[1])
    var markk = that.data.markers;
    that.setData({
      markers: markk
    })
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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    this.hideLoadModal()

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

  //查看愿望的详细信息
  checkMarkers: function(e) {
    var that = this
    console.log(e)
    let dreamId = e.markerId
    wx.navigateTo({
      url: '../dreaminfo/dreaminfo?dreamId=' + dreamId + '&type=' + that.data.type
    })
  },
  /**
   * 展示选择类别的模态窗口
   */
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },

  /**
   * 选择类型中！！
   */
  chooseType: function(e) {
    this.hideModal()
    var type = e.currentTarget.dataset.dreamType
    if (type == 5) {
      wx.reLaunch({
        url: '../index/index'
      })
    } else {
      wx.reLaunch({
        url: '../index/index?type=' + type
      })
    }
  },
  /**
   * 用户定位当前自己的位置
   */
  getMyLocation: function(e) {
    wx.getLocation({
      type: 'wgs84',
      success: res => {
        //根据坐标获取当前位置名称，显示在顶部，腾讯地图逆地址解析
        console.log(res.latitude);
        console.log(res.longitude)
        this.setData({
          longitude: res.longitude,
          latitude: res.latitude,
          flag: true
        })
      }
    })
  },

  showLoadModal() {
    this.setData({
      modalName: 'Image'
    })
  },
  hideLoadModal() {
    this.setData({
      modalName: null
    })
  }

})