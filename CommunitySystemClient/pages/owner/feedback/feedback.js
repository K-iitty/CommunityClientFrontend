// pages/owner/feedback/feedback.js
const { ownerAPI } = require('../../../utils/api.js')
const { showToast, showLoading, hideLoading } = require('../../../utils/util.js')

Page({
  data: {
    issues: [],
    filteredIssues: [],
    searchKeyword: '',
    statusFilter: '',
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    total: 0,
    
    statusOptions: [
      { label: '全部', value: '' },
      { label: '待处理', value: '待处理' },
      { label: '处理中', value: '处理中' },
      { label: '已完成', value: '已完成' },
      { label: '已关闭', value: '已关闭' }
    ],
    
    statusCounts: {
      all: 0,
      pending: 0,
      processing: 0,
      completed: 0,
      closed: 0
    },
    
    urgencyClassMap: {
      '低': 'low',
      '中': 'medium',
      '高': 'high',
      '紧急': 'critical'
    }
  },

  onLoad() {
    this.loadIssues()
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      issues: [],
      filteredIssues: [],
      searchKeyword: '',
      statusFilter: ''
    })
    this.loadIssues()
  },

  async loadIssues() {
    if (this.data.loading || !this.data.hasMore) return

    try {
      this.setData({ loading: true })

      console.log('=== 加载反馈列表 ===')
      console.log('page:', this.data.page)
      console.log('size:', this.data.pageSize)
      console.log('statusFilter:', this.data.statusFilter)
      
      const res = await ownerAPI.getMyIssues(this.data.page, this.data.pageSize, this.data.statusFilter)
      
      console.log('API 响应:', res)
      console.log('响应成功:', res && res.success)
      if (res && res.data) {
        console.log('响应数据总数:', res.data.total)
        console.log('响应数据项数:', res.data.items ? res.data.items.length : 0)
      }
      
      // 处理API响应结构
      if (res && res.success && res.data) {
        const issues = res.data.items || []
        const total = res.data.total || 0

        // 为问题添加urgencyClass属性 - 使用后端返回的字段名
        issues.forEach(issue => {
          issue.urgencyClass = this.data.urgencyClassMap[issue.urgencyLevel] || 'medium'
        })

        if (this.data.page === 1) {
          this.setData({ 
            issues: issues,
            filteredIssues: issues
          })
          
          // 如果是首页且没有状态过滤，加载全部数据用于统计
          if (!this.data.statusFilter) {
            this.loadAllIssuesForCounts()
          } else {
            this.calculateStatusCounts(issues)
          }
        } else {
          this.setData({
            issues: [...this.data.issues, ...issues],
            filteredIssues: [...this.data.filteredIssues, ...issues]
          })
        }

        this.setData({
          total: total,
          hasMore: (this.data.page * this.data.pageSize) < total,
          page: this.data.page + 1
        })
      } else {
        console.warn('API 响应异常:', res)
        showToast('加载失败，请稍后重试')
      }
    } catch (err) {
      console.error('加载问题反馈失败:', err)
      showToast('加载失败，请稍后重试')
    } finally {
      this.setData({ loading: false })
      wx.stopPullDownRefresh()
    }
  },

  // 加载所有反馈用于统计各状态数字
  async loadAllIssuesForCounts() {
    try {
      // 分别查询各状态的数量
      const [allRes, pendingRes, processingRes, completedRes, closedRes] = await Promise.all([
        ownerAPI.getMyIssues(1, 1, ''),  // 全部
        ownerAPI.getMyIssues(1, 1, '待处理'),  // 待处理
        ownerAPI.getMyIssues(1, 1, '处理中'),  // 处理中
        ownerAPI.getMyIssues(1, 1, '已完成'),  // 已完成
        ownerAPI.getMyIssues(1, 1, '已关闭')   // 已关闭
      ])

      const counts = {
        all: (allRes && allRes.data && allRes.data.total) || 0,
        pending: (pendingRes && pendingRes.data && pendingRes.data.total) || 0,
        processing: (processingRes && processingRes.data && processingRes.data.total) || 0,
        completed: (completedRes && completedRes.data && completedRes.data.total) || 0,
        closed: (closedRes && closedRes.data && closedRes.data.total) || 0
      }

      this.setData({ statusCounts: counts })
    } catch (err) {
      console.error('加载统计数据失败:', err)
      // 如果失败，使用本地计算的结果
      const currentIssues = this.data.issues || []
      this.calculateStatusCounts(currentIssues)
    }
  },

  calculateStatusCounts(issues) {
    const counts = {
      all: issues.length,
      pending: 0,
      processing: 0,
      completed: 0,
      closed: 0
    }

    issues.forEach(issue => {
      const status = issue.issueStatus || issue.status
      if (status === '待处理' || status === 'pending') counts.pending++
      else if (status === '处理中' || status === 'processing') counts.processing++
      else if (status === '已完成' || status === 'completed') counts.completed++
      else if (status === '已关闭' || status === 'closed') counts.closed++
    })

    this.setData({ statusCounts: counts })
  },

  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
  },

  handleSearch() {
    this.filterIssues()
  },

  clearSearch() {
    this.setData({
      searchKeyword: ''
    })
    this.filterIssues()
  },

  setStatusFilter(e) {
    const status = e.currentTarget.dataset.status
    console.log('=== 设置状态过滤 ===')
    console.log('点击的状态值:', status)
    console.log('状态长度:', status ? status.length : 0)
    console.log('===== 结束 =====')
    this.setData({
      statusFilter: status,
      page: 1,
      issues: [],
      filteredIssues: [],
      total: 0,
      hasMore: true
    })
    this.loadIssues()
  },

  filterIssues() {
    const { issues, searchKeyword } = this.data

    let filtered = issues

    // 按关键词搜索
    if (searchKeyword) {
      filtered = filtered.filter(issue => {
        const keyword = searchKeyword.toLowerCase()
        const title = (issue.issueTitle || issue.title || '').toLowerCase()
        const content = (issue.issueContent || issue.description || '').toLowerCase()
        const location = (issue.specificLocation || issue.location || '').toLowerCase()
        
        return (
          title.includes(keyword) ||
          content.includes(keyword) ||
          location.includes(keyword)
        )
      })
    }

    this.setData({
      filteredIssues: filtered
    })
  },

  loadMore() {
    if (this.data.searchKeyword) {
      return
    }
    this.loadIssues()
  },

  viewDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/owner/feedback/detail/detail?id=${id}`
    })
  },

  // 提交问题反馈
  submitFeedback() {
    wx.navigateTo({
      url: '/pages/owner/feedback/submit/submit'
    })
  }
})

