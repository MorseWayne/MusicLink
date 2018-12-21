App({
  globalData: {

    userInfo: null,
    server_base: "https://music-link.caoyu.online",
    version: '0.0.0',
    compatibility: false,
    //状态栏高度
    statusBarHeight: 0,
    windowHeight:0,
  },

  // 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
  onLaunch: function () {

  //获取用户微信版本号
   var that=this;
   wx.getSystemInfo({
     success: function(res) {
       that.globalData.version=res.version;
       that.globalData.statusBarHeight = res.statusBarHeight; 
       that.globalData.windowHeight = res.windowHeight;
     }
   })
   console.log("windowHeight:"+that.globalData.windowHeight);

   if (this.compareVersion(that.globalData.version,'6.6.0')){
     that.globalData.compatibility = true;
   }
   
  },

/*
 * 微信版本号比较
 * 用于兼容处理
 */
  compareVersion:function(v1, v2) {
    v1 = v1.split('.')
    v2 = v2.split('.')
    var len = Math.max(v1.length, v2.length)

    while (v1.length < len) {
        v1.push('0')
      }
    while (v2.length < len) {
        v2.push('0')
      }

    for (var i = 0; i<len; i++) {
    var num1 = parseInt(v1[i])
    var num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }

  return 0
}

})