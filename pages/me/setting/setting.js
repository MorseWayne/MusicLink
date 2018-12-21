// pages/setting/setting.js
var app=getApp();
const util = require('../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pagesId:null,
    navigationText:"",

    compatibility: app.globalData.compatibility,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = options.id;
    var title="";
    switch(id){
      case '4':
        title = "设置";
        break;
      case '5':
        title = "关于";
        break;
      default:
        break;
    }
    this.setData({
      pagesId:id,
      navigationText:title,
      Comp: {
        statusBarHeight: app.globalData.statusBarHeight,
        iSback: true,
        color: "#000",
        text: title,
        background: "#fff",
        iSpadding: true
      }
    })
  },


  onReady: function () {
    wx.setNavigationBarTitle({
      title: this.data.navigationText,
    })
  },
  
  onBackTap: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  handler:function(e){

    if (e.detail.authSetting['scope.userInfo']) {

      wx.getUserInfo({
        success: function (res_Info) {
          app.globalData.userInfo = res_Info.userInfo;
          var rawData = res_Info.rawData;

          wx.login({
            success: function (res) {

              var code;
              if (res.code) {
                code = res.code
              }
              var data = {
                requestType: 'wechat_login',
                code: code,
                userInfo: rawData
              };

              util.requestFromServer("OnLogin", data).then((res) => {
                wx.setStorageSync("openid", res.data.openid);
              }).catch((err) => {
                console.log("setting: Request failed");
              })
            },
          })
        }
      })
    }else if (!e.detail.authSetting['scope.userInfo']){
      wx.clearStorage();
      app.globalData.userInfo=null;
    } 
  },

  onTapClearStorage:function(){
    wx.showModal({
      title: '提示',
      content: '清楚缓存将会清除你在小程序中产生的所有数据',
      cancelText:"取消",
      confirmText:"确认清除",
      success:function(res){
        if(res.confirm){
          try {
          
            wx.clearStorageSync();
            //清除文件缓存
            wx.getSavedFileList({
              success: function (res) {
                for(var i in res.fileList){
                  if (res.fileList.length > 0) {
                    wx.removeSavedFile({
                      filePath: res.fileList[i].filePath,
                      fail:function(err){
                        wx.showToast({
                          title:"清楚文件失败",
                          image: "/images/icon/error_icon.png",
                          mask: true,
                        });
                        console.log(err);
                      }
                    })
                  }
                }
              }
            })
            wx.showToast({title: '清除成功',});

            wx.reLaunch({
              url: '../../welcome/welcome'
            })
  
          } catch (e) 
          {
            console.log(e);
            wx.showToast({title: '清除失败',});
          }
        }
      }
    });
   
  },
  
  onTapClearAuthorized:function(){
    wx.showModal({
      title: '抱歉',
      content: '功能还未开放，后续版本可能会添加此功能，点击授权可以设置你想要关闭的授权',
      showCancel:false,
    })
  }

})