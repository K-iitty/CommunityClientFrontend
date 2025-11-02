// pages/owner/home/home.js
const app = getApp()
const { ownerAPI } = require('../../../utils/api.js')
const { showLoading, hideLoading, showToast } = require('../../../utils/util.js')

Page({
  data: {
    userInfo: {},
    notices: [],
    houseCards: [],
    statistics: {
      totalHouses: 0,
      totalVehicles: 0,
      totalParkingSpaces: 0,
      unpaidBills: 0
    },
    loading: false,
    empty: false,
    // 轮播图数据
    carouselImages: [
      '/img/微信图片_20251028133231_86_25.jpg',
      '/img/微信图片_20251028133235_87_25.jpg',
      '/img/微信图片_20251028133240_88_25.jpg',
      '/img/微信图片_20251028133246_89_25.jpg'
    ]
  },

  onLoad() {
    this.loadData()
  },

  onPullDownRefresh() {
    this.loadData().then(() => {
      wx.stopPullDownRefresh()
    }).catch(() => {
      wx.stopPullDownRefresh()
    })
  },

  async loadData() {
    try {
      this.setData({ loading: true })
      
      // 并发加载所有数据
      const [profileRes, noticesRes, houseRes] = await Promise.all([
        ownerAPI.getProfile(),
        // 改为使用 filterNoticesByType，传入空的 noticeType 表示"全部"
        // 这样首页显示的就是公告列表"全部"选项中的前2-3条
        ownerAPI.filterNoticesByType({
          noticeType: '',  // 空字符串表示"全部"
          page: 1,
          size: 3  // 只取3条
        }),
        ownerAPI.getHouseCards()
      ])

      console.log('==== 首页数据加载 ====')
      console.log('Profile响应:', profileRes)
      console.log('Notice响应:', noticesRes)
      console.log('House响应:', houseRes)
      
      // 处理API响应结构：{ success: true/false, data: {...}, message: '...' }
      const notices = (noticesRes && noticesRes.success && noticesRes.data && noticesRes.data.items) || []
      console.log('提取的公告数据:', notices)
      console.log('公告数量:', notices.length)
      
      // 格式化公告时间
      const formattedNotices = notices.map(notice => ({
        ...notice,
        publishDate: this.formatTime(notice.publishTime)
      }))
      console.log('格式化后的公告:', formattedNotices)
      
      // 处理房屋卡片数据
      let houseCards = []
      if (houseRes && houseRes.success && houseRes.data) {
        // 后端返回分页结构：{ page, size, total, pages, items }
        if (houseRes.data.items && Array.isArray(houseRes.data.items)) {
          houseCards = houseRes.data.items.map(item => ({
            id: item.id,
            roomNo: item.roomNo,
            fullRoomNo: item.fullRoomNo || item.roomNo,
            houseType: item.houseType,
            houseStatus: item.houseStatus,
            buildingNo: item.buildingNo,
            buildingName: item.buildingName,
            communityName: item.communityName,
            communityId: item.communityId,
            buildingId: item.buildingId
          }))
          console.log('✅ 提取的房屋卡片数据:', houseCards)
          console.log('✅ 房屋卡片数量:', houseCards.length)
        }
      } else {
        console.warn('⚠️ houseRes失败:', houseRes)
      }
      
      this.setData({
        userInfo: (profileRes && profileRes.success && profileRes.data) || {},
        notices: formattedNotices,
        houseCards: houseCards,
        empty: !profileRes || !profileRes.success
      })
      console.log('==== 页面数据已更新 ====')
    } catch (err) {
      console.error('加载首页失败:', err)
      this.setData({ empty: true })
      showToast('加载首页失败，请稍后重试')
    } finally {
      this.setData({ loading: false })
    }
  },

  navigateToNotice() {
    wx.switchTab({
      url: '/pages/owner/notice/notice',
      fail: (err) => {
        console.error('导航到通知失败:', err)
        wx.showToast({
          title: '页面加载失败',
          icon: 'none'
        })
      }
    })
  },

  navigateToFeedback() {
    wx.switchTab({
      url: '/pages/owner/feedback/feedback',
      fail: (err) => {
        console.error('导航到反馈失败:', err)
        wx.showToast({
          title: '页面加载失败',
          icon: 'none'
        })
      }
    })
  },

  navigateToProfile() {
    wx.switchTab({
      url: '/pages/owner/profile/profile',
      fail: (err) => {
        console.error('导航到个人失败:', err)
        wx.showToast({
          title: '页面加载失败',
          icon: 'none'
        })
      }
    })
  },

  viewNoticeDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/owner/notice/detail/detail?id=${id}`,
      fail: (err) => {
        console.error('导航到公告详情失败:', err)
        wx.showToast({
          title: '页面加载失败',
          icon: 'none'
        })
      }
    })
  },

  // 格式化时间显示
  formatTime(dateTimeString) {
    if (!dateTimeString) return ''
    
    try {
      const date = new Date(dateTimeString)
      const now = new Date()
      const diff = Math.floor((now - date) / 1000) // 差值（秒）
      
      // 今天
      if (this.isSameDay(date, now)) {
        if (diff < 60) return '刚刚'
        if (diff < 3600) return Math.floor(diff / 60) + '分钟前'
        if (diff < 86400) return Math.floor(diff / 3600) + '小时前'
      }
      
      // 昨天
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      if (this.isSameDay(date, yesterday)) {
        return '昨天'
      }
      
      // 今年内的其他日期
      if (date.getFullYear() === now.getFullYear()) {
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        return month + '-' + day
      }
      
      // 其他年份
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      return year + '-' + month + '-' + day
    } catch (e) {
      console.error('时间格式化错误:', e)
      return dateTimeString
    }
  },

  // 判断是否是同一天
  isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate()
  },

  // 查看房屋详情
  viewHouseDetail(e) {
    console.log('🏠 房屋卡片被点击了')
    console.log('e:', e)
    console.log('detail:', e.detail)
    console.log('currentTarget:', e.currentTarget)
    console.log('currentTarget.dataset:', e.currentTarget.dataset)
    
    const houseId = e.currentTarget.dataset.houseId
    console.log('📌 房屋ID:', houseId)
    
    if (!houseId) {
      console.error('❌ 房屋ID为空，无法跳转')
      return
    }
    
    console.log('✅ 跳转到房屋详情页，ID:', houseId)
    wx.navigateTo({
      url: `/pages/owner/profile/house/detail/detail?id=${houseId}`,
      success(res) {
        console.log('✅ 页面跳转成功')
      },
      fail(err) {
        console.error('❌ 页面跳转失败:', err)
        showToast('页面加载失败')
      }
    })
  },

  // 查看我的房屋
  viewMyHouses() {
    wx.navigateTo({
      url: '/pages/owner/profile/house/house',
      fail: (err) => {
        console.error('导航到房屋失败:', err)
        wx.showToast({
          title: '页面加载失败',
          icon: 'none'
        })
      }
    })
  },

  // 查看我的车辆
  viewMyVehicles() {
    wx.navigateTo({
      url: '/pages/owner/profile/vehicle/vehicle',
      fail: (err) => {
        console.error('导航到车辆失败:', err)
        wx.showToast({
          title: '页面加载失败',
          icon: 'none'
        })
      }
    })
  },

  // 查看我的车位
  viewMyParkingSpaces() {
    wx.navigateTo({
      url: '/pages/owner/profile/parking/parking',
      fail: (err) => {
        console.error('导航到车位失败:', err)
        wx.showToast({
          title: '页面加载失败',
          icon: 'none'
        })
      }
    })
  },

  // 查看缴费
  viewBilling() {
    wx.navigateTo({
      url: '/pages/owner/profile/billing/billing',
      fail: (err) => {
        console.error('导航到缴费失败:', err)
        wx.showToast({
          title: '页面加载失败',
          icon: 'none'
        })
      }
    })
  }
})

