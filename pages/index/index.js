const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}
const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}
// NFVBZ-Z6UCV-B26PK-UYZAQ-5GBHT-3TBL2
const QQMapWX = require('../../libs/qqmap-wx-jssdk.js')

const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nowTemp:'',
    nowWeather:'',
    nowWeatherBackground:'',
    hourlyWeather:[],
    todayDate:'',
    todayTemp:'',
    city:'广州市',
    locationAuthType: UNPROMPTED
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.qqmapsdk = new QQMapWX({
      key:'NFVBZ-Z6UCV-B26PK-UYZAQ-5GBHT-3TBL2'
    })
    wx.getSetting({
      success: res => {
        let auth = res.authSetting['scope.userLocation']
        let locationAuthType = auth ? AUTHORIZED
          : (auth === false) ? UNAUTHORIZED : UNPROMPTED
        
        this.setData({
          locationAuthType: locationAuthType,
        })

        if (auth)
          this.getCityAndWeather()
        else
          this.getNow() //使用默认城市广州
      },
      fail: () => {
        this.getNow() //使用默认城市广州
      }
    })
  },
  // onShow(){
  //   // wx.showToast({
  //   //   title: '?',
  //   // })
  //   wx.getSetting({
  //     success: res=> {
  //       let auth = res.authSetting['scope.userLocation']
  //       if (auth && this.data.locationAuthType != AUTHORIZED) {
  //         //权限从无到有
  //         this.setData({
  //           locationAuthType: AUTHORIZED,
  //           locationTipsText: AUTHORIZED_TIPS
  //         })
  //         this.getLocation()
  //       }
  //       //权限从有到无未处理
  //     }
  //   })
  // },
  onPullDownRefresh() {
    this.getNow(() => {
      wx.stopPullDownRefresh()
    })
  },
  getNow(callback){
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data:{
        city:this.data.city
      },
      success:res => {
        let result = res.data.result
        // console.log(result)
        this.setNow(result)
        this.setHourlyWeather(result)
        this.setToday(result)
      },
      complete:() =>{
        callback&&callback()
      }
    })
  },
  setNow(result){
    let temp = result.now.temp
    let weather = result.now.weather
    this.setData({
      nowTemp:temp + '°',
      nowWeather: weatherMap[weather],
      nowWeatherBackground:`/images/${weather}-bg.png`
    })
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather],
    })
  },
  setHourlyWeather(result){
    let forecast = result.forecast
    let hourlyWeather = []
    let nowHour = new Date().getHours()
    for(let i = 0;i < forecast.length;i++){
        hourlyWeather.push({
          temp: forecast[i].temp + '°',
          time:(i*3 + nowHour)%24 + '时',
          iconPath: `/images/${forecast[i].weather}-icon.png`
        })
    }
    hourlyWeather[0].time = '现在'
    this.setData({
      hourlyWeather
    })
  },
  setToday(result){
    let date = new Date()
    // console.log(date)
    this.setData({
      todayTemp: `${result.today.minTemp}°-${result.today.maxTemp}°`,
      todayDate: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 今天`
    })
  },
  onTapDayWeather() {
    wx.navigateTo({
      url: '/pages/list/list?city='+this.data.city,
    })
  },
  onTapLocation(){
    if (this.data.locationAuthType === UNAUTHORIZED)
      wx.openSetting({
        success:res=>{
          let auth = res.authSetting['scope.userLocation']
          if(auth){
            this.getCityAndWeather()
          }
        }
      })
    else
      this.getCityAndWeather()
  },
  getCityAndWeather() {
    wx.getLocation({
      success: res => {
        this.setData({
          locationAuthType: AUTHORIZED,
        })
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res => {
            let city = res.result.address_component.city
            // console.log('city')
            this.setData({
              city
            })
            this.getNow()
          },
          fail: () => {
            console.log('fail')
            // console.log(res.latitude, res.longitude)
          }
        })
        // console.log(res.latitude, res.longitude)
      },
      fail:()=>{
        this.setData({
          locationAuthType: UNAUTHORIZED,
         
        })
      }
    })
  }
})