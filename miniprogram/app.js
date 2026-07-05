App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      wx.showToast({ title: '基础库版本过低，请升级微信开发者工具', icon: 'none' })
      return
    }
    try {
      wx.cloud.init({
        env: this.globalData.cloudEnv,
        traceUser: true
      })
    } catch (e) {
      console.error('云开发初始化失败：', e)
    }
  },
  globalData: {
    cloudEnv: '',
    userInfo: null,
    pendingBrewPrefill: null
  }
})
