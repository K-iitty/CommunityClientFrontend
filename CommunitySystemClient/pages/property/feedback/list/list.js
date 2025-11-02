// pages/property/feedback/list/list.js
const { staffAPI } = require('../../../../utils/api.js')
const { showLoading, hideLoading, showToast } = require('../../../../utils/util.js')

Page({
  data: {
    issues: [],
    filteredIssues: [],
    loading: false,
    page: 1,
    pageSize: 10,
    total: 0,
    hasMore: true,
    statusFilter: '', // '', '待处理', '处理中', '已完成'
    searchKeyword: '',
    statusClassMap: {
      '待处理': 'status-pending',
      '处理中': 'status-processing',
      '已完成': 'status-completed'
    },
    urgencyClassMap: {
      '低': 'low',
      '中': 'medium',
      '高': 'high'
    }
  },

  onLoad(options) {
    // 从首页统计卡片传递的状态参数
    if (options.status) {
      this.setData({ statusFilter: options.status })
    }
    this.loadIssues()
  },

  onShow() {
    // 每次页面显示时刷新数据
    if (this.data.issues.length > 0) {
      this.setData({ 
        page: 1, 
        issues: [], 
        filteredIssues: [],
        hasMore: true 
      })
      this.loadIssues()
    }
  },

  onPullDownRefresh() {
    this.setData({ 
      page: 1, 
      issues: [], 
      filteredIssues: [],
      hasMore: true
    })
    this.loadIssues()
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadIssues()
    }
  },

  async loadIssues() {
    if (this.data.loading || !this.data.hasMore) return
    
    try {
      this.setData({ loading: true })
      const res = await staffAPI.getAllIssues(
        this.data.page, 
        this.data.pageSize, 
        this.data.statusFilter
      )
      
      if (res && res.success && res.data) {
        const issues = res.data.items || []
        
        // 格式化数据
        issues.forEach(issue => {
          issue.urgencyClass = this.data.urgencyClassMap[issue.urgencyLevel] || 'medium'
          issue.statusClass = this.data.statusClassMap[issue.issueStatus] || ''
          // 格式化时间为相对时间
          issue.timeAgo = this.getTimeAgo(issue.reportedTime)
        })
        
        if (this.data.page === 1) {
          this.setData({ 
            issues: issues,
            filteredIssues: issues,
            total: res.data.total || 0
          })
        } else {
          this.setData({
            issues: [...this.data.issues, ...issues],
            filteredIssues: [...this.data.filteredIssues, ...issues]
          })
        }
        
        this.setData({
          hasMore: (this.data.page * this.data.pageSize) < (res.data.total || 0),
          page: this.data.page + 1
        })
      } else {
        showToast(res?.message || '加载失败')
      }
    } catch (err) {
      console.error('加载反馈失败:', err)
      showToast('加载失败，请稍后重试')
    } finally {
      this.setData({ loading: false })
      wx.stopPullDownRefresh()
    }
  },

  // 获取相对时间
  getTimeAgo(time) {
    if (!time) return ''
    const date = new Date(time)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)
    
    if (diff < 60) return '刚刚'
    if (diff < 3600) return Math.floor(diff / 60) + '分钟前'
    if (diff < 86400) return Math.floor(diff / 3600) + '小时前'
    if (diff < 604800) return Math.floor(diff / 86400) + '天前'
    
    return date.toLocaleDateString()
  },

  // 状态过滤
  onStatusFilter(e) {
    const status = e.currentTarget.dataset.status
    this.setData({
      statusFilter: status,
      page: 1,
      issues: [],
      filteredIssues: [],
      hasMore: true
    })
    this.loadIssues()
  },

  // 搜索
  onSearch(e) {
    const keyword = e.detail.value.toLowerCase()
    const filtered = this.data.issues.filter(issue => 
      issue.issueTitle.toLowerCase().includes(keyword) ||
      (issue.issueContent && issue.issueContent.toLowerCase().includes(keyword)) ||
      (issue.contactName && issue.contactName.toLowerCase().includes(keyword))
    )
    this.setData({ 
      filteredIssues: filtered, 
      searchKeyword: keyword 
    })
  },

  // 查看详情
  onViewDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/property/feedback/detail/detail?id=${id}`
    })
  }
})