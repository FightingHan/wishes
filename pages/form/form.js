const app = getApp();
const db = wx.cloud.database();
var util = require('../../utils/util.js');
var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js');
var qqmapsdk;
Page({
  data: {
    index: null,
    imgList: [],
    cardCur: 0,
    textareaAValue: '',
    nowLocation: '',
    swiperList: [{
        id: 0,
        type: 'image',
        url: 'http://www.86ps.com/sc/BJ/259/10.jpg',
        text: '表白专用喔',
        surl: '../../icons/love.png',
      },
      {
        id: 1,
        type: 'image',
        url: 'http://www.86ps.com/sc/BJ/259/8.jpg',
        text: '说点最近有趣的事',
        surl: '../../icons/gift.png',
      },
      {
        id: 2,
        type: 'image',
        url: 'http://www.86ps.com/sc/BJ/259/2.jpg',
        text: '考试稳过！',
        surl: '../../icons/book.png',
      },
      {
        id: 3,
        type: 'image',
        url: 'http://www.86ps.com/sc/BJ/259/3.jpg',
        text: '分享一首歌',
        surl: '../../icons/music.png',
      },
      {
        id: 4,
        type: 'image',
        url: 'http://www.86ps.com/sc/BJ/259/1.jpg',
        text: '一张独特的照片',
        surl: '../../icons/life.png'
      },


    ],
    typeText: '表白专用',
    surl: '../../icons/love.png',
    dreamInfo: {
      dreamContent: "",
      dreamType: 0,
      userId: "",
      dreamLocation: null,
      dreamState: false,
      dreamPic: null,
      dreamdt: null,
      dreamLikes: 0,
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    qqmapsdk = new QQMapWX({
      key: 'VC4BZ-LA4KS-I5UO4-6OKRX-E24WZ-ODFFW'
    });
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        //根据坐标获取当前位置名称，显示在顶部，腾讯地图逆地址解析
        console.log(res.latitude);
        console.log(res.longitude);
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: function(addressRes) {
            console.log(addressRes);
            var address = addressRes.result.formatted_addresses.recommend;
            that.setData({
              nowLocation: address,
              'dreamInfo.dreamLocation.longitude': res.longitude,
              'dreamInfo.dreamLocation.latitude': res.latitude
            })
          }
        })
      }
    })

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */

  onReady: function() {

  },

  /**
   * 轮播的当前选中
   */
  cardSwiper(e) {
    var that = this
    this.setData({
      cardCur: e.detail.current,
      typeText: that.data.swiperList[e.detail.current].text,
      surl: that.data.swiperList[e.detail.current].surl
    })
  },
  /**
   * 选择图片用
   */
  ChooseImage() {
    wx.chooseImage({
      count: 4, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        if (this.data.imgList.length != 0) {
          this.setData({
            imgList: this.data.imgList.concat(res.tempFilePaths),
            imgPath: this.data.imgPath.concat(res.tempFilesss)
          })
        } else {
          this.setData({
            imgList: res.tempFilePaths,
            imgPath: res.tempFiles
          })
        }
        console.log(res.tempFiles[0].path.match(/\.[^.]+?$/)[0])
      }
    });
  },

  /**
   * 预览图片
   */
  ViewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },
  DelImg(e) {
    wx.showModal({
      title: '召唤师',
      content: '确定要删除这段回忆吗？',
      cancelText: '再见',
      confirmText: '再看看',
      success: res => {
        if (res.cancel) {
          this.data.imgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            imgList: this.data.imgList
          })
        }
      }
    })
  },
  textareaAInput(e) {
    this.setData({
      textareaAValue: e.detail.value.length
    })
  },
  addDream: function() {
    console.log('addDream')
    var that = this;
    const db = wx.cloud.database()
    wx.cloud.callFunction({
      name: "addDream",
      data: that.data.dream,
      success(res) {
        console.log('添加成功')
        console.log(res)
      }
    })
  },
  formSubmit: function(e) {
    const that = this
    const db = wx.cloud.database()
    console.log('表单提交事件')
    if (that.data.dreamInfo.dreamLocation == null) {
      wx.showToast({
        title: '请选择位置才能投放喔！！',
        icon: 'none'
      })
      return;
    }
    if (e.detail.value.dreamContent == "") {
      wx.showToast({
        title: '愿望内容不能为空！',
        icon: 'none'
      })
      return;
    }
    if (e.detail.value.dreamContent.length < 10 && e.detail.value.dreamContent != "") {
      wx.showToast({
        title: '多写点愿望内容鸭！',
        icon: 'none'
      })
      return;
    }
    this.showModal()
    //有图片的愿望添加
    if (that.data.imgList.length > 0) {
      var filePath = that.data.imgList //愿望图片的临时路径，用于上传用
      var picFileId = [] //上传图片成功后返回的fileId
      var cloudPath = [] //在云存储中的路径
      filePath.forEach((item, i) => {
        var name = Math.random().toString(36).substr(6, 15)
        cloudPath = 'dreamPic/' + i + name + filePath[i].match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath: item,
          success: res => {
            picFileId.push(res.fileID)
            if (i == filePath.length - 1) {
              const time = util.formatTime(new Date())
              //愿望的时间
              wx.cloud.callFunction({
                name: "addDream",
                data: {
                  dreamContent: e.detail.value.dreamContent,
                  dreamType: that.data.cardCur,
                  userId: app.globalData.openid,
                  dreamState: true,
                  dreamPic: picFileId,
                  dreamdt: time,
                  dreamLikes: 0,
                  dreamLocation: that.data.dreamInfo.dreamLocation
                },
                success: res => {
                  var yres = res;
                  console.log(res)
                  setTimeout(function () {
                    that.hideModal()
                  }, 2000)
                  wx.navigateTo({
                    url: '../dreaminfo/dreaminfo?dreamId=' + yres.result._id,
                  })
                },
                fail: err => {
                  wx.showToast({
                    title: '许愿失败！',
                    icon: 'none'
                  })
                  console.log(err)
                }
              })
            }
            this.setData({
              index: null,
              imgList: [],
              cardCur: 0,
              text: '',
              nowLocation: '',
            })
          },
          fail: err => {
            wx.showToast({
              title: '上传失败！',
              icon: 'fail'
            })
          }
        })
      })
    } else {    //无图片的愿望添加
      wx.cloud.callFunction({
        name: "addDream",
        data: {
          dreamContent: e.detail.value.dreamContent,
          dreamType: that.data.cardCur,
          userId: app.globalData.openid,
          dreamState: true,
          dreamPic: null,
          dreamdt: time,
          dreamLikes: 0,
          dreamLocation: that.data.dreamInfo.dreamLocation
        },
        success: res => {
          var yres = res;
          setTimeout(function () {
            that.hideModal()
          }, 1000)
          console.log(res)
          wx.navigateTo({
            url: '../dreaminfo/dreaminfo?dreamId=' + yres.result._id,
          })
          this.setData({
            index: null,
            imgList: [],
            cardCur: 0,
            text: '',
            nowLocation: '',
          })
        },
        fail: err => {
          wx.showToast({
            title: '许愿失败！',
          })
          console.log(err)
        }
      })
    }
    console.log('add')
  },

  /**
   * 打开地图选择位置
   */
  openmap: function() {
    var that = this;
    //选择位置
    console.log(that.data.dreamInfo.dreamLocation)
    wx.chooseLocation({
      success: function(res) {
        that.setData({
          'dreamInfo.dreamLocation.longitude': res.longitude,
          'dreamInfo.dreamLocation.latitude': res.latitude
        })
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: function(addressRes) {
            console.log(addressRes);
            var address = addressRes.result.formatted_addresses.recommend;
            that.setData({
              nowLocation: address
            })
          }
        })
      },
      fail: function() {
        wx.showToast({
          title: '不能将愿望投放到别的地方啦！',
          icon: 'none'
        })
      }
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

  toggle(e) {
    console.log(e);
    var anmiaton = e.currentTarget.dataset.class;
    var that = this;
    that.setData({
      animation: anmiaton
    })
    setTimeout(function () {
      that.setData({
        animation: ''
      })
    }, 1000)
  },
})