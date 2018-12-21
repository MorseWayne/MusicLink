var util = require('../../utils/util');
var app=getApp();
Page({

  data: {
    // tab切换  
    currentTab: 0,
    compatibility: app.globalData.compatibility,
    statusBarHeight: app.globalData.statusBarHeight,
    windowHeight: app.globalData.windowHeight
  },

  //生命周期函数--监听页面加载
  onLoad: function (options) {
    this.getAllDataFromServer();
    this.getFinishedData();
  },

  swichNav: function (e) {
    var that = this;
    var current = e.target.dataset.current;
    if (this.data.currentTab === current) {
      return false;
    } else {
      that.setData({
        currentTab: current,
      })
    }
  },

  getFinishedData: function () {
    var that = this;
    var data = {
      requestType: "GetWorldPosted"
    }

    util.requestFromServer("GetWorldPosted", data).then((res) => {
      that.setFinishedData(res.data);
    }).catch((err) => {
      console.log("请求失败");
    })
  },

  swiperChange: function (e) {
    this.setData({
      currentTab: e.detail.current,
    })
  },

  //重新绑定数据，刷新world界面
  onShow: function () {
    this.getAllDataFromServer();
  },

  onPullDownRefresh:function(){
    var that=this;
    that.getAllDataFromServer();
    that.getFinishedData();
    wx.stopPullDownRefresh();
  },

  upper: function (e) {
    var that = this;
    that.getAllDataFromServer();
    that.getFinishedData();
    wx.stopPullDownRefresh();
  },

  getAllDataFromServer: function () {

    var that = this;

    var data = {
      requestType: "GetWorldSongs"
    }
    wx.showLoading({
      title: '加载中',
    })

    util.requestFromServer("GetWorldSongs", data).then((res) => {
      that.setAllData(res.data);
    }).catch((err) => {
      console.log("请求失败");
    })
  },

  setAllData:function(data){

    var songs = data.songs;
    var worldList = [];

    for(var i in songs){
      var song = songs[i];
      var progress =  parseInt(song.reserved_clips / song.clip_number * 100);
      var create_time_read = util.getDiffTime(song.song_created_time/1000, true);
      var temp = {
        ids: {
          created_song_id: song.created_song_id,
          song_id: song.song_id,
        },
        avatar: song.avatar_url,
        initiatorNick: song.nickname,
        created_time: song.song_created_time,
        create_time_read: create_time_read,
        comment:song.message,
        music:{
          coverImg: song.cover_url,
          singer:song.artist,
          title: song.title,
        },
        progress: progress,
      }

      worldList.push(temp);
    }
    
    worldList = util.getSortedListByTime(worldList);
    wx:wx.hideLoading();
    this.setData({
      worldList:worldList,
    })

  },

  setFinishedData: function (data) {
    console.log(data);
    var songs = data.songs;
    var FinishedList = [];

    for (var i in songs) {
      var song = songs[i];
      var create_time_read = util.getDiffTime(song.song_created_time / 1000, true);
      var nickNameString="";
      var nickNameString_after="";
      var Paticipants=[];

      for (var x in song.paticipants) {
        if(x==0){
          Paticipants.push(song.paticipants[x]);
        }else{
          var temp=true;
          for (var y in Paticipants){
            if (song.paticipants[x].avatar_url == Paticipants[y].avatar_url){
              temp =false;
              break;
            }
          }
          if(temp){
            Paticipants.push(song.paticipants[x]);
          }
        }
      }


      for (var x in Paticipants){
        if(x!=0)
          nickNameString += "、";
        if(x<10){
          nickNameString += Paticipants[x].nickname;
        }else{
          break;
        }
      }

      nickNameString_after = "等" + Paticipants.length +"人参与了合唱";

      var temp = {
        ids: {
          created_song_id: song.created_song_id,
          song_id: song.song_id,
        },
        avatar: song.avatar_url,
        initiatorNick: song.nickname,
        created_time: song.song_created_time,
        create_time_read: create_time_read,
        comment: song.post_message,
        listened_time: song.listened_time,
        song_score: song.song_score,
        paticipants: song.paticipants,
        nickNameString: nickNameString,
        nickNameString_after: nickNameString_after,
        Paticipants: Paticipants,
        music: {
          coverImg: song.cover_url,
          singer: song.artist,
          title: song.title,
        }
      }
      FinishedList.push(temp);
    }

    FinishedList = util.getSortedListByTime(FinishedList);
    wx.hideLoading();
    this.setData({
      FinishedList: FinishedList,
    })
  },

  onTapToDetail(event) {
    var ids = event.currentTarget.dataset.ids;
    wx.navigateTo({
      url: '../select/select?created_song_id=' +ids.created_song_id+"&song_id="+ids.song_id+"&isShare="+'false', 
    })
  },

  onTapToPlay(event) {
    var ids = event.currentTarget.dataset.ids;
    wx.setStorageSync("MyFinishedSongs", this.data.FinishedList);
    // wx.navigateTo({
    //   url: '../player/player?isShare=false' + '&created_song_id=' + ids.created_song_id,
    // })

    wx.navigateTo({
      url: '../appreciate/appreciate?isShare=false' + '&created_song_id=' + ids.created_song_id,
    })
  },

})