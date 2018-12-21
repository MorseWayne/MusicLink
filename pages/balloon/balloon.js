var util = require('../../utils/util.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {

    boom0_hidden: true,
    boom1_hidden: true,
    boom2_hidden: true,
    balloon_hidden: true,
    animationData_boom0: {},
    animationData_boom1: {},
    animationData_boom2: {},
    animationData_balloon_up: {},
    playStopped: true,
    windowHeight: app.globalData.windowHeight,
    compatibility: app.globalData.compatibility,
    Comp: {
      statusBarHeight: app.globalData.statusBarHeight,
      iSback: true,
      color: "#000",
      text: "发现",
      background: "",
      iSpadding: false
    },
    ListItem: [],
    currentSong: -1,
    songId: -1,
    display_pick: false,
    display_throw: false,
    display_mine:false,
    inputContent: "",
    discovery_message: "",

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var openid = wx.getStorageSync("openid");
    this.setData({
      openid: openid
    })
  },

  onBackTap: function () {
    wx.navigateBack({
      delta: 1
    })
  },


  //获取已发起的歌曲信息
  getDataFromServer: function (entrance) {
    var that = this;

    if (entrance == "throw") {
      var data = {
        requestType: "GetMyCreated",
        openid: that.data.openid
      }
      wx.showLoading({
        title: '加载中',
      })

      util.requestFromServer("GetMyCreated", data).then((res) => {

        if(res.data.songs.length==0){
          wx.showToast({
            title:"您还没有发起过任何歌曲",
            icon:"none",
          });

          return;
        }
         
        that.setAllData(res.data.songs);
        wx.hideLoading();
      }).catch((err) => {
        console.log("请求失败");
      })
    }
    else {

      var openid = wx.getStorageSync("openid");
      var data = {
        requestType: "GetDiscoveryPosted",
        openid:openid,
      }
      wx.showLoading({
        title: '加载中',
      })

      util.requestFromServer("GetDiscoveryPosted", data).then((res) => {
        wx.hideLoading();
        console.log(res);
        var songs = [];
        songs.push(res.data.discovery_song);
        that.setAllData(songs);
        that.setData({
          discovery_message: songs[0].discovery_message,
          currentSong: songs[0].created_song_id,
          songId: songs[0].song_id,
        });
      }).catch((err) => {
        console.log("请求失败");
      })
    }
  },

  setAllData: function (songs) {
    var ListItem = [];
    var progress, create_time_read;
    for (var i in songs) {
      var song = songs[i];
      progress = parseInt(song.reserved_clips / song.clip_number * 100);
      create_time_read = util.getDiffTime(song.song_created_time / 1000, true);
      var temp = {
        create_time_read: create_time_read,
        progress: progress,
        avatar_url: song.avatar_url,
        cover_url: song.cover_url,
        created_song_id: song.created_song_id,
        song_id: song.song_id,
        title: song.title,
        world_shared: song.world_shared
      }
      if (progress != 100) {
        ListItem.push(temp);
      }
    }
    wx.hideLoading();
    this.setData({
      ListItem: ListItem
    })
  },


  onTapToDetail: function (event) {


    if (this.data.display_throw||this.data.display_mine) {
      var created_song_id = event.currentTarget.dataset.createdSongId;
      var song_id = event.currentTarget.dataset.songId;
      this.setData({
        currentSong: created_song_id
      })

    }

    else if(this.data.display_pick) {

      console.log(this.data.created_song_id+""+this.data.songId)
      wx.navigateTo({
        url: '../select/select?created_song_id=' + this.data.currentSong + '&' + "song_id=" + this.data.songId + '&isShare=' + 'false',
      })
    }
  },

  inputChange(e) {
    this.data.inputContent = e.detail.value;
  },

  submit: function () {
    if (this.data.currentSong == -1) {
      wx.showToast({
        title: "请先选择一首歌曲",
        duration: 2500,
        icon: "none",
      });
      return;
    }
    else if (this.data.inputContent == "") {
      wx.showToast({
        title: "填写内容不能为空",
        duration: 2500,
        icon: "none",
      });
      return;
    }

    //扔一个
    if (this.data.display_throw) {
      var data = {
        requestType: "PostToDiscovery",
        created_song_id: this.data.currentSong,
        operation_type: "post",
        discovery_message: this.data.inputContent
      }
      var that = this;

      util.requestFromServer("PostToDiscovery", data).then((res) => {

        console.log(res);

        wx.showToast({
          title: "成功发起",
          icon: "success",
          duration: 2000,
        })

        that.setData({
          display_throw: false,
        })

        that.playAnimationThrow(that);


      }).catch((err) => {
        console.log("请求失败");
      })
    }

  },
  cancel: function () {
    this.setData({
      display_pick: false,
      display_throw: false,
      display_mine:false,
      currentSong: -1,
      inputContent: "",
      ListItem: [],
    })
  },

  fireWork: function () {

    var animation_boom0 = wx.createAnimation({
      duration: 800,
      timingFunction: 'ease-out',
    });

    var animation_boom1 = wx.createAnimation({
      duration: 800,
      timingFunction: 'ease-out',
    });

    var animation_boom2 = wx.createAnimation({
      duration: 800,
      timingFunction: 'ease-out',
    });

    this.animation = animation_boom0;
    setTimeout(function () {
      animation_boom0.scale(4, 4).rotate(180).opacity(0).step()
      this.setData({
        animationData_boom0: animation_boom0.export(),
      })

    }.bind(this), 200);

    this.setData({
      boom0_hidden: false,
    });

    setTimeout(function () {
      this.setData({
        boom1_hidden: false,
      });
    }.bind(this), 550)

    this.animation = animation_boom1;
    setTimeout(function () {
      animation_boom1.scale(4, 4).rotate(180).opacity(0).step()
      this.setData({
        animationData_boom1: animation_boom1.export(),
      })

    }.bind(this), 600)


    setTimeout(function () {
      this.setData({
        boom2_hidden: false,
      });
    }.bind(this), 1000)

    this.animation = animation_boom2;
    setTimeout(function () {
      animation_boom2.scale(4, 4).rotate(180).opacity(0).step()
      this.setData({
        animationData_boom2: animation_boom2.export(),
      })

    }.bind(this), 1050)


    setTimeout(function () {
      this.resumeAllImgAfterThrow();
    }.bind(this), 2000)

  },

  resumeAllImgAfterThrow: function () {

    this.setData({
      boom0_hidden: true,
      boom1_hidden: true,
      boom2_hidden: true,
    })

    var animation_boom_resume = wx.createAnimation({
      duration: 500,
      timingFunction: 'step-start',
    });

    animation_boom_resume.scale(1, 1).opacity(1).step();

    this.setData({
      animationData_boom0: animation_boom_resume.export(),
    })

    animation_boom_resume.scale(1, 1).opacity(1).step();

    this.setData({
      animationData_boom1: animation_boom_resume.export(),
    })

    animation_boom_resume.scale(1, 1).opacity(1).step();

    this.setData({
      animationData_boom2: animation_boom_resume.export(),
    })

    //重置气球位置
    var animation_balloon_resume = wx.createAnimation({
      duration: 500,
      timingFunction: 'step-start',
    })

    animation_balloon_resume.translateY(this.data.windowHeight * 0.22).scale(1, 1).opacity(1).step()

    this.setData({
      animationData_balloon_up: animation_balloon_resume.export(),
      playStopped: true,
    })

  },

  resumeAllImgAfterPick: function () {
    this.setData({
      balloon_hidden: true,
    })

    var animation_balloon_resume = wx.createAnimation({
      duration: 500,
      timingFunction: 'step-start',
    });

    animation_balloon_resume.scale(1, 1).opacity(1).step();

    this.setData({
      animationData_balloon_up: animation_balloon_resume.export(),
      playStopped: true,
    })

  },

  throw: function () {

    if (this.data.display_pick || this.data.display_throw)
      return;

    if (!this.data.playStopped)
      return;


    this.setData({
      display_throw:true,
    })

    this.getDataFromServer("throw");

    
  },

  pick: function () {

    if (this.data.display_pick || this.data.display_throw)
      return;

    //初始气球位置

    if (!this.data.playStopped)
      return;

    this.getDataFromServer("pick");

    this.setData({
      playStopped: false,
    })

    var animation_init = wx.createAnimation({
      duration: 100,
      timingFunction: 'step-start',
    })

    setTimeout(function () {
      animation_init.translateY(this.data.windowHeight * -1).opacity(0).step();
      this.setData({
        animationData_balloon_up: animation_init.export(),
      })
    }.bind(this), 200)

    setTimeout(function () {
      this.setData({
        balloon_hidden: false,
      })
    }.bind(this), 250)

    var animation_pick = wx.createAnimation({
      duration: 2000,
      timingFunction: 'ease-in',
    })

    setTimeout(function () {
      animation_pick.scale(3, 3).translateY(this.data.windowHeight * -0.2).opacity(1).step();

      this.setData({
        animationData_balloon_up: animation_pick.export(),
      })
    }.bind(this), 400)

    setTimeout(function () {
      this.setData({
        display_pick: true,
      })
    }.bind(this), 3000)

    setTimeout(function () {
      this.resumeAllImgAfterPick();
    }.bind(this), 3000)

  },

  scanMySongs:function(){

    if(this.data.display_throw||this.data.display_pick||!this.data.playStopped)
      return;

    var that = this;
    var data = {
      requestType: "GetMyParticipated",
      openid:that.data.openid
    }
    wx.showLoading({
      title: '加载中',
    })
    util.requestFromServer("GetMyParticipated", data).then((res) => {
        wx.hideLoading();
        console.log(res);

        if(res.data.songs.length==0){
          wx.showToast({
            title:"你还没有参与任何歌曲",
            icon:"none",
          })
          return;
        }
        that.setAllData(res.data.songs);
        that.setData({
          display_mine:true,
        })
    }).catch((err) => {
      console.log("请求失败");
    })
  },

  playAnimationThrow:function(that){


    that.data.playStopped = false;

    var animation1 = wx.createAnimation({
      duration: 2000,
      timingFunction: 'ease-out',
    });

    that.animation = animation1;


    animation1.scale(3, 3).translateY(that.data.windowHeight * -0.22).step();

    setTimeout(function () {
      that.setData({
        balloon_hidden: false
      })
    }.bind(this), 50)

    setTimeout(function () {
      that.setData({
        animationData_balloon_up: animation1.export()
      });
    }.bind(this), 100)


    setTimeout(function () {
      animation1.opacity(0).step();

      that.setData({
        animationData_balloon_up: animation1.export()
      });
      that.fireWork();
    }.bind(this), 2000)

    setTimeout(function () {
      that.setData({
        balloon_hidden: true,
      })
    }.bind(this), 2100)
  }
})