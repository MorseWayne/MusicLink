var app=getApp();

Page({
    data:{
      userInfo: {},
      hasUserInfo:false,
      //未授权时显示的用户头像，此处应该为“连音符”logo
      avatarUrl: "https://oss.caoyu.online/basic/basicprofile.png",
      menuitems: [
        { text: '发起的歌曲', menuitemsId: 0, image:"/images/icon/create_icon.png"},
        { text: '参与的歌曲', menuitemsId: 1, image: "/images/icon/participate_icon.png"},
        { text: '作品', menuitemsId: 2, image: "/images/icon/finish_icon.png"},
        { text: '联系客服', menuitemsId: 3, image: "/images/icon/service_icon.png" },
        { text: '设置', menuitemsId: 4, image: "/images/icon/setting_icon.png"}, 
        { text: '关于', menuitemsId: 5, image: "/images/icon/about_icon.png"},
        { text: '打赏开发者', menuitemsId: 6, image: "/images/icon/donate_icon.png"}
      ],

      compatibility: app.globalData.compatibility,
      Comp:{
        statusBarHeight: app.globalData.statusBarHeight,
        iSback:false,
        color: "#000",
        text:"个人中心",
        background: "#fff",
        iSpadding: true
      }
    },

    onLoad: function (){
      if (app.globalData.userInfo){
        this.setData({
          userInfo: app.globalData.userInfo,
          hasUserInfo: true,
        })
      }
    },

    onShow: function () {
      if (app.globalData.userInfo) {
        this.setData({
          userInfo: app.globalData.userInfo,
          hasUserInfo: true,
        })
      }else{
        this.setData({
          hasUserInfo: false,
        })
      }
    },

    onTapToDetail:function(event){
      var pagesId = event.currentTarget.dataset.menuitemId;
      if (pagesId == 0 || pagesId == 1 || pagesId == 2){
        wx.navigateTo({
          url: 'list-item/list-item?id=' + pagesId,
        });
      }
      else if (pagesId == 6) {
        wx.previewImage({
          current: 'https://oss.caoyu.online/basic/D8F17CDC35F80C6330B3DCBFAEAC0763.jpg', // 当前显示图片的http链接
          urls: ['https://oss.caoyu.online/basic/D8F17CDC35F80C6330B3DCBFAEAC0763.jpg']
        })
      }else{
          wx.navigateTo({
            url: 'setting/setting?id=' + pagesId,
          });
        }
      }

    
})




