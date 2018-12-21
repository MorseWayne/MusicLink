// pages/post.js

var util = require('../../utils/util');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

    //热门
    inThreaten:{},

    //推荐
    ourRecommend:{},

    inThreaten_P:{},

    swipperPost:{},

    subfieldList:[
      { subfieldIndex: 1, image: "/images/icon/bloom_icon.png", text: "发现" },
      { subfieldIndex: 2, image: "/images/icon/finishedSong_icon.png", text: "作品榜" },
      { subfieldIndex: 3, image: "/images/icon/topList_icon.png", text: "排行榜" }
    ],

    //搜索
    searchResult:[],
    showSearchResult:false,
    showNoResult:false,
    //兼容
    compatibility: false,
    Comp: {
      statusBarHeight: app.globalData.statusBarHeight,
      color: "#000",
      text: "点歌",
      background: "#de4137"
    },

     //控制功能导航页
     tutorailHidden_post: true,
     hasChanged: false,
 
     //所有导航页
     imgUrls: [
       "https://oss.caoyu.online/basic/Guidance/main1.PNG",
       "https://oss.caoyu.online/basic/Guidance/main2.PNG",
     ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    var tutorailHidden_post = wx.getStorageSync("tutorailHidden_post");

    if (tutorailHidden_post === undefined)
      tutorailHidden_post = false;

    this.setData({
      tutorailHidden_post:tutorailHidden_post,
    })

    if(tutorailHidden_post){
      this.setData({
        compatibility:app.globalData.compatibility,
      })
    }else{
      wx.hideTabBar();
    }
   

    this.getSongsListData("GetSongs", "foreign", "外语", { requestType: "GetSongs", category: "外语" });
    this.getSongsListData("GetSongs","inThreaten","热门",{requestType: "GetSongs",category:"热门" });
    this.getSongsListData("GetSongs","ourRecommend","推荐",{requestType: "GetSongs",category:"推荐" });
    this.getSongsListData("GetSongs","swipperPost","海报",{requestType: "GetSongs",category:"海报" });

    this.getFinishedData();

    var that = this;
    setTimeout(()=>{
      that.setData({
        tutorailHidden_post: true,
        compatibility: app.globalData.compatibility,
      });

      wx.setStorageSync("tutorailHidden_post", true);
      wx.showTabBar();
    },5000)

  },

  getSongsListData:function(servelet, settedKey,categoryTitle,data){  
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    //这里是请求格式的模板
    util.requestFromServer(servelet, data).then((res)=>{
      that.processRequestData(res.data, settedKey, categoryTitle);
    }).catch((err)=>{
      console.log("请求失败");
    })
  },

  /*
  **songRequested: 向服务器请求的数据
  **setttedKey: 作为标识数组元素的下标
  *catagoryTitle: 分栏的标题
  */
  processRequestData:function(songsRequested, settedKey, categoryTitle){
    var songs = [];

    // console.log(songsRequested);

    for(var i in songsRequested.songs){
      var song = songsRequested.songs[i];
      var title = song.title;
    
    var temp={
      stars: util.convertToStarsArray(song.stars),
      title: title,
      avarage:song.stars,
      coverageUrl:song.cover_url,
      singer:song.artist,
      songId: song.song_id,
      album:song.album,
    };

    songs.push(temp);
    }

    //重新绑定准备好的数据
    var readyData = {};
    var songs_p = [];

    if(settedKey!="swipperPost")
    {
      for(var i in songs){
        if(i<6){
          songs_p.push(songs[i]);
        }
        else
          break;
      }

      readyData[settedKey+"_P"] = {
        categoryTitle: categoryTitle,
        songs:songs_p
      }
    }

    readyData[settedKey] = {
       categoryTitle: categoryTitle,
       songs:songs,
    }

  
    wx.hideLoading();
    this.setData(readyData);
  },

  getFinishedData: function () {
    var that = this;
    var data = {
      requestType: "GetBillboardList"
    }

    util.requestFromServer("GetBillboardList", data).then((res) => {
      // console.log(res.data);
      that.setData({
        BillboardList: res.data
      })
    }).catch((err) => {
      console.log("请求失败");
    })
  },

  onSongTap: function(event){
   
    var song = event.currentTarget.dataset.song;
    //console.log(song);
    wx.setStorageSync("to_create_song", song);
    wx.navigateTo({
      url: '../create/create?songId='+song.songId,
    });
  },

  onSearchItemTap: function (event) {

    var index = event.currentTarget.dataset.id;
    var song=this.data.searchResult[index];
    this.setData({
      showSearchResult: false
    })
    wx.setStorageSync("to_create_song",  song);
    wx.navigateTo({
      url: '../create/create?songId=' + song.songId,
    });
  },

  onSearchTap: function () {
    this.setData({
      showSearchResult: true
    })
  },

  onStopSearchTap: function () {
    this.setData({
      showSearchResult: false
    })
  },

  onPageScroll: function (e) {
    this.setData({
      showSearchResult: false
    })
  },


  onMoreTap: function(event){
    wx.setStorageSync("inthreatenData", this.data.inThreaten);
    wx.setStorageSync("recommendData", this.data.ourRecommend);
    wx.setStorageSync("foreignData", this.data.foreign);
    var category = event.currentTarget.dataset.category;
    wx.navigateTo({
      url: '../toplist/toplist?category=' + category ,
    });
  },

  onSwipperTap: function(event){
    var idx =  event.target.dataset.idx;
    var song = this.data.swipperPost.songs[idx];
    wx.setStorageSync("to_create_song", song);
    wx.navigateTo({
      url: '../create/create?songId='+song.songId,
    });
  },

  onSubfieldTap: function(event){
    var idx = event.currentTarget.dataset.subfieldid;
    switch(idx){
      // case 0:
      // //合唱
      //   wx.showToast({
      //     title: '功能暂时未开放',
      //     icon:"none",
      //   })
      //   break;
      case 0:
      //漂流瓶
        wx.navigateTo({
          url: '../balloon/balloon',
        });
        // wx.showToast({
        //   title: '功能暂时未开放',
        //   icon:"none",
        // })
        break;
      case 1:
      //完结歌曲榜单
        wx.setStorageSync("BillboardListData", this.data.BillboardList);
        wx.navigateTo({
          url: '../toplist/toplist?category=' + "作品",
        });
        break;
      case 2:
      //排行榜（总）
      //将所有歌曲信息存到缓存中，方便后面获取。
        wx.setStorageSync("BillboardListData", this.data.BillboardList);
        wx.setStorageSync("inthreatenData", this.data.inThreaten);
        wx.setStorageSync("recommendData", this.data.ourRecommend);
        wx.setStorageSync("foreignData", this.data.foreign);
        wx.navigateTo({
          url: '/pages/all-toplist/all-toplist',
        })
        break;
      default:
        break;
    }
  },

  inputChange:function(event){
    var searchWord = event.detail.value; 
    this.setData({
      showSearchResult :true
    })
    if (searchWord !=""){
      this.Search(searchWord);
    }else{
      //重置
      this.setData({
        searchResult: []
      })
    }
  },

  Search: function (searchWord){
    var searchResult=[];
    var showNoResult;
    var inThreaten_songs = this.data.inThreaten.songs;
    var ourRecommend_songs = this.data.ourRecommend.songs;
    var swipperPost_songs = this.data.swipperPost.songs;
    
    //检索热门
    for (var i in inThreaten_songs){
      if (inThreaten_songs[i].title.search(searchWord) != -1){
        searchResult.push(inThreaten_songs[i]);
      }
    }

    //检索推荐
    for (var i in ourRecommend_songs) {
      if (ourRecommend_songs[i].title.search(searchWord) != -1) {
        searchResult.push(ourRecommend_songs[i]);
      }
    }

    //检索海报
    for (var i in swipperPost_songs) {
      if (swipperPost_songs[i].title.search(searchWord) != -1) {
        searchResult.push(swipperPost_songs[i]);
      }
    }
    if (searchResult.length == 0){
      showNoResult = true;
    }else{
      showNoResult = false;
    }

    this.setData({
      searchResult: searchResult,
      showNoResult: showNoResult
    })
  },

  change: function (e) {
    if (this.data.tutorailHidden_post)
      return;

    console.log(e.detail.current);

    if(e.detail.current == this.data.imgUrls.length-1)
      wx.showToast({
        title:"继续左滑结束导航",
        icon:"none"
      })

    this.setData({
      hasChanged: true,
    })


  },
  animationEnd: function (e) {

    if (this.data.tutorailHidden_post)
      return;
    console.log(e.detail.current);

    if (!this.data.hasChanged && e.detail.current == this.data.imgUrls.length-1) {
      this.setData({
        tutorailHidden_post: true,
        compatibility:app.globalData.compatibility,
      })
      // wx.showToast({
      //   title: '导航结束',
      //   icon: "none",
      //   duration: 1500,
      //   mask: "false",
      // })

      wx.setStorageSync("tutorailHidden_post", true);
      wx.showTabBar();
    }

    this.setData({
      hasChanged: false,
    })
  }

})