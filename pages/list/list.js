// pages/list/list.js
const dayMap = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
Page({

  /**
   * 页面的初始数据
   */
  data: {
    weekWeather:[],
    city:'广州市'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options.city)
    this.setData({
      city:options.city
    })
    this.getWeekWeather()
  },
  onPullDownRefresh() {
    this.getWeekWeather(() => {
      wx.stopPullDownRefresh()
    })
  },
  getWeekWeather(callback){
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/future',
      data:{
        time: new Date().getTime(),
        city: this.data.city
      },
      success: res =>{
        let result = res.data.result
        // console.log(result)
        this.setWeekWeather(result)
      },
      complete: () =>{
        callback&&callback()
      }
    })
  },
  setWeekWeather(result){
    let weekWeather = []
    // let date = new Date()
    // // console.log(date)
    // for(let i = 0;i < result.length;i++){
    //   weekWeather.push({
    //     day:dayMap[(date.getDay()+i)%7],
    //     date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()+i}`,
    //     temp: `${result[i].minTemp}° - ${result[i].maxTemp}°`,
    //     iconPath: '/images/' + result[i].weather + '-icon.png'
    //   })
    // }
    for (let i = 0; i < 7; i++) {
      let date = new Date()
      date.setDate(date.getDate() + i)
      weekWeather.push({
        day: dayMap[date.getDay()],
        date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
        temp: `${result[i].minTemp}° - ${result[i].maxTemp}°`,
        iconPath: '/images/' + result[i].weather + '-icon.png'
      })
    }
    weekWeather[0].day = '今天'
    this.setData({
      weekWeather
    })
  }
})