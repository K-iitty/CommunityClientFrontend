// pages/owner/notice/notice.js
const { ownerAPI } = require('../../../utils/api.js')
const { showToast } = require('../../../utils/util.js')

Page({
  data: {
    notices: [],
    searchKeyword: '',
    activeFilter: '',
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    allNotices: [], // 存储所有公告用于搜索
    filterOptions: [],  // 从后端动态获取的分类列表
    filterLoading: true  // 分类加载状态
  },

  onLoad() {
    this.loadCategories()  // 先加载分类列表
    this.loadNotices()
  },

  onShow() {
    // 设置TabBar
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      notices: [],
      searchKeyword: '',
      activeFilter: ''
    })
    this.loadNotices()
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMore()
    }
  },

  // 加载公告分类列表
  async loadCategories() {
    try {
      const res = await ownerAPI.getNoticeCategories()
      if (res && res.success && res.data) {
        // 将分类转换为对象格式供模板使用
        const filterOptions = {}
        res.data.forEach(item => {
          filterOptions[item.value] = item.label
        })
        this.setData({ 
          filterOptions: res.data,
          filterLoading: false
        })
      } else {
        console.error('获取分类失败')
        this.setData({ filterLoading: false })
      }
    } catch (err) {
      console.error('加载分类失败:', err)
      // 使用默认分类作为备选
      const defaultCategories = [
        { value: '', label: '全部' },
        { value: '社区公告', label: '社区公告' },
        { value: '活动公告', label: '活动公告' },
        { value: '紧急通知', label: '紧急通知' },
        { value: '温馨提示', label: '温馨提示' }
      ]
      this.setData({ 
        filterOptions: defaultCategories,
        filterLoading: false
      })
    }
  },

  async loadNotices() {
    if (this.data.loading || !this.data.hasMore) return

    try {
      this.setData({ loading: true })

      // 统一使用筛选接口（"全部"时 noticeType 为空字符串）
      // 后端会根据 noticeType 是否为空来决定是否添加筛选条件
      const res = await ownerAPI.filterNoticesByType({
        noticeType: this.data.activeFilter,  // "" 或 具体分类
        page: this.data.page,
        size: this.data.pageSize
      })
      // 处理筛选结果
      const data = (res && res.data) || { items: [], total: 0 }

      const notices = (data && data.items) || []
      const total = (data && data.total) || 0

      // 格式化时间
      const formattedNotices = notices.map(notice => ({
        ...notice,
        publishTime: this.formatTime(notice.publishTime)
      }))

      // 存储所有公告用于搜索
      if (this.data.page === 1) {
        this.setData({ allNotices: formattedNotices })
      } else {
        this.setData({
          allNotices: [...this.data.allNotices, ...formattedNotices]
        })
      }

      this.setData({
        notices: this.data.page === 1 ? formattedNotices : [...this.data.notices, ...formattedNotices],
        hasMore: (this.data.page * this.data.pageSize) < total,
        page: this.data.page + 1
      })
    } catch (err) {
      console.error('加载公告失败:', err)
      showToast('加载失败')
    } finally {
      this.setData({ loading: false })
      wx.stopPullDownRefresh()
    }
  },

  loadMore() {
    if (this.data.searchKeyword) {
      // 搜索模式下不加载更多
      return
    }
    this.loadNotices()
  },

  // 搜索
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
  },

  handleSearch() {
    this.filterNotices()
  },

  clearSearch() {
    this.setData({
      searchKeyword: ''
    })
    this.filterNotices()
  },

  setFilter(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({
      activeFilter: filter,
      page: 1,  // 重置页码
      notices: [],
      hasMore: true
    })
    this.loadNotices()
  },

  filterNotices() {
    const { allNotices, searchKeyword, activeFilter } = this.data

    let filtered = allNotices

    // 按关键词搜索
    if (searchKeyword) {
      filtered = filtered.filter(notice => {
        const keyword = searchKeyword.toLowerCase()
        return (
          notice.title.toLowerCase().includes(keyword) ||
          (notice.content && notice.content.toLowerCase().includes(keyword))
        )
      })
    }

    // 按筛选条件过滤
    if (activeFilter) {
      filtered = filtered.filter(notice => notice.noticeType === activeFilter)
    }

    this.setData({
      notices: filtered,
      hasMore: false // 搜索结果不需要加载更多
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
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return '昨天 ' + hours + ':' + minutes
      }
      
      // 今年内的其他日期
      if (date.getFullYear() === now.getFullYear()) {
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return month + '-' + day + ' ' + hours + ':' + minutes
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

  // 查看详情
  viewDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/owner/notice/detail/detail?id=${id}`
    })
  }
})

