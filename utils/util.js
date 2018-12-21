

var app = getApp();
var timer = require('timer');
/*
 *根据客户端的时间信息得到发表评论的时间格式
 *多少分钟前，多少小时前，然后是昨天，然后再是月日
 * Para :
 * recordTime - {float} 时间戳
 * yearsFlag -{bool} 是否要年份
 */

function getDiffTime(recordTime, yearFlag) {

  if (recordTime) {
    recordTime = new Date(parseFloat(recordTime) * 1000);
    //recordTime.setMonth(recordTime.getMonth() - 1);
    var minute = 1000 * 60,
      hour = minute * 60,
      day = hour * 24,
      now = new Date(),
     diff = now - recordTime;
    var result = '';
    if (diff < 0)
      return result;

    var weekR = diff / (7 * day);
    var dayC = diff / day;
    var hourC = diff / hour;
    var minC = diff / minute;
    if (weekR > 1) {
      var formate = "MM-dd";
      if (yearFlag)
        formate = 'yyyy-MM-dd'
      return recordTime.format(formate);
      // var formate = "MM-dd hh:mm";
      // if (yearFlag)
      //   formate = 'yyyy-MM-dd hh:mm'
      // return recordTime.format(formate);
    }
    else if (dayC == 1 || (hourC < 24 && recordTime.getDate() != now.getDate())) {
      result = '昨天' + recordTime.format("hh:mm");
      return result;
    }
    else if (dayC > 1) {
      var formate = 'MM-dd';
      if (yearFlag) {
        formate = "yyyy-MM-dd"
      }
      // var formate = 'MM-dd hh:mm';
      // if (yearFlag) {
      //   formate = "yyyy-MM-dd hh:mm"
      // }
      return recordTime.format(formate);
    }

    else if (hourC >= 1) {
      result = "大约"+parseInt(hourC) + '小时前';
      return result;
    }
    else if (minC >= 1) {
      result = "大约" + parseInt(minC) + '分钟前';
      return result;
    }

    else {
      result = '刚刚';
      return result;
    }
    return '';
  }
}

/*
 *拓展Date方法。得到格式化的日期形式
 *date.format('yyyy-MM-dd')，date.format('yyyy/MM/dd'),date.format('yyyy.MM.dd')
 *date.format('dd.MM.yy'), date.format('yyyy.dd.MM'), date.format('yyyy-MM-dd HH:mm')
 *使用方法 如下：
 *                       var date = new Date();
 *                       var todayFormat = date.format('yyyy-MM-dd'); //结果为2015-2-3
 *Parameters:
 *format - {string} 目标格式 类似('yyyy-MM-dd')
 *Returns - {string} 格式化后的日期 2015-2-3
 *
 */
(function initTimeFormat() {
  Date.prototype.format = function (format) {
    var o = {
      "M+": this.getMonth() + 1, //month
      "d+": this.getDate(), //day
      "h+": this.getHours(), //hour
      "m+": this.getMinutes(), //minute
      "s+": this.getSeconds(), //second
      "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
      "S": this.getMilliseconds() //millisecond
    }
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
      (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o) if (new RegExp("(" + k + ")").test(format))
      format = format.replace(RegExp.$1,
        RegExp.$1.length == 1 ? o[k] :
          ("00" + o[k]).substr(("" + o[k]).length));
    return format;
  };
})()


//将返回的分数转换为五个元素的数组
function convertToStarsArray(score) {
  var stars_num = Math.ceil(score / 2);

  var array = [];

  for (var i = 0; i < 5; i++) {
    if (i < stars_num - 1)
      array[i] = 1;
    else if (i >= stars_num)
      array[i] = 0;
    else if (score / 2 < stars_num)
      array[i] = 0.5;
    else
      array[i] = 1;
  }

  return array;
}

/*servelet 是你的请求服务器接受的类型 如Getsongs也就是？前面的东西
**data 是你要请求的数据
**注意到post.js查看实际怎么调用
*/
const requestFromServer=(servelet, data)=> {

  return new Promise((Resolve, Reject) => {
    wx.request({
      url: app.globalData.server_base + "/" + servelet,
      data: data,
      header: {
        'content-type': 'application/json'
      },
      method: "GET",
      dataType: "json",
      success: function (res) {
        //console.log("request success");
        Resolve(res);
      },
      fail: function (errMsg) {
        //console.log("request failed");
        Reject(errMsg);
      }
    });
  });
}


function getSortedListByTime(list){
  list.sort(timer.compareWithTime);
  return list;
}


module.exports = {
  getDiffTime: getDiffTime,
  convertToStarsArray: convertToStarsArray,
  requestFromServer: requestFromServer,
  getSortedListByTime: getSortedListByTime
}

