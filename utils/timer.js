
var app = getApp();

/**
 * @param {你的page对象.调用该函数的this} that 
 * @param {计时时间} remainedTime 
 */
function countDown(that, remainedTime) {

  if(remainedTime<=0){
    
    // if(that.data.currentBCK_IAC.paused){
    //   that.data.currentBCK_IAC.volume=0;
    //   that.data.currentOrg_IAC.volume=0;
    //   that.data.currentBCK_IAC.play();
    //   if (!that.data.isRecording) {
    //     const options = {
    //       duration: 300000,
    //       sampleRate: 44100,
    //       numberOfChannels: 2,
    //       encodeBitRate: 192000,
    //       format: 'mp3',
    //       frameSize: 50
    //     }
    //     //console.log("countDown completed");
    //     wx.getRecorderManager().start(options);
    //     that.data.currentOrg_IAC.play();
    //     that.setData({
    //       isRecording: true,
    //       disableOrg:false,
    //     })
    //   }
    //   console.log(that.data.currentBCK_IAC.currentTime);
    //   that.data.isReadying = true;
    // }
    return;
  }
    

  setTimeout(function () {
    remainedTime--;
    console.log(remainedTime);
    that.setData({
      remainedTime: remainedTime
    })
    countDown(that, remainedTime);
  }, 1000);
}

  //自定义函数，规定sort的排序规则为降序排列
  function compareWithTime(Value1, Vaule2) {
    var flag = parseFloat(Value1.created_time) - parseFloat(Vaule2.created_time);
    if (flag < 0) {
      return 1;
    } else if (flag > 0) {
      return -1;
    } else {
      return 0;
    }
  }

  //转换时间为播放器格式
  function timeFormat(seconds){
    //console.log(seconds);

    var min_part = parseInt(seconds / 60);
    var second_part = seconds % 60 + 1;

    var min_str = "";
    var sec_str = "";

    if (min_part < 10)
      min_str += "0" + min_part;
    else
      min_str += min_part;

    if (second_part < 10)
      sec_str += "0";

    sec_str += second_part;

    //console.log(min_str + ":" + sec_str);

    return min_str + ":" + sec_str;
  }

  //转换字符串时间为数字秒
  function convertStrToTime(str){
    var Time=str.split(":");
    var analysisTime=0;
    parseFloat(Time[0])
    analysisTime = parseFloat(Time[0]) * 60 + parseFloat(Time[1]);
    return analysisTime;
  }



module.exports = {
  countDown: countDown,
  compareWithTime:compareWithTime,
  timeFormat:timeFormat,
  convertStrToTime: convertStrToTime,
}

