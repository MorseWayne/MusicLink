var util = require('../../utils/util');
var app = getApp();

Page({
  data: {
    songs: [],
    song_id: null,
    openId: "",
    userAvatar: "",
    clips: [],
    createdSongId: "",
    allOriginData: [],
    compatibility: false,
    windowHeight: app.globalData.windowHeight,
    Comp: {
      statusBarHeight: app.globalData.statusBarHeight,
      iSback: true,
      color: "#fff",
      text: "选择歌词",
      background: "",
      iSpadding: true
    },
    //控制功能导航页
    tutorailHidden_select: true,
    hasChanged: false,

    //所有导航页
    imgUrls: [
      "https://oss.caoyu.online/basic/guidance/select1.PNG",
      "https://oss.caoyu.online/basic/guidance/select2.PNG",
    ]
  },

  onLoad: function (options) {
    var openid = wx.getStorageSync('openid');
    if (openid) {
      var userAvatar = app.globalData.userInfo.avatarUrl;
      this.setData({
        openId: openid,
        userAvatar: userAvatar,
      })
    }

    var isShare = options.isShare;
    var createdSongId = options.created_song_id;
    var songId = options.song_id;
    var that = this;

    var tutorailHidden_select = wx.getStorageSync("tutorailHidden_select");

    if (tutorailHidden_select === undefined)
    tutorailHidden_select = false;

    this.setData({
      tutorailHidden_select:tutorailHidden_select
    })

    this.setData({
      tutorailHidden_select:tutorailHidden_select,
    })

    if(tutorailHidden_select)
      this.setData({
        compatibility:app.globalData.compatibility,
      })

    //console.log(options);
    this.setData({
      createdSongId: createdSongId,
      song_id: songId,
    })

    if (isShare != undefined) {
      this.setData({
        isShare: isShare
      })
    }

    var that = this;
    setTimeout(()=>{
      that.setData({
        tutorailHidden_select: true,
        compatibility: app.globalData.compatibility,
      })
      wx.setStorageSync("tutorailHidden_select", true);
    })

    this.setSongsLyricsData();
  },

  onBackTap: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  //获取歌曲详细信息
  setSongsLyricsData: function () {

    var that = this;
    var data = {
      requestType: "GetClips",
      song_id: this.data.song_id
    }

    util.requestFromServer("GetClips", data).then((res) => {
      //console.log("select: GetClips");
      //console.log(res);
      that.processRequestData(res);
      that.getGetCreatedClips();
    }).catch((err) => {
      console.log("请求失败");
    })

  },

  //获取歌曲已经被选择的情况
  getGetCreatedClips: function () {
    var that = this;
    var data = {
      requestType: "GetCreatedClips",
      createdSongId: this.data.createdSongId,
    }

    util.requestFromServer("GetCreatedClips", data).then((res) => {
      //console.log("select: request success");
      console.log(res);
      that.processRequestData_Create(res);
    }).catch((err) => {
      console.log("请求失败");
    })
  },

  //绑定请求后的数据
  processRequestData_Create: function (res) {
    var selected = res.data.selected_info;
    var songs = this.data.songs;
    var lyrics = songs.lyrics;
    var clips = [];
    for (var i in selected) {

      if (selected[i].openid == this.data.openId) {
        clips.push(selected[i].clip_count);
      }
      for (var j in lyrics) {
        if (lyrics[j].clipCount == selected[i].clip_count) {
          lyrics[j].selected_user_avatar = selected[i].avatar;
          lyrics[j].selected_user_openId = selected[i].openid;
          lyrics[j].isSelected = true;
          lyrics[j].isSing = selected[i].is_sang;
        }
      }
    }

    this.setData({
      songs: songs,
      clips: clips
    })
  },


  //处理数据-sing界面使用
  processRequestData: function (res) {

    var allOriginData = res.data;

    var that = this;
    var songs = {
      songId: res.data.song_id,
      music: {
        title: res.data.title,
        coverImg: res.data.cover_url,
        singer: res.data.artist,
      },
      lyrics: [],
    }


    for (var i in res.data.songs) {
      var song = res.data.songs[i];
      //console.log(song);
      for (var j in song.lyric.lyrics) {
        var temp = {
          lyric: song.lyric.lyrics[j].lyric,
          clipCount: song.clipCount,
          selected_user_avatar: null,
          selected_user_openId: null,
          isSelected: null,
          isSing: false,
        }
        songs.lyrics.push(temp);
      }
    }
    that.setData({
      songs: songs,
      allOriginData: allOriginData,
    })
  },


  selectLyrics: function (event) {

    var lyricId = event.currentTarget.dataset.lyricId;
    var songs = this.data.songs;
    var lyrics = songs.lyrics[lyricId];
    var clipCount = songs.lyrics[lyricId].clipCount;

    if (this.check()) {
      if ((this.data.openId == lyrics.selected_user_openId || lyrics.selected_user_openId == null) && !lyrics.isSing) {
        var clips = [];
        if (lyrics.isSelected) {
          for (var i in this.data.clips) {
            if (this.data.clips[i] != lyrics.clipCount) {

              clips.push(this.data.clips[i])
            }
          }
        } else {
          for (var i in this.data.clips) {
            clips.push(this.data.clips[i])
          }
          clips.push(lyrics.clipCount);
        }

        for (var i in songs.lyrics) {
          if (songs.lyrics[i].clipCount == clipCount) {

            var lyric = songs.lyrics[i];
            //对未选择的歌词换头像,修改OpenId
            if (!lyric.isSelected) {
              lyric.selected_user_avatar = this.data.userAvatar;
              lyric.selected_user_openId = this.data.openId;
            } else {
              lyric.selected_user_avatar = null;
              lyric.selected_user_openId = null;
            }
            lyric.isSelected = !lyric.isSelected;
          }
        }

        this.setData({
          songs: songs,
          clips: clips
        })
      } else if(this.data.openId != lyrics.selected_user_openId){
        wx:wx.showToast({
          title: '该段已被其他用户选择',
          icon: 'none'
        })
      } else if (lyrics.isSing){
        wx: wx.showToast({
          title: '该段已唱，无法取消',
          icon: 'none'
        })
      }
    }
  },


  // 锁定已选择歌词，给出交互信息，
  // 对成功锁定的歌词进行成功反馈，对锁定失败的歌词进行失败反馈
  // 锁定后可再次进行，锁定，解锁
  lock: function (event) {

    if (this.check()) {
      var that = this;
      var data = {
        requestType: "CreateClips",
        createdSongId: this.data.createdSongId,
        openid: this.data.openId,
        clips: this.data.clips.sort(function (a, b) {
          return a - b;
        }),
      }

      util.requestFromServer("CreateClips", data).then((res) => {

        this.processRequestData_Create(res);

        var failedString = "";
        var successString = "";
        var success = res.data.succeed.sort(function (a, b) {
          return a - b;
        });
        var failed = res.data.failed.sort(function (a, b) {
          return a - b;
        });

        if (success.length > 0) {
          successString = '成功锁定第';
          for (var i in success) {
            if (i == 0) {
              successString = successString + '' + success[i];
            } else {
              successString = successString + '.' + success[i];
            }
          }
          successString = successString + "段";
        }



        if (failed.length > 0) {
          failedString = "你已经唱过第";
          for (var i in failed) {
            if (i == 0) {
              failedString = failedString + '' + failed[i];
            } else {
              failedString = failedString + '.' + failed[i];
            }
          }
          failedString = failedString + "段了，现在你可以重唱覆盖它们了";
        }

        var content = successString + failedString;
      
        if (content == "") {
          wx.showModal({
            title: "提示",
            content: "你还没选任何数据喔",
          })
        } else {

          wx.showModal({
            title: '提示',
            content: content,
            confirmText: "确定",
            success:function(res){
              if(res.confirm)
                if(event.currentTarget.dataset.entrance=="handon"){
                  wx.setStorageSync("selectedData", that.data);
                  wx.redirectTo({
                    url: '../sing/sing?songId=' + that.data.song_id,
                  })
                }

            }
          })
         
        }
      }).catch((err) => {
        console.log("请求失败");
      })
    }

  },

  // 对整个选择整体提交服务器，点击后不能再选
  //提交后跳转至唱歌界面
  handon: function (event) {

    if (this.data.clips.length == 0) {
      wx.showModal({
        title: "提示",
        content: "你还没选任何数据喔",
      })
      return;
    }

     this.lock(event);
  },


  onShareAppMessage: function (res) {
    if (res.from === 'menu') {
      console.log(res.target)
    }
    var isShare = true;
    var category = 'Select';
    var userInfo = app.globalData.userInfo;
    var titleString = userInfo.nickName + "邀请你和他一起唱 《" + this.data.allOriginData.title + "》";
    return {
      title: titleString,
      path: '/pages/welcome/welcome?isShare=' + isShare + '&created_song_id=' + this.data.createdSongId + '&song_id=' + this.data.songs.songId + '&category=' + category,
      imageUrl: this.data.songs.music.coverImg,
    }
  },

  check: function () {
    //未授权无法使用该功能
    var openid = wx.getStorageSync("openid");
    if (!openid) {
      wx.showModal({
        title: '提示',
        content: '未授权，该功能无法使用，请前往"我的-设置-授权"进行授权',
        showCancel: true,
        confirmText: "前往",
        confirmColor: "#52a2d8",
        success: function (res) {
          //确认打开设置界面进行授权
          if (res.confirm) {
            wx.switchTab({
              url: '../me/me',
            })
          }
        }
      });
      return false;
    } else {
      return true;
    }
  },

  change: function (e) {
    if (this.data.tutorailHidden_select)
      return;

    console.log(e.detail.current);
    
    if(e.detail.current == this.data.imgUrls.length-1)
      wx.showToast({
        title:"继续左滑结束导航",
        icon:"none"
      })

    this.setData({
      hasChanged: true,
    })


  },
  animationEnd: function (e) {

    if (this.data.tutorailHidden_select)
      return;
    console.log(e.detail.current);

    if (!this.data.hasChanged && e.detail.current == this.data.imgUrls.length-1) {
      this.setData({
        tutorailHidden_select: true,
        compatibility:app.globalData.compatibility,
      })
      // wx.showToast({
      //   title: '导航结束',
      //   icon: "none",
      //   duration: 1500,
      //   mask: "false",
      // })

      wx.setStorageSync("tutorailHidden_select", true);
    }

    this.setData({
      hasChanged: false,
    })
  }

})

