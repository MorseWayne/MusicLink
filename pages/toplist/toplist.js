var util = require('../../utils/util');
var app = getApp();

const CATEGROY_MOD_1 = "热门";
const CATEGROY_MOD_2 = "推荐";
const CATEGROY_MOD_3 = "外语";
const CATEGROY_MOD_4 = "作品";

 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    images:["/images/icon/first.png",
            "/images/icon/second.png",
            "/images/icon/third.png"],
    category:null,
    toplist:null,
    compatibility: app.globalData.compatibility,
    Comp: {
      statusBarHeight: app.globalData.statusBarHeight,
      iSback: true,
      color: "#fff",
      text: "返回",
      background: "",
      iSpadding:false
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var category = options.category;
    var toplist, navigationText;
    if (category == CATEGROY_MOD_1){

      toplist = wx.getStorageSync("inthreatenData");
      navigationText="连音符·热门榜";

    } else if (category == CATEGROY_MOD_2){

      toplist = wx.getStorageSync("recommendData");
      navigationText = "连音符·推荐榜";
    } else if (category == CATEGROY_MOD_3) {

      toplist = wx.getStorageSync("foreignData");
      navigationText = "连音符·外语榜";
    } else if (category == CATEGROY_MOD_4) {
      var songs=[];
      var Temp = wx.getStorageSync("BillboardListData").songs;
      //数据处理
      for (var i in Temp){
        var singer = Temp[i].nickname + " (Cover " + Temp[i].artist + ")";
        var temp={
          coverageUrl:Temp[i].cover_url,
          title: Temp[i].title,
          singer: singer,
          created_song_id: Temp[i].created_song_id
        }
        songs.push(temp);
      }

      var toplist={
        songs: songs,
        categoryTitle: "作品"
      };
      
      navigationText = "连音符·作品榜";
    } else{
      console.log("err:Toplist 传参错误");
    }

    this.setData({
      toplist: toplist,
      category: category
    })
    wx.setNavigationBarTitle({
      title: navigationText,
    })
  },

  onBackTap: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  attendTap:function(event){
    var index=event.currentTarget.dataset.index;
    var songId = this.data.toplist.songs[index].songId;

    if (this.data.category != CATEGROY_MOD_4 ){
      wx.setStorageSync("to_create_song", this.data.toplist.songs[index]);
      console.log(songId);
      wx.navigateTo({
        url: '../create/create?songId=' + songId,
      });
    }else{
      wx.setStorageSync("MyFinishedSongs", this.data.toplist);
      wx.navigateTo({
        url: '../player/player?isShare=false' + '&created_song_id=' + this.data.toplist.songs[index].created_song_id,
      })
    }

  }

})