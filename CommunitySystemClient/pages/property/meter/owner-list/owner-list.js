// pages/property/meter/owner-list/owner-list.js
const { staffAPI } = require('../../../../utils/api.js')
const { showLoading, hideLoading, showToast } = require('../../../../utils/util.js')

Page({
  data: {
    owners: [],
    filteredOwners: [],
    loading: false,
    searching: false,
    searchText: '',
    page: 1,
    pageSize: 20,
    hasMore: true,
    empty: false,
    expandedOwners: {}  // 追踪已展开的业主仪表列表
  },

  onLoad() {
    this.loadOwners()
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      hasMore: true,
      owners: [],
      searchText: '',
      filteredOwners: []
    })
    this.loadOwners().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      const nextPage = this.data.page + 1
      this.setData({ page: nextPage })
      this.loadOwners(nextPage)
    }
  },

  async loadOwners(pageNum = 1) {
    if (this.data.loading) return

    this.setData({ loading: true })
    showLoading('加载中...')

    try {
      const res = await staffAPI.getMeterOwnerList({
        page: pageNum,
        pageSize: this.data.pageSize
      })

      hideLoading()

      if (res && res.success) {
        const newOwners = res.data.items || []
        
        // 过滤：只显示有仪表的业主
        const filteredNewOwners = newOwners.filter(owner => 
          owner.meters && Array.isArray(owner.meters) && owner.meters.length > 0
        )
        
        const allOwners = pageNum === 1 
          ? filteredNewOwners 
          : [...this.data.owners, ...filteredNewOwners]
        
        this.setData({
          owners: allOwners,
          filteredOwners: allOwners,
          hasMore: newOwners.length === this.data.pageSize,
          empty: allOwners.length === 0,
          page: pageNum
        })
      } else {
        showToast('获取仪表列表失败', 'error')
        this.setData({ empty: true })
      }
    } catch (err) {
      hideLoading()
      console.error('获取仪表列表失败:', err)
      showToast('获取仪表列表失败', 'error')
      this.setData({ empty: true })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 查看业主仪表
  async onViewMeters(e) {
    const { ownerId } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/property/meter/owner-meters/owner-meters?ownerId=${ownerId}`
    })
  },

  // 管理仪表配置
  onManageConfigs() {
    wx.navigateTo({
      url: '/pages/property/meter/config/config-list'
    })
  },

  // 查看抄表记录
  onViewReadings() {
    wx.navigateTo({
      url: '/pages/property/meter/reading/reading-list'
    })
  },

  onSearchInput(e) {
    const searchText = e.detail.value || ''
    this.setData({ searchText })
    this.filterOwners(searchText)
  },

  filterOwners(searchText) {
    if (!searchText) {
      this.setData({ filteredOwners: this.data.owners })
      return
    }

    const filtered = this.data.owners.filter(owner => {
      const name = owner.ownerName || ''
      const house = owner.houseName || ''
      const text = searchText.toLowerCase()
      return name.toLowerCase().includes(text) || house.toLowerCase().includes(text)
    })

    this.setData({ filteredOwners: filtered })
  },

  onClearSearch() {
    this.setData({
      searchText: '',
      filteredOwners: this.data.owners
    })
  },

  // 获取仪表类型的图标
  getMeterIcon(type) {
    const icons = {
      '水': '💧',
      '电': '⚡',
      '燃气': '🔥',
      '其他': '📊'
    }
    return icons[type] || '📊'
  },

  // 获取仪表类型的颜色
  getMeterColor(type) {
    const colors = {
      '水': '#2196f3',
      '电': '#ff9800',
      '燃气': '#f44336',
      '其他': '#666'
    }
    return colors[type] || '#666'
  },

  // 查看仪表的抄表记录
  onViewMeterReadings(e) {
    const { meterId, meterCode, meterName } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/property/meter/reading/reading-list?meterId=${meterId}&meterCode=${meterCode}&meterName=${meterName}`
    })
  },

  // 展开/收起业主仪表列表
  toggleOwnerMeters(e) {
    const { ownerId } = e.currentTarget.dataset
    const expandedOwners = this.data.expandedOwners
    expandedOwners[ownerId] = !expandedOwners[ownerId]
    this.setData({ expandedOwners })
  }
})