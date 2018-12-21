var app=getApp();

Page({

  data:{

    //兼容
    compatibility: app.globalData.compatibility,
    Comp: {
      statusBarHeight: app.globalData.statusBarHeight,
      iSback: true,
      color: "#000",
      text: "排行榜",
      background: "#de4137",
      iSpadding: true
    }
  },

  onLoad:function(){
    var inthreatenSongs = wx.getStorageSync("inthreatenData").songs;
    var recommendSongs = wx.getStorageSync("recommendData").songs;
    var foreignSongs = wx.getStorageSync("foreignData").songs;
    var BillboardList = wx.getStorageSync("BillboardListData").songs;
    var topList=[
      { 
        toplistIndex: 0, 
        image: "/images/cover/finishedmusic.jpg", 
        song: [
          BillboardList[0].title,
          BillboardList[1].title,
          BillboardList[2].title
        ],
        singer: [
          BillboardList[0].nickname +" (Cover " + BillboardList[0].artist + ")",
          BillboardList[1].nickname + " (Cover " + BillboardList[1].artist + ")",
          BillboardList[2].nickname + " (Cover " + BillboardList[2].artist + ")"
        ],
        category: "作品" 
      },
      {
        toplistIndex: 1,
        image: "/images/cover/hotmusic.jpg",
        song:[
          inthreatenSongs[0].title,
          inthreatenSongs[1].title,
          inthreatenSongs[2].title
        ],
        singer:[
          inthreatenSongs[0].singer,
          inthreatenSongs[1].singer,
          inthreatenSongs[2].singer
        ],
        category: "热门"
      },
      {
        toplistIndex: 2,
        image: "/images/cover/recommendmusic.jpg",
        song :[
          recommendSongs[0].title,
          recommendSongs[1].title,
          recommendSongs[2].title
        ],
        singer: [
          recommendSongs[0].singer,
          recommendSongs[1].singer,
          recommendSongs[2].singer
        ],
        category: "推荐"
      },
      { 
      toplistIndex: 3,
      image: "/images/cover/foreignmusic.jpg",
      song: [
        foreignSongs[0].title,
        foreignSongs[1].title,
        foreignSongs[2].title,
      ],
      singer: [
        foreignSongs[0].singer,
        foreignSongs[1].singer,
        foreignSongs[2].singer,
      ],
      category: "外语"
      }
    ];
    this.setData({
      topList: topList
    })
  },

  onCatchTop: function(event){
    var idx = event.currentTarget.dataset.idx;
    wx.navigateTo({
      url: '../toplist/toplist?category=' + this.data.topList[idx].category,
    });
  },

  onBackTap: function () {
    wx.navigateBack({
      delta: 1
    })
  }
})