var app = getApp();
const timer = require("../../utils/timer");
const util = require('../../utils/util');

//跳转player需要传入  created_song_id

Page({
  data: {
    disableSkipBtn:false,
    progress: 0,
    progress_formatted: "00:00",
    duration: 0,
    duration_formatted: "00:00",
    current_pos: 0,
    lastUpdateTime: 0,
    isPlaying: false,
    lyrics: [],
    curretIAC: "",
    currentLyricLineNum: 0,
    toLineNum: -1,
    playIcon: 'icon-pause',
    cdCls: 'play',
    dotsArray: new Array(2),
    currentDot: 0,
    isShare: false,
    //用户完成的歌曲 created_song_id数组
    songList_created: [],
    currentIndex: -1,
    currentSongInfo: {
      created_song_id: -1,
      song_id: -1,
      data_url: "",
      coverImg: "",
      singer: "未知",
      title: "未知",
      artist:"未知",
    },
  },

  onLoad: function (options) {
    var created_song_id = options.created_song_id;
    var isShare = options.isShare;
    var songList_created = [];
    var currentIndex=0;

    var currentSongInfo = this.data.currentSongInfo;

    currentSongInfo.created_song_id = created_song_id;

    if(isShare==false||isShare=="false"){
      var MyFinishedSongs = wx.getStorageSync("MyFinishedSongs");
      for (var i in MyFinishedSongs) {
        songList_created.push(MyFinishedSongs[i].ids.created_song_id);
        if (created_song_id == MyFinishedSongs[i].ids.created_song_id) {
          currentIndex = parseInt(i);
          currentSongInfo.coverImg = MyFinishedSongs[i].music.coverImg;
          currentSongInfo.title = MyFinishedSongs[i].music.title;
          currentSongInfo.singer = MyFinishedSongs[i].music.singer;
          currentSongInfo.song_id = MyFinishedSongs[i].ids.song_id;
        }
      }

      this.setData({
        currentIndex: currentIndex,
        songList_created: songList_created,
      })
    }
    else if(isShare||isShare=="true"){
      this.setData({
        disableSkipBtn:true,
        isShare:false,
      })
    } 
     
    //兼容
    var compatibility = app.globalData.compatibility;
    var statusBarHeight = app.globalData.statusBarHeight;

    if (compatibility) {
      statusBarHeight = statusBarHeight + 20;
    } else {
      statusBarHeight = 0;
    }



    this.setData({
      currentSongInfo: currentSongInfo,
      compatibility: compatibility,
      statusBarHeight: statusBarHeight
    })

  },

  onShow: function () {
    var that = this;

    var data = {
      requestType: "GetPlayInfo",
      created_song_id: this.data.currentSongInfo.created_song_id,
    }

    util.requestFromServer("GetPlayInfo", data).then((res) => {

      console.log(res.data);
      var currentIAC = wx.createInnerAudioContext();
      that.data.currentSongInfo.data_url = res.data.finished_url;
      that.data.currentSongInfo.coverImg = res.data.cover_url;
      that.data.currentSongInfo.title = res.data.title;
      that.data.currentSongInfo.artist =res.data.artist;

      that.setData({
        lyrics: res.data.lyrics,
        duration: res.data.duration,
        currentIAC: currentIAC,
        currentSongInfo:that.data.currentSongInfo,
      })
      currentIAC.src = res.data.finished_url;
      that.play();

      var duration_formatted = timer.timeFormat(parseInt(that.data.duration));
      this.setData({
        duration_formatted: duration_formatted,
      })

    }).catch((err) => {
      console.log(err);
    })
  },

  onHide: function () {
    this.data.currentIAC.stop();
  },
  onUnload: function () {
    this.data.currentIAC.stop();
    this.data.currentIAC.destroy()
  },
  onProgressChange: function (e) {

    if (!this.data.currentIAC.paused) {
      this.data.currentIAC.pause();
    }


    var progress = e.detail.value;
    var duration = this.data.duration;
    var current_pos = duration * progress / 100;
    var lyrics = this.data.lyrics;


    for (var index in lyrics) {
      if (current_pos > timer.convertStrToTime(lyrics[index].beginTime) &&
        current_pos < timer.convertStrToTime(lyrics[index].endTime)) {
        this.setData({
          currentLyricLineNum: index,
          currentLyric: lyrics[index].lyric,
        });
        break;
      }
    }

    var progress_format = timer.timeFormat(parseInt(this.data.duration * progress / 100));
    this.setData({
      progress_format: progress_format,
      progress: progress,
      current_pos: current_pos,
    });

    this.data.currentIAC.offPlay();
    this.data.currentIAC.offTimeUpdate();
    this.play();

  },

  play: function () {

    var currentIAC = this.data.currentIAC;
    var progress = this.data.progress;
    var duration = this.data.duration;
    var current_pos = duration * progress / 100;
    var that = this;

    currentIAC.onPlay(() => {
      currentIAC.seek(current_pos);
      currentIAC.offPlay();
    });


    currentIAC.onSeeked(() => {
      console.log("定位成功");
      currentIAC.volume = 1;
      currentIAC.onPlay(() => {
        console.log("再次监听");
      });
      currentIAC.onTimeUpdate((res) => {
        // if (currentIAC.currentTime - that.data.lastUpdateTime < 0.5)
        //   return;

        var progress = parseInt(currentIAC.currentTime / that.data.duration * 100);
        var progress_formatted = timer.timeFormat(parseInt(currentIAC.currentTime));
        that.setData({
          progress: progress,
          progress_formatted: progress_formatted,
          lastUpdateTime: currentIAC.currentTime,

        })

        var currentLyricLineNum = that.data.currentLyricLineNum;
        //为保证currentLineNum大于5时 唱到的歌词在中间
        var toLineNum = currentLyricLineNum - 5;

        if (currentLyricLineNum > this.data.lyrics.length - 1)
          return;

        var endTime = timer.convertStrToTime(that.data.lyrics[currentLyricLineNum].endTime);
        var beginTime = timer.convertStrToTime(that.data.lyrics[currentLyricLineNum].beginTime);
        if (currentIAC.currentTime < beginTime)
          return;
        else if (currentIAC.currentTime > endTime && currentLyricLineNum < that.data.lyrics.length - 1) {
          currentLyricLineNum++;
          that.setData({
            currentLyric: that.data.lyrics[currentLyricLineNum].lyric,
            currentLyricLineNum: currentLyricLineNum,
          });

          if (currentLyricLineNum > 5 && toLineNum != this.data.toLineNum) {
            this.setData({
              toLineNum: toLineNum
            })
          }
        }
        else if (currentLyricLineNum == 0) {
          that.setData({
            currentLyric: that.data.lyrics[currentLyricLineNum].lyric,
            currentLyricLineNum: currentLyricLineNum,
          })
        }

      });


    })

    currentIAC.onTimeUpdate((res) => {
      // if (currentIAC.currentTime - that.data.lastUpdateTime < 0.5)
      //   return;

      var progress = parseInt(currentIAC.currentTime / that.data.duration * 100);
      var progress_formatted = timer.timeFormat(parseInt(currentIAC.currentTime));
      that.setData({
        progress: progress,
        progress_formatted: progress_formatted,
        lastUpdateTime: currentIAC.currentTime,

      })

      var currentLyricLineNum = that.data.currentLyricLineNum;
      //为保证currentLineNum大于5时 唱到的歌词在中间
      var toLineNum = currentLyricLineNum - 5;

      if (currentLyricLineNum > this.data.lyrics.length - 1)
        return;

      var endTime = timer.convertStrToTime(that.data.lyrics[currentLyricLineNum].endTime);
      var beginTime = timer.convertStrToTime(that.data.lyrics[currentLyricLineNum].beginTime);
      if (currentIAC.currentTime < beginTime)
        return;
      else if (currentIAC.currentTime > endTime && currentLyricLineNum < that.data.lyrics.length - 1) {
        currentLyricLineNum++;
        that.setData({
          currentLyric: that.data.lyrics[currentLyricLineNum].lyric,
          currentLyricLineNum: currentLyricLineNum,
        });

        if (currentLyricLineNum > 5 && toLineNum != this.data.toLineNum) {
          this.setData({
            toLineNum: toLineNum
          })
        }
      }
      else if (currentLyricLineNum == 0) {
        that.setData({
          currentLyric: that.data.lyrics[currentLyricLineNum].lyric,
          currentLyricLineNum: currentLyricLineNum,
        })
      }

    });


    currentIAC.onEnded(() => {
      that.setData({
        progress_formatted: "00:00",
        progress: 0,
        current_pos: 0,
        isPlaying: false,
        lastUpdateTime: 0,
      })
    });


    that.setData({
      isPlaying: true,
    })

    currentIAC.volume = 0;
    currentIAC.play();

  },
  pause() {
    var currentIAC = this.data.currentIAC;
    currentIAC.pause();
    this.setData({
      isPlaying: false
    })
  },
  changeDot: function (e) {
    this.setData({
      currentDot: e.detail.current
    })
  },

  backToPost: function () {
    wx.switchTab({
      url: '../post/post',
    })
  },

  prev: function () {

    if(this.data.disableSkipBtn)
    {
      wx.showToast({
        title:"分享状态下不可用",
        icon:"none",
      })
      return;
    }

    var currentIndex = this.data.currentIndex;
    var isShare = this.data.isShare;
    this.data.currentIAC.stop();
    if (!isShare && currentIndex > 0) {
      currentIndex = currentIndex - 1;
      this.setCurrnetSong(this.data.songList_created[currentIndex])
    }
  },

  next: function () {

    if(this.data.disableSkipBtn)
    {
      wx.showToast({
        title:"分享状态下不可用",
        icon:"none",
      })
      return;
    }

    var currentIndex = this.data.currentIndex;
    var isShare = this.data.isShare;
    this.data.currentIAC.stop();
    if (!isShare) {
      if (currentIndex < this.data.songList_created.length - 1) {
        currentIndex = currentIndex + 1;
        this.setCurrnetSong(this.data.songList_created[currentIndex])
      }
    }
  },

  setCurrnetSong: function (created_song_id) {

    var currentIndex = -1;
    var currentSongInfo = this.data.currentSongInfo;

    if (this.data.isShare == 'false' || !this.data.isShare) {
      var MyFinishedSongs = wx.getStorageSync("MyFinishedSongs");
      for (var i in MyFinishedSongs) {
        if (created_song_id == MyFinishedSongs[i].ids.created_song_id) {
          currentIndex = parseInt(i);
          currentSongInfo.coverImg = MyFinishedSongs[i].music.coverImg;
          currentSongInfo.title = MyFinishedSongs[i].music.title;
          currentSongInfo.singer = MyFinishedSongs[i].music.singer;
          currentSongInfo.song_id = MyFinishedSongs[i].ids.song_id;
        }
      }
      this.setData({
        isShare: false,
      })
    } else {
      currentIndex = -1;
      this.setData({
        isShare: true
      })
    }

    this.setData({
      currentSongInfo: currentSongInfo,
      currentIndex: currentIndex,
      progress: 0,
      progress_formatted: "00:00",
      current_pos: 0,
      lastUpdateTime: 0,
      isPlaying: false,
      lyrics: [],
      curretIAC: "",
      currentLyricLineNum: 0,
      toLineNum: -1,
    })

    var that = this;

    var data = {
      requestType: "GetPlayInfo",
      created_song_id: created_song_id,
    }

    wx.showLoading({
      title: "加载中",
    })

    util.requestFromServer("GetPlayInfo", data).then((res) => {

      console.log(res.data);
      var currentIAC = wx.createInnerAudioContext();
      that.data.currentSongInfo.data_url = res.data.finished_url;
      that.setData({
        lyrics: res.data.lyrics,
        duration: res.data.duration,
        currentIAC: currentIAC,
      })
      currentIAC.src = res.data.finished_url;
      that.play();
      var duration_formatted = timer.timeFormat(parseInt(that.data.duration));
      this.setData({
        duration_formatted: duration_formatted,
      })

      wx.hideLoading();

    }).catch((err) => {
      console.log(err);
    })


  },

  onShareAppMessage: function (res) {

    this.data.currentIAC.pause();
    this.setData({
      isPlaying: false,
    })
    var isShare = true;
    var category = 'Player';
    var userInfo = app.globalData.userInfo;
    var titleString = userInfo.nickName + "邀请你欣赏他的作品" + this.data.currentSongInfo.title;
    return {
      title: titleString,
      path: '/pages/player/player?isShare=' + isShare + '&created_song_id=' + this.data.currentSongInfo.created_song_id,
      imageUrl: this.data.currentSongInfo.coverImg,
    }
  },

})
