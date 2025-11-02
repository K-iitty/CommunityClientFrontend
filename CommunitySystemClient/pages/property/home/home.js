// pages/property/home/home.js
const { staffAPI } = require('../../../utils/api.js')
const { showLoading, hideLoading, showToast } = require('../../../utils/util.js')

Page({
  data: {
    userInfo: {},
    issueStatistics: {
      totalIssues: 0,
      pendingIssues: 0,
      processingIssues: 0,
      completedIssues: 0
    },
    notices: [],
    recentIssues: [],
    quickActions: [
      { text: '反馈处理', icon: 'feedback', iconImage: 'yijianfankui.png', url: '/pages/property/feedback/list/list', badge: 0 },
      { text: '仪表管理', icon: 'meter', iconImage: 'yibiaopan.png', url: '/pages/property/meter/owner-list/owner-list' },
      { text: '车辆管理', icon: 'vehicle', iconImage: 'cheliangS.png', url: '/pages/property/vehicle/vehicle-list/vehicle-list' },
      { text: '房屋管理', icon: 'house', iconImage: 'fangwu.png', url: '/pages/property/house/house-list/house-list' },
      { text: '公告管理', icon: 'notice', iconImage: 'gonggao.png', url: '/pages/property/notice/list/list' },
      { text: '部门信息', icon: 'department', iconImage: 'bumenguanli.png', url: '/pages/property/department/department' }
    ],
    loading: false,
    empty: false
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  onPullDownRefresh() {
    this.loadData()
  },

  async loadData() {
    try {
      showLoading('加载中...')
      this.setData({ loading: true })

      // 并发加载所有数据
      const [profileRes, recentIssuesRes, statisticsRes, noticesRes] = await Promise.all([
        staffAPI.getProfile(),
        staffAPI.getAllIssues(1, 5, null),  // 获取最近5条反馈用于展示
        staffAPI.getIssueStatistics(),      // 获取统计数据
        staffAPI.listNotices(1, 5)
      ])

      // 处理个人信息
      if (profileRes && profileRes.success && profileRes.data) {
        this.setData({
          userInfo: profileRes.data
        })
      }

      // 处理最近反馈问题
      if (recentIssuesRes && recentIssuesRes.success && recentIssuesRes.data) {
        const issues = recentIssuesRes.data.items || []
        const actions = this.data.quickActions
        
        // 从统计接口获取各状态的数量
        let statistics = {
          totalIssues: 0,
          pendingIssues: 0,
          processingIssues: 0,
          completedIssues: 0
        }
        
        // 处理统计结果
        if (statisticsRes && statisticsRes.success && statisticsRes.data) {
          statistics.totalIssues = statisticsRes.data.totalIssues || 0
          statistics.pendingIssues = statisticsRes.data.pendingIssues || 0
          statistics.processingIssues = statisticsRes.data.processingIssues || 0
          statistics.completedIssues = statisticsRes.data.completedIssues || 0
        }
        
        if (actions[0]) {
          actions[0].badge = statistics.pendingIssues
        }
        
        this.setData({
          recentIssues: issues,
          issueStatistics: statistics,
          quickActions: actions
        })
      }

      // 处理公告
      if (noticesRes && noticesRes.success && noticesRes.data) {
        const notices = noticesRes.data.items || []
        this.setData({
          notices: notices.map(notice => ({
            id: notice.id,
            title: notice.title,
            noticeType: notice.noticeType,
            publishTime: notice.publishTime,
            content: notice.content,
            isTop: false
          }))
        })
      }

      hideLoading()
    } catch (err) {
      console.error('加载首页数据失败:', err)
      hideLoading()
      showToast('加载失败，请稍后重试')
    } finally {
      this.setData({ loading: false })
      wx.stopPullDownRefresh()
    }
  },

  // 查看待处理反馈
  viewIssues(e) {
    wx.navigateTo({
      url: '/pages/property/feedback/list/list?status=待处理'
    })
  },

  // 快捷功能导航
  navigateToAction(e) {
    const { url } = e.currentTarget.dataset
    if (url) {
      wx.navigateTo({ url })
    }
  },

  // 头像点击 - 显示个人信息菜单
  onAvatarTap() {
    wx.showActionSheet({
      itemList: ['查看个人信息'],
      success: (res) => {
        switch(res.tapIndex) {
          case 0:
            // 查看个人信息
            wx.navigateTo({
              url: '/pages/property/profile/profile'
            })
            break
        }
      }
    })
  },

  // 查看所有公告
  viewMoreNotices() {
    wx.navigateTo({
      url: '/pages/property/notice/list/list'
    })
  },

  // 查看反馈详情
  viewIssueDetail(e) {
    const { issueId } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/property/feedback/detail/detail?id=${issueId}`
    })
  }
})
