var app = getApp();
const timer = require("../../utils/timer");
var util = require('../../utils/util');
// const currentIAC = wx.getBackgroundAudioManager();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: app.globalData.statusBarHeight,
    progress: 0,
    progress_formatted: "00:00",
    duration: 0,
    duration_formatted: "00:00",
    BCK_url: "",
    created_song_id: -1,
    current_pos: 0,
    lastUpdateTime: 0,
    isPlaying: true,
    lyrics: [],
    currentLyricLineNum: 0,
    currentLyric: "点击欣赏效果更好喔！",
    curretIAC: "",
    isShare: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var MyFinishedSongs = wx.getStorageSync("MyFinishedSongs");
    var created_song_id = options.created_song_id;
    var isShare = options.isShare;
    var FinishedSong = {};

    for (var i in MyFinishedSongs) {
      if (MyFinishedSongs[i].ids.created_song_id == created_song_id) {
        FinishedSong = MyFinishedSongs[i];
        break;
      }
    }
    var max = FinishedSong.Paticipants[0].clip_score;
    var Max_user = FinishedSong.Paticipants[0].nickname;
    for (var i in FinishedSong.Paticipants) {
      if (i < FinishedSong.Paticipants.length - 1) {
        var temp = parseInt(i) + 1;
        if (max < FinishedSong.Paticipants[temp].clip_score) {
          max = FinishedSong.Paticipants[temp].clip_score;
          Max_user = FinishedSong.Paticipants[temp].nickname;
        }
      }

    }
    this.setData({
      created_song_id: created_song_id,
      isShare: isShare,
      FinishedSong: FinishedSong,
      max: {
        Max_user: Max_user,
        clip_score: max
      }
    })
  },

  onShow: function () {
    var that = this;

    var data = {
      requestType: "GetPlayInfo",
      created_song_id: this.data.created_song_id,
    }

    util.requestFromServer("GetPlayInfo", data).then((res) => {

      console.log(res.data);
      var currentIAC = wx.createInnerAudioContext();
      that.setData({
        BCK_url: res.data.finished_url,
        lyrics: res.data.lyrics,
        duration: res.data.duration,
        currentIAC: currentIAC,
      })

      // wx.showLoading({
      //   title: "加载中",
      // })

      // wx.downloadFile({
      //   url: that.data.BCK_url,
      //   success: function (res) {
      //     wx.hideLoading();
      //     if (res.statusCode === 200) {
      //       that.setData({
      //         tempPath: res.tempFilePath,
      //       })

      //       wx.hideLoading();

      //       currentIAC.src = res.tempFilePath;
      //       that.play();

      //       wx.showToast({
      //         title: '加载成功',
      //       });
      //     }
      //   }
      // });
      currentIAC.src = that.data.BCK_url;

      if (that.data.isPlaying)
        that.play();

      var duration_formatted = timer.timeFormat(parseInt(that.data.duration));
      this.setData({
        duration_formatted: duration_formatted,
      })


    }).catch((err) => {
      console.log(err);
    })
  },
  onBackTap: function () {

    wx.navigateBack({
      delta: 1
    })
  },
  onHide: function () {
    if (!this.data.currentIAC.paused)
      this.data.currentIAC.stop();
  },
  onUnload: function () {
    if (!this.data.currentIAC.paused)
      this.data.currentIAC.stop();

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
  onTapToEnjoy: function (event) {
    this.onTapToPause();
    wx.navigateTo({
      url: '../player/player?isShare=false' + '&created_song_id=' + this.data.created_song_id,
    })
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
        if (currentIAC.currentTime - that.data.lastUpdateTime < 0.5)
          return;

        var progress = parseInt(currentIAC.currentTime / that.data.duration * 100);
        var progress_formatted = timer.timeFormat(parseInt(currentIAC.currentTime));
        that.setData({
          progress: progress,
          progress_formatted: progress_formatted,
          lastUpdateTime: currentIAC.currentTime,

        })

        var currentLyricLineNum = that.data.currentLyricLineNum;
        var endTime = timer.convertStrToTime(that.data.lyrics[currentLyricLineNum].endTime);
        var beginTime = timer.convertStrToTime(that.data.lyrics[currentLyricLineNum].beginTime);
        if (currentIAC.currentTime < beginTime)
          return;
        else if (currentIAC.currentTime > endTime && currentLyricLineNum < that.data.lyrics.length - 1) {
          currentLyricLineNum++;
          that.setData({
            currentLyric: that.data.lyrics[currentLyricLineNum].lyric,
            currentLyricLineNum: currentLyricLineNum,
          })
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
      var endTime = timer.convertStrToTime(that.data.lyrics[currentLyricLineNum].endTime);
      var beginTime = timer.convertStrToTime(that.data.lyrics[currentLyricLineNum].beginTime);
      if (currentIAC.currentTime < beginTime)
        return;
      else if (currentIAC.currentTime > endTime && currentLyricLineNum < that.data.lyrics.length - 1) {
        currentLyricLineNum++;
        that.setData({
          currentLyric: that.data.lyrics[currentLyricLineNum].lyric,
          currentLyricLineNum: currentLyricLineNum,
        })
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
  onTapToPause() {
    var currentIAC = this.data.currentIAC;
    currentIAC.pause();
    this.setData({
      isPlaying: false
    })
  },
  onShareAppMessage: function (res) {
    if (res.from === 'menu') {
      console.log(res.target)
    }

    var userInfo = app.globalData.userInfo;
    var isShare = true;
    var titleString = userInfo.nickName + "邀请你和他一起欣赏 《" + this.data.FinishedSong.music.title + " " + this.data.FinishedSong.initiatorNick + "(Cover " + this.data.FinishedSong.music.singer + ")》";
    return {
      title: titleString,
      path: '/pages/player/player?isShare=false' + '&created_song_id=' + this.data.created_song_id,
      imageUrl: this.data.FinishedSong.music.coverImg,
    }
  },
})