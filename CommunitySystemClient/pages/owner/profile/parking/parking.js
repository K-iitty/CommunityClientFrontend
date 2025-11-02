// pages/owner/profile/parking/parking.js
const { ownerAPI } = require('../../../../utils/api.js')
const { showLoading, hideLoading, showToast } = require('../../../../utils/util.js')

Page({
  data: {
    parkingSpaces: [],
    applications: [],
    searchSpaces: [],
    activeTab: 0,
    tabItems: [
      { label: '我的车位', value: 0 },
      { label: '查找车位', value: 1 }
    ],
    
    // 分页相关
    page: 1,
    pageSize: 10,
    total: 0,
    hasMore: true,
    loading: false,

    // 申请记录过滤
    statusFilters: [
      { label: '全部', value: null },
      { label: '占用', value: '占用' },
      { label: '空闲', value: '空闲' }
    ],
    activeStatusFilter: 0,
    applicationPage: 1,
    applicationPageSize: 10,
    applicationTotal: 0,
    applicationHasMore: true,

    // 查找停车位过滤
    spaceStatusFilters: [
      { label: '全部', value: null },
      { label: '空闲', value: '空闲' },
      { label: '已租', value: '已租' },
      { label: '占用', value: '占用' }
    ],
    activeSpaceStatusFilter: 0,
    searchPage: 1,
    searchPageSize: 10,
    searchTotal: 0,
    searchHasMore: true,
    searchLoading: false
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      parkingSpaces: [],
      applications: [],
      searchSpaces: [],
      total: 0,
      hasMore: true,
      applicationPage: 1,
      activeStatusFilter: 0,
      searchPage: 1,
      activeSpaceStatusFilter: 0
    })
    this.loadData()
  },

  async loadData() {
    try {
      showLoading()
      
      // 并发加载两个Tab的数据
      const [parkingRes, searchRes] = await Promise.all([
        ownerAPI.getMyParkingSpaces(this.data.page, this.data.pageSize)
          .catch(err => {
            console.warn('加载我的车位失败:', err)
            return null
          }),
        this.loadSearchSpacesByStatus()
          .catch(err => {
            console.warn('加载查找停车位失败:', err)
            return { items: [], total: 0 }
          })
      ])

      // 处理我的车位列表
      if (parkingRes && parkingRes.success && parkingRes.data) {
        const items = parkingRes.data.items || []
        const total = parkingRes.data.total || 0

        this.setData({
          parkingSpaces: this.data.page === 1 ? items : [...this.data.parkingSpaces, ...items],
          total: total,
          hasMore: (this.data.page * this.data.pageSize) < total
        })
      }

      // 处理查找停车位
      if (searchRes && searchRes.items) {
        this.setData({
          searchSpaces: searchRes.items || [],
          searchTotal: searchRes.total || 0,
          searchHasMore: (this.data.searchPage * this.data.searchPageSize) < (searchRes.total || 0)
        })
      }

      hideLoading()
    } catch (err) {
      console.error('加载车位信息失败:', err)
      hideLoading()
      showToast('加载失败，请稍后重试')
    } finally {
      wx.stopPullDownRefresh()
    }
  },

  // 查找停车位 - 按状态过滤
  async loadSearchSpacesByStatus() {
    try {
      const filter = this.data.spaceStatusFilters[this.data.activeSpaceStatusFilter]
      const res = await ownerAPI.searchAvailableParkingSpaces(
        filter.value,
        this.data.searchPage,
        this.data.searchPageSize
      )

      console.log('查询可用停车位:', res)

      if (res && res.success && res.data) {
        return res.data
      }
      return { items: [], total: 0 }
    } catch (err) {
      console.error('加载可用停车位失败:', err)
      return { items: [], total: 0 }
    }
  },

  // 选择查找停车位的状态过滤
  async selectSpaceStatusFilter(e) {
    let index = e.currentTarget.dataset.index
    
    // 如果是字符串类型，转换为数字
    if (typeof index === 'string') {
      index = parseInt(index)
    }
    
    if (this.data.activeSpaceStatusFilter === index) return

    this.setData({
      activeSpaceStatusFilter: index,
      searchPage: 1,
      searchSpaces: [],
      searchLoading: true
    })

    try {
      const spacesRes = await this.loadSearchSpacesByStatus()
      this.setData({
        searchSpaces: spacesRes.items || [],
        searchTotal: spacesRes.total || 0,
        searchHasMore: (this.data.searchPage * this.data.searchPageSize) < (spacesRes.total || 0),
        searchLoading: false
      })
    } catch (err) {
      console.error('过滤停车位失败:', err)
      this.setData({
        searchSpaces: [],
        searchLoading: false
      })
    }
  },

  // 加载更多查找停车位
  async loadMoreSearchSpaces() {
    if (this.data.searchLoading || !this.data.searchHasMore) return

    this.setData({
      searchPage: this.data.searchPage + 1,
      searchLoading: true
    })

    try {
      const spacesRes = await this.loadSearchSpacesByStatus()
      this.setData({
        searchSpaces: [...this.data.searchSpaces, ...(spacesRes.items || [])],
        searchHasMore: (this.data.searchPage * this.data.searchPageSize) < (spacesRes.total || 0),
        searchLoading: false
      })
    } catch (err) {
      console.error('加载更多停车位失败:', err)
      showToast('加载失败，请稍后重试')
      this.setData({
        searchPage: this.data.searchPage - 1,
        searchLoading: false
      })
    }
  },

  // 按状态加载申请记录（保持原有逻辑）
  async loadApplicationsByStatus() {
    try {
      const filter = this.data.statusFilters[this.data.activeStatusFilter]
      const res = await ownerAPI.getParkingApplicationsByStatus(
        filter.value,
        this.data.applicationPage,
        this.data.applicationPageSize
      )

      console.log('按状态查询申请记录:', res)

      if (res && res.success && res.data) {
        return res.data
      }
      return { items: [], total: 0 }
    } catch (err) {
      console.error('加载申请记录失败:', err)
      return { items: [], total: 0 }
    }
  },

  // 选择状态过滤（保持原有逻辑）
  async selectStatusFilter(e) {
    let index = e.currentTarget.dataset.index
    
    // 如果是字符串类型，转换为数字
    if (typeof index === 'string') {
      index = parseInt(index)
    }
    
    if (this.data.activeStatusFilter === index) return

    this.setData({
      activeStatusFilter: index,
      applicationPage: 1,
      applications: [],
      loading: true
    })

    try {
      const applicationsRes = await this.loadApplicationsByStatus()
      this.setData({
        applications: applicationsRes.items || [],
        applicationTotal: applicationsRes.total || 0,
        applicationHasMore: (this.data.applicationPage * this.data.applicationPageSize) < (applicationsRes.total || 0),
        loading: false
      })
    } catch (err) {
      console.error('过滤申请记录失败:', err)
      this.setData({
        applications: [],
        loading: false
      })
    }
  },

  // 加载更多申请记录
  async loadMoreApplications() {
    if (this.data.loading || !this.data.applicationHasMore) return

    this.setData({
      applicationPage: this.data.applicationPage + 1,
      loading: true
    })

    try {
      const applicationsRes = await this.loadApplicationsByStatus()
      this.setData({
        applications: [...this.data.applications, ...(applicationsRes.items || [])],
        applicationHasMore: (this.data.applicationPage * this.data.applicationPageSize) < (applicationsRes.total || 0),
        loading: false
      })
    } catch (err) {
      console.error('加载更多申请记录失败:', err)
      showToast('加载失败，请稍后重试')
      this.setData({
        applicationPage: this.data.applicationPage - 1,
        loading: false
      })
    }
  },

  // 切换Tab
  async switchTab(e) {
    const { index } = e.currentTarget.dataset
    if (this.data.activeTab === index) return
    
    this.setData({
      activeTab: index,
      loading: true
    })

    // 如果切换到查找停车位标签，加载数据
    if (index === 1) {
      try {
        const spacesRes = await this.loadSearchSpacesByStatus()
        this.setData({
          searchSpaces: spacesRes.items || [],
          searchTotal: spacesRes.total || 0,
          searchHasMore: (this.data.searchPage * this.data.searchPageSize) < (spacesRes.total || 0),
          loading: false
        })
      } catch (err) {
        console.error('切换到查找停车位时加载失败:', err)
        this.setData({
          searchSpaces: [],
          searchTotal: 0,
          searchHasMore: false,
          loading: false
        })
      }
    } else {
      this.setData({
        loading: false
      })
    }
  },

  // 加载更多我的车位
  loadMoreParkingSpaces() {
    if (this.data.loading || !this.data.hasMore) return

    this.setData({ loading: true, page: this.data.page + 1 })
    this.loadMoreData()
  },

  async loadMoreData() {
    try {
      const res = await ownerAPI.getMyParkingSpaces(this.data.page, this.data.pageSize)

      if (res && res.success && res.data) {
        const newItems = res.data.items || []
        this.setData({
          parkingSpaces: [...this.data.parkingSpaces, ...newItems],
          total: res.data.total,
          hasMore: (this.data.page * this.data.pageSize) < res.data.total,
          page: this.data.page + 1
        })
      }
    } catch (err) {
      console.error('加载更多车位失败:', err)
      showToast('加载更多失败')
    } finally {
      this.setData({ loading: false })
    }
  },

  // 查看详情
  viewDetail(e) {
    const { id } = e.currentTarget.dataset
    if (!id) return
    
    wx.navigateTo({
      url: `/pages/owner/profile/parking/detail?id=${id}`
    })
  },

  // 申请添加车位
  applyParkingSpace() {
    wx.navigateTo({
      url: '/pages/owner/profile/parking/apply'
    })
  }
})
