// pages/create/create.js
const app=getApp();
const util = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    toCreateSong:{},
    createType:false,
    recommendWord:"",

    compatibility: app.globalData.compatibility,
    Comp: {
      statusBarHeight: app.globalData.statusBarHeight,
      iSback: true,
      color: "#000",
      text: "",
      background: "#8aaed7" 
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    console.log(options);
    var songId = options.songId;

    this.data.toCreateSong = wx.getStorageSync("to_create_song");
    this.setData({
      song:this.data.toCreateSong,
    })
  },

  onBackTap: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  //跳转到选择歌词界面
  onTaptoCreate:function(event){

    var songId = this.data.toCreateSong.songId,
        recommendWord = this.data.recommendWord,
        world_shared = this.data.createType==true?1:0;
        
    //未授权无法使用该功能
    var openid = wx.getStorageSync("openid");
    if(!openid){
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
      return;
    }else if(recommendWord.length<5){
      wx.showModal({
        title: '提示',
        content: '推荐语字数必须多于五个字喔，请重新填写',
        showCancel:false,
      });
      return;
    }else if(recommendWord.length>=201){
      wx.showModal({
        title: '提示',
        content: '推荐语字数过长，请重新填写',
        showCancel:false,
      });
      return;
    }
    
    var data = {
      requestType: "CreateSong",
      song_id: songId,
      openid: openid,
      message: recommendWord,
      world_shared: world_shared,
    }
    
    util.requestFromServer("CreateSong",data).then((res)=>{
      console.log(res);
      wx.redirectTo({
        url: '../select/select?created_song_id=' + res.data.created_song_id + '&' + "song_id=" + songId +'&isShare='+'false',
        success: function (res) { },
        fail: function (res) { },
        complete: function (res) { },
      })
    }).catch((err)=>{
      console.log("Create: request error");
    })

   
  },

  //跳转到post页面
  onTaptoCancel:function(event){
    wx.navigateBack({
      url: '../post/post',
    })
  },

  setCreatingType:function(event){
    this.data.createType = event.detail.value;
  },

  inputChange:function(event){
    this.data.recommendWord = event.detail.value;
  }


})