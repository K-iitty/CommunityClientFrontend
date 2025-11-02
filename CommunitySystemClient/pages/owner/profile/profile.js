// pages/owner/profile/profile.js
const app = getApp()
const { ownerAPI } = require('../../../utils/api.js')
const { showLoading, hideLoading, showConfirm, showToast } = require('../../../utils/util.js')

Page({
  data: {
    userInfo: null,
    loading: true,
    menuItems: [
      {
        menuCode: 'H',
        title: '我的房屋',
        url: '/pages/owner/profile/house/house',
        icon: 'H',
        image: '/img/img-owner/fangzi3.png'
      },
      {
        menuCode: 'V',
        title: '我的车辆',
        url: '/pages/owner/profile/vehicle/vehicle',
        icon: 'V',
        image: '/img/img-owner/qiche.png'
      },
      {
        menuCode: 'P',
        title: '我的车位',
        url: '/pages/owner/profile/parking/parking',
        icon: '🅿️',
        image: '/img/img-owner/tingchewei.png'
      },
      {
        menuCode: 'M',
        title: '我的仪表',
        url: '/pages/owner/profile/meter/meter',
        icon: 'M',
        image: '/img/img-owner/yibiaopan.png'
      },
      {
        menuCode: 'B',
        title: '账单查询',
        url: '/pages/owner/profile/billing/billing',
        icon: 'B',
        image: '/img/img-owner/zhangdan.png'
      },
      {
        menuCode: 'C',
        title: '联系物业',
        url: '/pages/owner/profile/property-contact/property-contact',
        icon: 'C',
        image: '/img/img-owner/lianxi.png'
      }
    ]
  },

  onLoad() {
    this.loadUserInfo()
  },

  onShow() {
    // 设置TabBar
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3
      })
    }
    this.loadUserInfo()
  },

  onPullDownRefresh() {
    this.loadUserInfo()
  },

  async loadUserInfo() {
    try {
      showLoading()
      const res = await ownerAPI.getProfile()
      
      // 处理API响应结构
      if (res && res.success && res.data) {
        this.setData({
          userInfo: res.data,
          loading: false
        })
      } else {
        showToast('加载个人信息失败')
        this.setData({ loading: false })
      }
      hideLoading()
    } catch (err) {
      console.error('加载个人信息失败:', err)
      hideLoading()
      showToast('加载失败，请稍后重试')
      this.setData({ loading: false })
    } finally {
      wx.stopPullDownRefresh()
    }
  },

  // 导航到菜单项
  navigateToMenu(e) {
    const { url } = e.currentTarget.dataset
    console.log('=== 菜单导航 ===')
    console.log('点击的URL:', url)
    console.log('数据集:', e.currentTarget.dataset)
    
    if (url) {
      console.log('准备导航到:', url)
      wx.navigateTo({ 
        url: url,
        success() {
          console.log('导航成功')
        },
        fail(err) {
          console.error('导航失败:', err)
          // 尝试使用 switchTab 如果是 TabBar 页面
          wx.switchTab({
            url: url,
            fail(err2) {
              console.error('switchTab也失败:', err2)
            }
          })
        }
      })
    } else {
      console.warn('URL为空')
    }
  },

  // 编辑个人信息
  editProfile() {
    wx.navigateTo({
      url: '/pages/owner/profile/edit/edit'
    })
  },

  // 修改密码
  changePassword() {
    wx.navigateTo({
      url: '/pages/owner/profile/change-password/change-password'
    })
  },

  // 退出登录
  async handleLogout() {
    try {
      await showConfirm('确定要退出登录吗？')
      app.clearLoginInfo()
      wx.reLaunch({
        url: '/pages/login/login'
      })
    } catch (err) {
      // 用户取消
      console.log('取消退出')
    }
  }
})

