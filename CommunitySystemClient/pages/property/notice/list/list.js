// pages/property/notice/list/list.js
// 公告管理 - 列表页面
const { staffAPI } = require('../../../../utils/api.js')
const { showToast, showLoading, hideLoading } = require('../../../../utils/util.js')

Page({
  data: {
    // 公告列表
    notices: [],
    filteredNotices: [],
    
    // 搜索和筛选
    searchKeyword: '',
    categoryFilter: '',
    
    // 分页
    page: 1,
    pageSize: 10,
    total: 0,
    loading: false,
    hasMore: true,
    empty: false,
    
    // 分类选项
    categories: [
      { id: '', name: '全部' },
      { id: '社区公告', name: '社区公告' },
      { id: '温馨提示', name: '温馨提示' },
      { id: '活动公告', name: '活动公告' },
      { id: '紧急通知', name: '紧急通知' }
    ]
  },

  onLoad() {
    this.loadNotices()
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      notices: [],
      filteredNotices: [],
      searchKeyword: '',
      categoryFilter: ''
    })
    this.loadNotices().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      const nextPage = this.data.page + 1
      this.setData({ page: nextPage })
      this.loadNotices(nextPage)
    }
  },

  // 加载公告列表
  async loadNotices(pageNum = 1) {
    if (this.data.loading) return

    try {
      this.setData({ loading: true })
      showLoading('加载中...')

      // 调用API获取公告列表
      const res = await staffAPI.listNotices(
        pageNum,
        this.data.pageSize,
        this.data.categoryFilter,
        this.data.searchKeyword
      )

      hideLoading()

      if (res && res.success && res.data) {
        let notices = res.data.items || []
        const total = res.data.total || 0

        // 按发布时间倒序排列（新的显示在前）
        notices = notices.sort((a, b) => {
          const timeA = new Date(a.publishTime || a.createTime || 0).getTime()
          const timeB = new Date(b.publishTime || b.createTime || 0).getTime()
          return timeB - timeA  // 倒序：新的在前
        })

        if (pageNum === 1) {
          this.setData({ notices })
        } else {
          this.setData({ notices: [...this.data.notices, ...notices] })
        }

        this.setData({
          total: total,
          hasMore: (pageNum * this.data.pageSize) < total,
          empty: notices.length === 0 && pageNum === 1,
          page: pageNum
        })

        // 应用搜索过滤
        this.filterNotices()
      } else {
        showToast('加载失败')
        this.setData({ empty: true })
      }
    } catch (err) {
      hideLoading()
      console.error('加载公告失败:', err)
      showToast('加载失败')
      this.setData({ empty: true })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value })
  },

  // 执行搜索
  handleSearch() {
    this.setData({
      page: 1,
      notices: [],
      filteredNotices: [],
      categoryFilter: ''
    })
    this.loadNotices(1)
  },

  // 清除搜索
  clearSearch() {
    this.setData({
      searchKeyword: '',
      page: 1,
      notices: [],
      categoryFilter: ''
    })
    this.loadNotices(1)
  },

  // 本地搜索过滤
  filterNotices() {
    const { notices, searchKeyword } = this.data

    let filtered = notices

    // 注意：filterNotices 只对已加载的数据进行客户端过滤
    // 真实的搜索应该在后端完成（通过 keyword 参数），此处保留用于二次筛选
    if (searchKeyword) {
      filtered = filtered.filter(notice => {
        const keyword = searchKeyword.toLowerCase()
        const title = (notice.noticeTitle || notice.title || '').toLowerCase()
        const content = (notice.noticeContent || notice.content || '').toLowerCase()

        return title.includes(keyword) || content.includes(keyword)
      })
    }

    // 按发布时间倒序排列（新的显示在前）
    filtered = filtered.sort((a, b) => {
      const timeA = new Date(a.publishTime || a.createTime || 0).getTime()
      const timeB = new Date(b.publishTime || b.createTime || 0).getTime()
      return timeB - timeA  // 倒序：新的在前
    })

    this.setData({ filteredNotices: filtered })
  },

  // 分类筛选
  setCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      categoryFilter: category,
      page: 1,
      notices: [],
      searchKeyword: ''
    })
    this.loadNotices()
  },

  // 查看详情
  viewDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/property/notice/detail/detail?id=${id}`
    })
  },

  // 编辑公告
  editNotice(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/property/notice/edit/edit?id=${id}`
    })
  },

  // 删除公告
  deleteNotice(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '确认删除？',
      content: '删除后无法恢复',
      success: async (res) => {
        if (res.confirm) {
          showLoading('删除中...')
          try {
            const result = await staffAPI.deleteNotice(id)
            hideLoading()
            
            if (result && result.success) {
              showToast('删除成功')
              this.setData({
                page: 1,
                notices: [],
                filteredNotices: []
              })
              this.loadNotices()
            } else {
              showToast('删除失败')
            }
          } catch (err) {
            hideLoading()
            console.error('删除失败:', err)
            showToast('删除失败')
          }
        }
      }
    })
  },

  // 新增公告
  goToAdd() {
    wx.navigateTo({
      url: '/pages/property/notice/add/add'
    })
  }
})