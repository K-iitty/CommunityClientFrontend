// pages/property/profile/profile.js
// 员工资料管理 - 个人资料页面
const { staffAPI } = require('../../../utils/api.js')
const { showToast, showLoading, hideLoading } = require('../../../utils/util.js')

Page({
  data: {
    staff: null,
    loading: true,
    empty: false,
    menuItems: [
      { id: 'edit', label: '编辑个人信息' }
    //   { id: 'password', label: '修改密码', icon: '🔐' },
    //   { id: 'department', label: '我的部门', icon: '🏢' }
    ]
  },

  onLoad() {
    this.loadStaffProfile()
  },

  onShow() {
    // 每次页面显示时刷新数据
    this.loadStaffProfile()
  },

  // 加载员工资料
  async loadStaffProfile() {
    try {
      this.setData({ loading: true })
      showLoading('加载中...')

      const res = await staffAPI.getProfile()

      hideLoading()

      if (res && res.success && res.data) {
        // 直接使用 API 返回的完整数据
        const data = res.data
        // 处理图片字段，支持JSON数组或单个URL字符串
        data.idCardPhotos = this.parseImageField(data.idCardPhotos)
        data.certificatePhotos = this.parseImageField(data.certificatePhotos)
        this.setData({
          staff: data,
          loading: false,
          empty: false
        })
      } else {
        showToast('加载失败')
        this.setData({ empty: true, loading: false })
      }
    } catch (err) {
      hideLoading()
      console.error('加载资料失败:', err)
      showToast('加载失败')
      this.setData({ empty: true, loading: false })
    }
  },

  // 解析图片字段，支持单个URL字符串
  parseImageField(data) {
    if (!data) {
      return null
    }
    
    // 如果是数组，取第一个元素
    if (Array.isArray(data)) {
      return data[0] || null
    }
    
    // 如果是字符串，直接返回
    if (typeof data === 'string') {
      return data
    }
    
    return null
  },

  // 编辑个人信息
  goToEdit() {
    wx.navigateTo({
      url: '/pages/property/profile/edit/edit'
    })
  },

  // 修改密码
//   goToChangePassword() {
//     wx.navigateTo({
//       url: '/pages/property/profile/change-password/change-password'
//     })
//   },

  // 查看部门信息
//   goToDepartment() {
//     wx.navigateTo({
//       url: '/pages/property/department/department'
//     })
//   },

  // 菜单项点击
  handleMenuClick(e) {
    const { id } = e.currentTarget.dataset
    
    switch (id) {
      case 'edit':
        this.goToEdit()
        break
    //   case 'password':
    //     this.goToChangePassword()
    //     break
    //   case 'department':
    //     this.goToDepartment()
    //     break
      default:
        break
    }
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '确认退出登录',
      content: '确定要退出登录吗？',
      confirmText: '退出',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.logout()
        }
      }
    })
  },

  // 执行退出登录
  async logout() {
    try {
      showLoading('退出中...')
      const result = await staffAPI.logout()
      hideLoading()
      
      if (result.success) {
        wx.showToast({
          title: '已退出登录',
          icon: 'success',
          duration: 1500
        })
        
        setTimeout(() => {
          wx.reLaunch({
            url: '/pages/login/login'
          })
        }, 1500)
      } else {
        showToast(result.message || '退出登录失败')
      }
    } catch (err) {
      hideLoading()
      console.error('退出登录失败:', err)
      showToast('退出登录失败')
    }
  },

  // 获取职位颜色
  getPositionColor(position) {
    const colorMap = {
      'manager': '#7c3aed',
      'supervisor': '#0ea5e9',
      'staff': '#10b981',
      'admin': '#ef4444',
      '经理': '#7c3aed',
      '主管': '#0ea5e9',
      '秩序员': '#10b981',
      '管理员': '#ef4444'
    }
    return colorMap[position] || '#6b7280'
  },

  // 图片预览
  previewImage(e) {
    const { url, type } = e.currentTarget.dataset
    
    if (!url) {
      console.warn('图片URL为空')
      return
    }

    console.log('预览图片:', { url, type })
    
    wx.previewImage({
      urls: [url],  // 直接包装为数组
      current: url
    })
  }
})