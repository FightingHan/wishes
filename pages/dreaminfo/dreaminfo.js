// pages/dreaminfo/dreaminfo.js
var util = require('../../utils/util.js');
var app = getApp();
const db = wx.cloud.database()
var dreamtype
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: '',
    dreamInfo: {},
    commentList: [],
    startIndex: 0,
    isCommentend: false, //是否展示评论
    comment: '',
    sumComment: 0, //愿望总评论条数
    sumLikes: 0, //愿望总赞数
    dreamIndex: 0, //当前加载的愿望在愿望列表中的下标,
    sumDream: 0,
    x: 0,
    y: 0 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    var that = this
    this.showModal()
    dreamtype = parseInt(options.type)
    if (app.globalData.userInfo) {
      this.setData({
        myInfo: app.globalData.userInfo
      })
    }
    var yres
    //根据id获取愿望详细信息
    wx.cloud.callFunction({
      name: 'getDream',
      data: {
        dreamId: options.dreamId
      },
      success: res => {
        that.setData({
          dreamInfo: res.result.data[0],
          firstDream: res.result.data[0]._id
        })
        console.log('【愿望详情】', res.result.data[0])
        //获取用户数据
        wx.cloud.callFunction({
          name: 'getUsers',
          data: {
            userId: [res.result.data[0].userId]
          },
          success: res => {
            that.setData({
              userInfo: res.result.data[0]
            })
            console.log('【愿望发布者】', res.result.data[0])
          }
        })
        //获取点赞数据
        console.log('【我的id】', app.globalData.openid)
        console.log('【愿望id】', res.result.data[0]._id)
        const likes = db.collection('likes')
        likes.where({
          type: '0',
          userId: app.globalData.openid,
          infoId: res.result.data[0]._id
        }).count({
          success: res => {
            console.log(res)
            console.log('【我给愿望点的赞】', res.total)
            if (res.total > 0) {
              that.setData({
                isDreamLike: true
              })
            }
            this.hideModal()
          },
          fail: err => {
            console.log('【读取愿望点赞信息出错】', err)
          }
        })
        //获取评论数据
        const comment = db.collection('comment')
        comment.where({
          dreamId: res.result.data[0]._id,
        }).count({
          success: res => {
            console.log(res)
            that.setData({
              sumComment: res.total
            })
            console.log('【愿望总评论数】', res.total)
            this.hideModal()
          },
          fail: err => {
            console.log('【读取总评论信息出错】', err)
          }
        })
      },
      fail: err => {
        console.log('【读取愿望信息出错】', err),
          wx.showToast({
            title: '愿望被藏起来了,请稍后再试一下哇',
            icon: 'none'
          })
      }
    })
    console.log(app.globalData.openid)
  },

  showComment: function(e) {
    var that = this
    if(that.data.sumComment == 0){
      wx.showToast({
        title: '暂时没有评论!',
        icon: 'none'
      })
      return;
    }
    that.showModal()
    this.setData({
      showComment: 'true'
    })
    var that = this
    //取该愿望的所有评论
    wx.cloud.callFunction({
      name: 'getCommentList',
      data: {
        dreamId: that.data.dreamInfo._id,
        startIndex: that.data.startIndex
      },
      success: res => {
        if (res.result.data.length == 0) {
          that.data.isCommentend = true
          return;
        }
        that.setData({
          commentList: res.result.data.concat(that.data.commentList),
          sumComment: res.result.data.length + that.data.commentList.length
        })
        that.data.startIndex = that.data.startIndex + 20
        const commentID = that.data.commentList.map(function(item) {
          return item._id;
        });
        console.log(commentID)
        wx.cloud.callFunction({
          name: 'getLikesList',
          data: {
            type: '1',
            userId: app.globalData.openid,
            infoId: commentID
          },
          success: res => {
            console.log(res)
            wx.hideToast()
            var i, j
            var allComment = res.result.data
            for (i = 0; i < allComment.length; i++) {
              for (j = 0; j < commentID.length; j++) {
                if (allComment[i].infoId == commentID[j] && allComment[i].type == '1') {
                  that.data.commentList[j].isLike = 'true'
                }
              }
            }
            var ncommentList = that.data.commentList;
            that.setData({
              commentList: ncommentList
            })
            this.hideModal()
          },
          fail: err => {
            console.log('【读取评论点赞信息出错】', err)
            wx.showToast({
              title: '读取评论赞数出错！',
              icon: 'none'
            })
          }
        })
        const userID = that.data.commentList.map(function(item) {
          return item.userId;
        });
        wx.cloud.callFunction({
          name: 'getUsers',
          data: {
            userId: userID,
          },
          success: res => {
            console.log(res)
            var i, j
            var allUser = res.result.data
            for (i = 0; i < allUser.length; i++) {
              for (j = 0; j < userID.length; j++) {
                if (allUser[i].userId == userID[j]) {
                  that.data.commentList[j].nickName = allUser[i].nickName
                  that.data.commentList[j].avatarUrl = allUser[i].avatarUrl
                }
              }
            }
            var ncommentList = that.data.commentList;
            that.setData({
              commentList: ncommentList
            })
          },
          fail: err => {
            console.log('【读取评轮头像信息出错】', err)
            wx.showToast({
              title: '读取评论者信息出错！',
              icon: 'none'
            })
          }
        })
      },
      fail: err => {
        console.log('【读取评论信息出错】', err)
        wx.showToast({
          title: '读取评论出问题咯',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this
    var i;
    for (i = 0; i < that.data.commentList.length; i++) {
      var param = {};
      var string = "commentList[" + i + "].isLike";
      param[string] = false
    }
    wx.cloud.callFunction({
      name: 'getDreamList',
      data: {
        startIndex: 0,
        dreamType: dreamtype
      },
      success: res => {
        this.setData({
          dreamList: res.result.data,
          sumDream: res.result.data.length
        })
        console.log(res.result.data)
      }
    })


  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    wx.hideLoading()
    wx.hideToast()
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
    var that = this
    var index = that.data.dreamIndex;
    that.setData({
      userInfo: '',
      dreamInfo: {},
      commentList: [],
      startIndex: 0,
      isCommentend: false, //是否展示评论
      comment: '',
      sumComment: 0, //愿望总评论条数
      sumLikes: 0, //愿望总赞数
      isDreamLike: false
    })
    console.log(that.data.sumDream)
    console.log('当前愿望下标', that.data.dreamIndex)
    if (index + 1 >= that.data.dreamList.length && that.data.dreamList.length % 20 != 0) {
      wx.showToast({
        title: '愿望都看完咯',
        icon: 'none'
      })
      wx.stopPullDownRefresh()
      return
    }
    if (that.data.dreamIndex % 20 == 0 && that.data.dreamIndex != 0) {
      wx.cloud.callFunction({
        name: 'getDreamList',
        data: {
          startIndex: that.data.sumDream,
          dreamType: dreamtype
        },
        success: res => {
          console.log('补充', that.data.sumDream)
          this.setData({
            dreamList: that.data.dreamList.concat(res.result.data), //将结果连在后面
            sumDream: that.data.sumDream + res.result.data.length
          })
        }
      })
      wx.showModal({
        title: '小提示',
        content: '已经看了' + index + '条愿望咯，是否继续？',
        cancelText: '回主页',
        confirmText: '继续',
        success: res => {
          if (res.confirm) {
            this.showModal()
            that.setData({
              dreamInfo: that.data.dreamList[index],
            })
            //获取用户数据
            wx.cloud.callFunction({
              name: 'getUsers',
              data: {
                userId: [that.data.dreamList[index].userId]
              },
              success: res => {
                that.setData({
                  userInfo: res.result.data[0]
                })
                console.log('【愿望发布者】', res.result.data[0])
              },
              fail: err => {
                console.log('【发布者信息加载出错】', err)
              }
            })
            //获取点赞数据
            const likes = db.collection('likes')
            likes.where({
              type: '0',
              userId: app.globalData.openid,
              infoId: that.data.dreamList[index]._id
            }).count({
              success: res => {
                if (res.total > 0) {
                  that.setData({
                    isDreamLike: true
                  })
                }
                console.log('【我给愿望点的赞】', res.total)
                this.hideModal()
              },
              fail: err => {
                console.log('【读取愿望点赞信息出错】', err)
                this.hideModal()
              }
            })
            //获取评论数据
            const comment = db.collection('comment')
            comment.where({
              dreamId: that.data.dreamList[index]._id,
            }).count({
              success: res => {
                that.setData({
                  sumComment: res.total
                })
                console.log('【愿望总评论数】', res.total)
                this.hideModal()
              },
              fail: err => {
                console.log('【读取总评论信息出错】', err)
                this.hideModal()
              }
            })
            that.data.dreamIndex++
          } else if (res.cancel) {
            wx.reLaunch({
              url: '../index/index',
            })
          }
        }
      })
      wx.stopPullDownRefresh()
      return;
    }
    if (that.data.dreamList[index]._id == that.data.firstDream) {
      that.data.dreamIndex++;
      index++;
    }
    console.log('【愿望详情】', that.data.dreamList[index])
    that.setData({
      dreamInfo: that.data.dreamList[index],
    })
    //获取用户数据
    wx.cloud.callFunction({
      name: 'getUsers',
      data: {
        userId: [that.data.dreamList[index].userId]
      },
      success: res => {
        that.setData({
          userInfo: res.result.data[0]
        })
        console.log('【愿望发布者】', res.result.data[0])
      },
      fail: err => {
        console.log('【发布者信息加载出错】', err)
      }
    })
    //获取点赞数据
    const likes = db.collection('likes')
    likes.where({
      type: '0',
      userId: app.globalData.openid,
      infoId: that.data.dreamList[index]._id
    }).count({
      success: res => {
        if (res.total > 0) {
          that.setData({
            isDreamLike: true
          })
        }
        console.log('【我给愿望点的赞】', res.total)
      },
      fail: err => {
        console.log('【读取愿望点赞信息出错】', err)
      }
    })
    //获取评论数据
    const comment = db.collection('comment')
    comment.where({
      dreamId: that.data.dreamList[index]._id,
    }).count({
      success: res => {
        that.setData({
          sumComment: res.total
        })
        console.log('【愿望总评论数】', res.total)
      },
      fail: err => {
        console.log('【读取总评论信息出错】', err)
      }
    })
    wx.stopPullDownRefresh()
    that.data.dreamIndex++
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
  /**
   *处理评论表单的提交
   */
  addComment: function(e) {
    if (e.detail.value.comment == "") {
      wx.showToast({
        title: '评论内容不能为空喔',
        icon: 'none'
      })
      return
    } else if (e.detail.value.comment.length < 4) {
      wx.showToast({
        title: '评论至少需要4个字喔',
        icon: 'none'
      })
      return
    }
    var that = this
    console.log(e)
    console.log(e.detail.value.comment)
    const time = util.formatTime(new Date())
    wx.cloud.callFunction({
      name: 'addComment',
      data: {
        commentdt: time,
        comment: e.detail.value.comment,
        dreamId: that.data.dreamInfo._id
      },
      success: res => {
        wx.showToast({
          title: '评论成功！',
          icon: 'success'
        })
        that.data.commentList = [{
          commentdt: time,
          comment: e.detail.value.comment,
          dreamId: that.data.dreamInfo._id,
          islegal: true,
          likes: 0,
          userId: app.globalData.userId,
          _id: res.result._id,
          nickName: that.data.myInfo.nickName,
          avatarUrl: that.data.myInfo.avatarUrl
        }].concat(this.data.commentList)
        this.setData({
          commentList: this.data.commentList,
          comment: '',
          sumComment: that.data.sumComment + 1
        })
      }
    })

  },
  /**
   * 处理点赞事件
   */
  like: function(e) {
    var that = this
    console.log(e)
    var infoId = e.currentTarget.dataset.infoId
    var type = e.currentTarget.dataset.likeType
    console.log(infoId)
    console.log(type)
    if (type == 0) {
      that.setData({
        'dreamInfo.dreamLikes': that.data.dreamInfo.dreamLikes + 1,
        isDreamLike: true
      })
    } else if (type == 1) {
      var i = e.currentTarget.dataset.itemIndex
      var param1 = {};
      var string1 = "commentList[" + i + "].likes";
      param1[string1] = that.data.commentList[i].likes + 1;
      that.setData(param1);
      var param2 = {};
      var string2 = "commentList[" + i + "].isLike";
      param2[string2] = 'true'
      that.setData(param2);
      var ncommentList = that.data.commentList;
      that.setData({
        commentList: ncommentList
      })
      console.log(that.data.commentList)
    }
    wx.cloud.callFunction({
      name: 'addLikes',
      data: {
        type: type,
        infoId: infoId
      },
      success: res => {
        console.log(res)
        if (type == 1) {
          wx.showToast({
            title: '谢大侠的赞！',
          })
        } else if (type == 0) {
          wx.showToast({
            title: '为梦想助力！',
          })
        }
      },
      fail: err => {
        wx.showToast({
          title: '出了点问题',
        })
      }
    })

  },
  /**
   * 预览图片
   */
  ViewImage(e) {
    var that = this
    console.log(e)
    wx.previewImage({
      urls: that.data.dreamInfo.dreamPic,
    });
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

  //输入聚焦
  foucus: function(e) {
    var that = this;
    that.setData({
      bottom: e.detail.height
    })
  },

  //失去聚焦
  blur: function(e) {
    var that = this;
    that.setData({
      bottom: 0

    })
  }

})