// pages/login/login.js
const app = getApp()
const { ownerAPI, staffAPI } = require('../../utils/api.js')
const { showLoading, hideLoading, showToast } = require('../../utils/util.js')

Page({
  data: {
    roleType: 'owner', // owner: 业主, staff: 物业
    username: '',
    password: '',
    showPassword: false
  },

  onLoad() {
    // 如果已登录，跳转到对应首页
    if (app.globalData.hasLogin) {
      this.navigateToHome()
    }
  },

  // 切换角色
  switchRole(e) {
    this.setData({
      roleType: e.currentTarget.dataset.role,
      username: '',
      password: ''
    })
  },

  // 输入用户名
  onUsernameInput(e) {
    this.setData({
      username: e.detail.value
    })
  },

  // 输入密码
  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    })
  },

  // 切换密码显示
  togglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    })
  },

  // 登录
  async handleLogin() {
    const { roleType, username, password } = this.data

    // 表单验证
    if (!username) {
      showToast('请输入用户名')
      return
    }
    if (!password) {
      showToast('请输入密码')
      return
    }

    try {
      showLoading('登录中...')
      
      let res
      if (roleType === 'owner') {
        res = await ownerAPI.login({ username, password })
      } else {
        res = await staffAPI.login({ username, password, loginIp: '' })
      }

      hideLoading()

      if (res.token) {
        // 保存登录信息
        app.saveLoginInfo(res.token, res.role || roleType, { username })
        
        showToast('登录成功', 'success')
        
        // 延迟跳转
        setTimeout(() => {
          this.navigateToHome()
        }, 1000)
      } else {
        showToast(res.message || '登录失败')
      }
    } catch (err) {
      hideLoading()
      showToast(err.message || '登录失败')
    }
  },

  // 跳转到首页
  navigateToHome() {
    const role = app.getRole()
    const url = role === 'owner' || role === 'staff' 
      ? (role === 'owner' ? '/pages/owner/home/home' : '/pages/property/home/home')
      : '/pages/owner/home/home'
    
    wx.reLaunch({ url })
  },

  // 忘记密码
  handleForgotPassword() {
    if (this.data.roleType === 'owner') {
      wx.navigateTo({
        url: '/pages/owner/forgot-password/forgot-password'
      })
    } else {
      showToast('请联系管理员重置密码')
    }
  },

  // 注册（仅业主端）
  handleRegister() {
    if (this.data.roleType === 'owner') {
      wx.navigateTo({
        url: '/pages/owner/register/register'
      })
    }
  }
})

