var app=getApp();
var util = require('../../utils/util');

Page({

  data: {
    recommendWord:"",
    compatibility: app.globalData.compatibility,
    Comp: {
      statusBarHeight: app.globalData.statusBarHeight,
      iSback: true,
      color: "#000",
      text: "个人中心",
      background: "#fff"
    }
  },

  onLoad: function (options) {
    var publishSong = wx.getStorageSync("publishSong");
    this.setData({
      publishSong: publishSong
    })
  },

  onBackTap: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  inputChange: function (event){
    this.setData({
      recommendWord : event.detail.value
    })
  },

  onPublishTap:function(){
    this.publishSong();
  },
  publishSong: function () {
    var that = this;
    var data = {
      requestType: "PostToWorld",
      created_song_id: this.data.publishSong.created_song_id,
      operation_type:"post",
      post_message: this.data.recommendWord
    }
    util.requestFromServer("PostToWorld", data).then((res) => {
      //发布完返回
      that.onBackTap(); 
      console.log(res.data);
    }).catch((err) => {
      console.log("请求失败");
    })
  },
})