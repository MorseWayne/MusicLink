const app = getApp();
const util = require('../../utils/util');
Page({
  data: {
    motto: '开启音乐之旅',
    userInfo: {},
    hasUserInfo: false,
    isShare:false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    firstIn:true,

    // 兼容
    compatibility: app.globalData.compatibility,
    statusBarHeight: app.globalData.statusBarHeight
  },

  onLoad: function (options) {

    var isShare = options.isShare;
    if (isShare!=undefined) {
      var created_song_id = options.created_song_id;
      var song_id = options.song_id;
      var category = options.category;
      this.setData({
        isShare: isShare,
        created_song_id: created_song_id,
        song_id: song_id,
        category: category,
      })
    }
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      });
    }
     else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    }
  },

  OnTapToStart:function(){
    if (this.data.firstIn) {
      this.setData({
        firstIn: false
      })
      
      //判断是否是通过分享链接转化来的用户，如果是直接跳到设了category相应界面
      if (this.data.isShare) {
        var created_song_id = this.data.created_song_id;
        var song_id = this.data.song_id;
        var category = this.data.category;
        if (category == "Select") {
          wx.navigateTo({
            url: '../select/select?created_song_id=' + created_song_id + '&song_id=' + song_id + '&isShare=' + 'true',
          })
        }
      } else {
        wx.switchTab({
          url: '../post/post',
        })
      }
    }
  },

  // OnTapToStart:function(){
  //   if (this.data.firstIn) {
  //     this.setData({
  //       firstIn: false
  //     })
      
  //     //判断是否是通过分享链接转化来的用户，如果是直接跳到设了category相应界面
  //     if (this.data.isShare) {
  //       var created_song_id = this.data.created_song_id;
  //       var song_id = this.data.song_id;
  //       var category = this.data.category;
  //       if (category == "Select") {
  //         wx.navigateTo({
  //           url: '../select/select?created_song_id=' + created_song_id + '&song_id=' + song_id + '&isShare=' + 'true',
  //         })
  //       }
  //     } else {
  //       wx.switchTab({
  //         url: '../post/post',
  //       })
  //     }
  //   } else {
  //     wx.switchTab({
  //       url: '../post/post',
  //     })
  //   }
  // },

  getAllAuthorized: function (e) {
    if(this.data.firstIn){
      this.setData({
        firstIn: false
      })
      //获取用户信息
      this.getUserInfo(e);
      //获取录音权限
      this.getRecorderAuthority();

      //判断是否是通过分享链接转化来的用户，如果是直接跳到设了category相应界面
      if (this.data.isShare) {
        var created_song_id = this.data.created_song_id;
        var song_id = this.data.song_id;
        var category = this.data.category;
        if (category == "Select") {
          wx.navigateTo({
            url: '../select/select?created_song_id=' + created_song_id + '&song_id=' + song_id + '&isShare=' + 'true',
          })
        }
      } else {
        wx.switchTab({
          url: '../post/post',
        })
      }
    }else{
      wx.switchTab({
        url: '../post/post',
      })
    }
  },

  getUserInfo: function (e) {
    
    if(e.detail.errMsg== 'getUserInfo:fail auth deny')
      return;
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    });
    //console.log(e.detail);

    this.login(e, (err, res) => {
      if (err) return console.log('login function has error');
    })

  },

  getRecorderAuthority:function () {
    //获取录音权限
    wx.authorize({
      scope: 'scope.record',
      success() {
        //console.log("Authorized succeed");
      },
      fail() {
        // wx.showModal({
        //   title: '提示',
        //   content: '未授权，部分功能无法使用',
        //   showCancel: true,
        //   confirmText: "确定",
        //   confirmColor: "#52a2d8",
        //   fail: function () {
        //     console.log("授权设置录音失败");
        //   },
        // });

        // console.log("First authorized failed");
        // wx.showModal({
        //   title: '提示',
        //   content: '未授权，录音发无法使用，请前往"我的"界面设置一栏进行授权',
        //   showCancel: true,
        //   confirmText: "授权",
        //   confirmColor: "#52a2d8",
        //   success: function (res) {
        //     //确认打开设置界面进行授权
        //     if (res.confirm) {
        //       wx.switchTab({
        //         url: '../me/me',
        //       })
        //     }
        //   },
        //   fail: function () {
        //     console.log("授权设置录音失败");
        //   },
        // });
      }
    });

  },

  login(userinfo, callback) {

    wx.login({
      //login是异步请求
      success: function (res) {
        //console.log(res);
        var code;
        if (res.code) {
          code = res.code
        } else {
          console.log('登录失败  ！' + res.errMsg)
        }

        if (userinfo.detail.errMsg == 'getUserInfo:ok') {

          var data = { 
            requestType: 'wechat_login',
            code: code,
            userInfo: userinfo.detail.rawData
          };

          util.requestFromServer("OnLogin",data).then((res)=>{
            //console.log("welcome: Request success");
            // console.log(res);
            wx.setStorageSync("openid", res.data.openid);
          }).catch((err)=>{
            console.log("welcome: Request failed");
          })
      

        }
        else if (userinfo.detail.errMsg == 'getUserInfo:fail auth deny') { // 当用户点击拒绝时
          // wx.showModal({
          //   title: '登陆失败！',
          //   content: '微信一键登录失败，请重新登陆并确认允许获取用户信息'
          // }) // 提示用户，需要授权才能登录
          callback('fail to modify scope', null)
        }
      },
      fail: function (res) {
      }
    }) //只有需要使用微信登录鉴别用户，才需要用到它，用来获取用户的匿名识别符
  },
})








