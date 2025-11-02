// pages/property/house/house-list/house-list.js
const { staffAPI } = require('../../../../utils/api.js')
const { showToast, showLoading, hideLoading } = require('../../../../utils/util.js')

Page({
  data: {
    houses: [],
    page: 1,
    pageSize: 10,
    total: 0,
    loading: true,
    empty: false,
    hasMore: true,
    searchKeyword: '',
    typeFilter: '',
    statusFilter: '',
    
    propertyTypes: ['公寓', '别墅', '洋房', '其他']
  },

  onLoad() {
    this.loadHouses()
  },

  onPullDownRefresh() {
    this.setData({ page: 1, houses: [] })
    this.loadHouses().then(() => wx.stopPullDownRefresh())
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      const nextPage = this.data.page + 1
      this.setData({ page: nextPage })
      this.loadHouses()
    }
  },

  async loadHouses() {
    try {
      this.setData({ loading: true })
      if (this.data.page === 1) showLoading('加载中...')

      const res = await staffAPI.listHouses(
        this.data.page,
        this.data.pageSize,
        this.data.searchKeyword
      )

      hideLoading()

      if (res && res.success && res.data) {
        let houses = res.data.items || []
        
        // 根据 houseStatus 字段进行前端筛选
        if (this.data.statusFilter) {
          houses = houses.filter(house => house.houseStatus === this.data.statusFilter)
        }
        
        const total = res.data.total || 0

        if (this.data.page === 1) {
          this.setData({ houses })
        } else {
          this.setData({ houses: [...this.data.houses, ...houses] })
        }

        this.setData({
          total,
          hasMore: (this.data.page * this.data.pageSize) < total,
          empty: houses.length === 0 && this.data.page === 1,
          loading: false
        })
      }
    } catch (err) {
      hideLoading()
      console.error('加载房产列表失败:', err)
      showToast('加载失败')
      this.setData({ empty: true, loading: false })
    }
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value })
  },

  handleSearch() {
    this.setData({ page: 1, houses: [] })
    this.loadHouses()
  },

  setTypeFilter(e) {
    const type = e.currentTarget.dataset.type || ''
    this.setData({ typeFilter: type, page: 1, houses: [] })
    this.loadHouses()
  },

  setStatusFilter(e) {
    const status = e.currentTarget.dataset.status || ''
    this.setData({ statusFilter: status, page: 1, houses: [] })
    this.loadHouses()
  },

  goToAdd() {
    wx.navigateTo({ url: '/pages/property/house/add-house/add-house' })
  },

  viewDetails(e) {
    console.log('viewDetails called', e)
    const { id } = e.currentTarget.dataset
    console.log('Extracted id:', id)
    if (!id) {
      console.warn('House ID is empty')
      wx.showToast({ title: '房屋ID为空', icon: 'none' })
      return
    }
    console.log('Navigating to house detail with id:', id)
    wx.navigateTo({ 
      url: `/pages/property/house/house-info/house-info?id=${id}`,
      fail: (err) => {
        console.error('Navigation failed:', err)
      }
    })
  },

  editHouse(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/property/house/edit-house/edit-house?id=${id}` })
  },

  deleteHouse(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条房产记录吗？',
      success: async (res) => {
        if (res.confirm) {
          showLoading('删除中...')
          try {
            const result = await staffAPI.deleteHouse(id)
            hideLoading()
            if (result && result.success) {
              showToast('删除成功')
              this.setData({ page: 1, houses: [] })
              this.loadHouses()
            }
          } catch (err) {
            hideLoading()
            console.error('删除失败:', err)
            showToast('删除失败')
          }
        }
      }
    })
  }
})
