// app.js
App({
  onLaunch() {
    // 初始化云开发环境
    console.log('小程序启动')
    
    // 检查登录状态
    this.checkLogin()
  },

  // 全局数据
  globalData: {
    userInfo: null,
    token: null,
    role: null, // 'owner' 或 'staff'
    baseUrl: 'http://localhost:8080', // 默认baseUrl，会根据角色自动切换
    hasLogin: false
  },

  // 根据角色设置baseUrl
  setBaseUrlByRole(role) {
    if (role === 'owner') {
      this.globalData.baseUrl = 'http://localhost:8081'
    } else if (role === 'staff') {
      this.globalData.baseUrl = 'http://localhost:8082'
    } else {
      this.globalData.baseUrl = 'http://localhost:8080'
    }
  },

  // 检查登录状态
  checkLogin() {
    const token = wx.getStorageSync('token')
    const role = wx.getStorageSync('role')
    const userInfo = wx.getStorageSync('userInfo')

    if (token && role) {
      this.globalData.token = token
      this.globalData.role = role
      this.globalData.userInfo = userInfo
      this.globalData.hasLogin = true
      // 设置对应角色的baseUrl
      this.setBaseUrlByRole(role)
    }
  },

  // 保存登录信息
  saveLoginInfo(token, role, userInfo) {
    this.globalData.token = token
    this.globalData.role = role
    this.globalData.userInfo = userInfo
    this.globalData.hasLogin = true

    // 根据角色设置baseUrl
    this.setBaseUrlByRole(role)

    wx.setStorageSync('token', token)
    wx.setStorageSync('role', role)
    wx.setStorageSync('userInfo', userInfo)
  },

  // 清除登录信息
  clearLoginInfo() {
    this.globalData.token = null
    this.globalData.role = null
    this.globalData.userInfo = null
    this.globalData.hasLogin = false

    wx.removeStorageSync('token')
    wx.removeStorageSync('role')
    wx.removeStorageSync('userInfo')
  },

  // 获取Token
  getToken() {
    return this.globalData.token || wx.getStorageSync('token')
  },

  // 获取角色
  getRole() {
    return this.globalData.role || wx.getStorageSync('role')
  }
})
