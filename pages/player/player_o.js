var util = require('../../utils/util');
var app=getApp();

//跳转player需要传入 created_songId

Page({
  data:{
    created_songId:null,
    duration_print: null, 
    duration: 0,
    currentSong:null,
    currentLyric: '',
    Lyrics:null,
    playUrl:'',
    
    currentLineNum:0,
    toLineNum: -1,
    playIcon: 'icon-pause',
    cdCls: 'play',
    dotsArray: new Array(2),
    currentDot: 0,
    isShare:false,
    //用户完成的歌曲created_songId数组
    SongList_created:[],
    //播放的歌曲片段索引
    clipIndex:0,
    clipState:'wait',
  },

  onLoad:function(options){
    var created_songId = options.created_song_id;
    var isShare = options.isShare;
    var SongList_created=[];
    var currentIndex;
    if (isShare == 'false' || !isShare){
      var MyFinishedSongs = wx.getStorageSync("MyFinishedSongs");
      for (var i in MyFinishedSongs) {

        SongList_created.push(MyFinishedSongs[i].created_song_id);

        if (created_songId == MyFinishedSongs[i].created_song_id) {
          currentIndex = parseInt(i);
        }
      }
      this.setData({
        isShare:false
      })
    }else{
      currentIndex=-10;
      this.setData({
        isShare: true
      })
    }

    //兼容
    var compatibility = app.globalData.compatibility;
    var statusBarHeight = app.globalData.statusBarHeight;

    if (compatibility){
      statusBarHeight = statusBarHeight+20;
    }else{
      statusBarHeight = 0;
    }



    this.setData({
      created_songId: created_songId,
      currentIndex: currentIndex,
      SongList_created: SongList_created,
      compatibility: compatibility,
      statusBarHeight: statusBarHeight
    })

    this.getPlayInfoDataFromServer();
  },


  init: function (currentIndex){
    if (this.data.manage){
      this.data.manage.stop();
    }

    if (this.data.innerAudioContext){
      this.data.innerAudioContext.destroy();
    }

    var SongList_created = this.data.SongList_created;
    if (currentIndex < SongList_created.length && currentIndex > -1) {
      this.setData({
        created_songId: SongList_created[currentIndex],
        currentIndex: currentIndex
      })
    } else if (this.data.isShare){
      this.setData({
        created_songId: this.data.created_songId,
        currentIndex: this.data.currentIndex
      })
    }

    this.setData({
      clipState: 'wait',
      clipIndex: 0,
      duration_print: null,
      duration: 0,
      currentSong: null,
      currentLyric: '',
      Lyrics: null,
      playUrl: '',
      currentLineNum: 0,
      toLineNum: -1,
      playIcon: 'icon-pause',
      cdCls: 'play',
    })
    this.getPlayInfoDataFromServer();
  },

  // 创建播放器
  _createAudio: function (playUrl) {
    var that=this;
    wx.playBackgroundAudio({
      dataUrl: playUrl,
      title: that.data.currentSong.title,
      coverImgUrl: that.data.currentSong.cover_url,
    })

    this.setData({
      currentTime_format:"0:00",
    })
    
    // 监听音乐播放
    wx.onBackgroundAudioPlay(() => {
      that.setData({
        playIcon: 'icon-pause',
        cdCls: 'play'
      })
    })

    // 监听音乐暂停
    wx.onBackgroundAudioPause(() => {
      that.setData({
        playIcon: 'icon-play',
        cdCls: 'pause'
      })
    })

    // 监听音乐停止
    wx.onBackgroundAudioStop(() => {
      that.setData({
        playIcon: 'icon-play',
        cdCls: 'pause'
      })
      var currentIndex = this.data.currentIndex;
      this.init(currentIndex);
    })

    // 监听播放拿取播放进度
    const manage = wx.getBackgroundAudioManager();
    this.setData({
      manage:manage
    })
    manage.onTimeUpdate(() => {
      const currentTime = manage.currentTime
      that.setData({
        currentTime_format: that.formatTime(currentTime),
        percent: currentTime / that.data.duration,
        currentTime:currentTime
      })
      that.handleLyric(currentTime * 1000);
      that.clipCount(currentTime * 1000);
    })
  },

  //片段播放
  clipCount:function(currentTime){
    var clipIndex = this.data.clipIndex;
    var clipInfo=this.data.clipInfo;
    for(var i in clipInfo){
      var begin_time = clipInfo[i].begin_time + (clipInfo[i].delay)/10;
      var end_time = clipInfo[i].end_time + (clipInfo[i].delay) / 10;
      if (currentTime > begin_time && currentTime < end_time){
        //当前片段还在播放时间段
        if (clipIndex==i){
          if (this.data.clipState=='wait'){
            this.data.innerAudioContext.play();
          } else if (this.data.clipState == 'end' && clipIndex != clipInfo.length){
            this._createInnerAudioContext();
          }
        } 
        else if (clipIndex == (i - 1) && this.clipState == 'end'){
          clipIndex++;
          this.setData({
            clipIndex: clipIndex
          })
          this._createInnerAudioContext();
        }
      }
    }
  },

  _createInnerAudioContext: function () {
    var that=this;
    var clipIndex = this.data.clipIndex;
    const innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.autoplay = false;
    innerAudioContext.src = this.data.clipInfo[clipIndex].sang_url;
    this.setData({
      innerAudioContext: innerAudioContext,
      clipState:'wait'
    })

    innerAudioContext.onPlay(() => {
      this.setData({
        clipState:'play',
        playIcon: 'icon-pause',
        cdCls: 'play'
      })
    })

    innerAudioContext.onPause(() => {
      var clipIndex = that.data.clipIndex;
      var end_time = that.data.clipInfo[clipIndex].end_time + that.data.clipInfo[clipIndex].delay / 10;
      var currentTime = that.data.currentTime;
      if (currentTime > end_time ){
        if (clipIndex < that.data.clipInfo.length - 1){
          that.setData({
            clipState: 'end',
            clipIndex: clipIndex + 1,
            innerAudioContext: null
          })
        }else{
          that.setData({
            clipState: 'wait',
            clipIndex: 0,
            innerAudioContext: null
          })
        }
        innerAudioContext.destroy();
      }else{
        that.setData({
          clipState: 'pause',
          playIcon: 'icon-play',
          cdCls: 'pause'
        })
      }
    })

    innerAudioContext.onEnded(() => {
      if (clipIndex < that.data.clipInfo.length-1){
        that.setData({
          clipState: 'end',
          clipIndex: clipIndex + 1
        })
        
      } else {
        that.setData({
          clipState: 'wait',
          clipIndex: 0
        })
      }
      innerAudioContext.destroy();
    })

    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })

  },
  
  // 歌词滚动回调函数
  handleLyric: function (currentTime) {
    //当前唱到的歌词行
    var currentLineNum = this.data.currentLineNum;
    //跳转到顶部的行，不一定是当前唱到的歌词
    var toLineNum;        
    
    //处理异步问题造成的错误，当Lyrics数据还未从服务器获取时，直接退出。
    if (this.data.Lyrics==null){
      return;
    }

    var lyrics=this.data.Lyrics; 
    for (var i in lyrics){
      var beginTime = this.analysisTime(lyrics[i].beginTime);
      var endTime = this.analysisTime(lyrics[i].endTime);
      if (currentTime > beginTime  && currentTime < endTime ){
        currentLineNum = i;
        // console.log("currentLineNum:" + currentLineNum + " beginTime:" + beginTime + " currentTime:" + currentTime)
        break;
      }
    }
    
    //为保证currentLineNum大于5时 唱到的歌词在中间
    var toLineNum = currentLineNum - 5;
    if (currentLineNum > 5 && toLineNum != this.data.toLineNum) {
      this.setData({
        toLineNum: toLineNum
      })
    }

    this.setData({
      currentLineNum: currentLineNum,
      currentLyric: lyrics[currentLineNum].lyric
    })

  },
  // 解析时间
  analysisTime:function(time){
    var Time=time.split(":");
    var analysisTime=0;
    parseFloat(Time[0])
    analysisTime = parseFloat(Time[0]) * 60 + parseFloat(Time[1]);
    return analysisTime * 1000;
  },

  formatTime: function (interval) {
    interval = interval | 0
    const minute = interval / 60 | 0
    const second = this.pad(interval % 60)
    return `${minute}:${second}`
  },
  /*秒前边加0*/
  pad(num, n = 2) {
    let len = num.toString().length
    while (len < n) {
      num = '0' + num
      len++
    }
    return num
  },

  changeDot: function (e) {
    this.setData({
      currentDot: e.detail.current
    })
  },

  Return:function(){
    wx.switchTab({
      url: '../post/post',
    })
  },

  prev: function () {
    var currentIndex=this.data.currentIndex;
    var isShare = this.data.isShare;
    if (!isShare && currentIndex > 0){
      currentIndex = currentIndex - 1;
      this.init(currentIndex);
    }
  },
  
  next: function () {
    var currentIndex = this.data.currentIndex;
    var isShare = this.data.isShare;
    if (!isShare) {
      if ( currentIndex < this.data.SongList_created.length - 1){
        currentIndex = currentIndex + 1;
        this.init(currentIndex);
      }
    }
  },

  togglePlaying: function () {
    var that=this;
    wx.getBackgroundAudioPlayerState({
      success: function (res) {
        var status = res.status
        if (status == 1) {
          wx.pauseBackgroundAudio();
          that.setData({
            playIcon: 'icon-play',
            cdCls: 'pause'
          })

          if (that.data.clipState == 'play') {
            that.data.innerAudioContext.pause();
          }
        } else {
          if (that.data.clipState == 'pause') {
            that.data.innerAudioContext.play();
          }
          that.setData({
            playIcon: 'icon-pause',
            cdCls: 'play'
          })
          wx.playBackgroundAudio();
        }
      }
    })
  },

  
  //获取歌词数据+创建背景音乐播放器
  getPlayInfoDataFromServer: function () {

    var that = this;

    var data = {
      requestType: "GetPlayInfo",
      created_song_id: this.data.created_songId,
    }

    util.requestFromServer("GetPlayInfo", data).then((res) => {
      console.log(res);
      wx.setStorageSync("currentSong", res.data);
      that.setData({
        currentSong: res.data,
        duration: res.data.duration,
        Lyrics: res.data.lyrics,
        duration_print: that.formatTime(res.data.duration),
        clipInfo: res.data.clipInfo
      })
      //创建背景音乐播放器
      this._createAudio(res.data.bg_url);
      this._createInnerAudioContext();
    }).catch((err) => {
      console.log("请求失败");
    })
  },
  onUnload:function(){
    if (this.data.manage) {
      this.data.manage.stop();
    }

    if (this.data.innerAudioContext) {
      this.data.innerAudioContext.destroy();
    }
  },

  onShareAppMessage: function (res) {
    var isShare = true;
    var category = 'Player';
    var userInfo = app.globalData.userInfo;
    var titleString = userInfo.nickName + "邀请你欣赏他的作品" + this.data.currentSong.title;
    return {
      title: titleString,
      path: '/pages/player/player?isShare=' + isShare + '&created_song_id=' + this.data.created_songId,
      imageUrl: this.data.currentSong.cover_url,
    }
  },

})
