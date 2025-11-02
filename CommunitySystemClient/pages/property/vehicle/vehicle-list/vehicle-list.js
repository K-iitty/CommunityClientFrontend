// pages/property/vehicle/vehicle-list/vehicle-list.js
// 车辆管理 - 车辆列表
const { staffAPI } = require('../../../../utils/api.js')
const { showToast, showLoading, hideLoading } = require('../../../../utils/util.js')

Page({
  data: {
    mode: 'vehicle',  // 'vehicle' 或 'parking'
    
    // 车辆数据
    vehicles: [],
    page: 1,
    pageSize: 10,
    total: 0,
    loading: true,
    empty: false,
    hasMore: true,
    searchKeyword: '',
    
    // 停车位数据
    parkingSpaces: [],
    pageParking: 1,
    totalParking: 0,
    loadingParking: true,
    emptyParking: false,
    hasMoreParking: true,
    statusFilter: ''
  },

  onLoad() {
    this.loadVehicles()
    this.loadParkingSpaces()
  },

  onPullDownRefresh() {
    if (this.data.mode === 'vehicle') {
      this.setData({ page: 1, vehicles: [] })
      this.loadVehicles().then(() => wx.stopPullDownRefresh())
    } else {
      this.setData({ pageParking: 1, parkingSpaces: [] })
      this.loadParkingSpaces().then(() => wx.stopPullDownRefresh())
    }
  },

  onReachBottom() {
    if (this.data.mode === 'vehicle') {
      if (this.data.hasMore && !this.data.loading) {
        const nextPage = this.data.page + 1
        this.setData({ page: nextPage })
        this.loadVehicles()
      }
    } else {
      if (this.data.hasMoreParking && !this.data.loadingParking) {
        const nextPage = this.data.pageParking + 1
        this.setData({ pageParking: nextPage })
        this.loadParkingSpaces()
      }
    }
  },

  // ==================== 模式切换 ====================
  switchMode(e) {
    const mode = e.currentTarget.dataset.mode
    this.setData({ mode })
  },

  // ==================== 车辆管理 ====================
  async loadVehicles() {
    try {
      this.setData({ loading: true })
      if (this.data.page === 1) showLoading('加载中...')

      const res = await staffAPI.listVehicles(
        this.data.page,
        this.data.pageSize,
        this.data.searchKeyword
      )

      hideLoading()

      if (res && res.success && res.data) {
        const vehicles = res.data.items || []
        const total = res.data.total || 0

        if (this.data.page === 1) {
          this.setData({ vehicles })
        } else {
          this.setData({ vehicles: [...this.data.vehicles, ...vehicles] })
        }

        this.setData({
          total,
          hasMore: (this.data.page * this.data.pageSize) < total,
          empty: vehicles.length === 0 && this.data.page === 1,
          loading: false
        })
      }
    } catch (err) {
      hideLoading()
      console.error('加载车辆列表失败:', err)
      showToast('加载失败')
      this.setData({ empty: true, loading: false })
    }
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value })
  },

  handleSearch() {
    this.setData({ page: 1, vehicles: [] })
    this.loadVehicles()
  },

  goToAdd() {
    wx.navigateTo({ url: '/pages/property/vehicle/add-vehicle/add-vehicle' })
  },

  viewDetails(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/property/vehicle/vehicle-detail/vehicle-detail?id=${id}` })
  },

  deleteVehicle(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: async (res) => {
        if (res.confirm) {
          showLoading('删除中...')
          try {
            const result = await staffAPI.deleteVehicle(id)
            hideLoading()
            if (result && result.success) {
              showToast('删除成功')
              this.setData({ page: 1, vehicles: [] })
              this.loadVehicles()
            }
          } catch (err) {
            hideLoading()
            showToast('删除失败')
          }
        }
      }
    })
  },

  // ==================== 停车位管理 ====================
  async loadParkingSpaces() {
    try {
      this.setData({ loadingParking: true })
      if (this.data.pageParking === 1) showLoading('加载中...')

      const res = await staffAPI.listParkingSpaces(
        this.data.pageParking,
        this.data.pageSize,
        this.data.statusFilter
      )

      hideLoading()

      if (res && res.success && res.data) {
        const spaces = res.data.items || []
        const total = res.data.total || 0

        console.log('停车位列表数据:', JSON.stringify(spaces, null, 2))

        if (this.data.pageParking === 1) {
          this.setData({ parkingSpaces: spaces })
        } else {
          this.setData({ parkingSpaces: [...this.data.parkingSpaces, ...spaces] })
        }

        this.setData({
          totalParking: total,
          hasMoreParking: (this.data.pageParking * this.data.pageSize) < total,
          emptyParking: spaces.length === 0 && this.data.pageParking === 1,
          loadingParking: false
        })
      }
    } catch (err) {
      hideLoading()
      console.error('加载车位列表失败:', err)
      showToast('加载失败')
      this.setData({ emptyParking: true, loadingParking: false })
    }
  },

  setStatusFilter(e) {
    const status = e.currentTarget.dataset.status || ''
    this.setData({ statusFilter: status, pageParking: 1, parkingSpaces: [] })
    this.loadParkingSpaces()
  },

  goToAddParking() {
    wx.navigateTo({ url: '/pages/property/vehicle/add-parking/add-parking' })
  },

  deleteParkingSpace(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个车位吗？',
      success: async (res) => {
        if (res.confirm) {
          showLoading('删除中...')
          try {
            const result = await staffAPI.deleteParkingSpace(id)
            hideLoading()
            if (result && result.success) {
              showToast('删除成功')
              this.setData({ pageParking: 1, parkingSpaces: [] })
              this.loadParkingSpaces()
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

  // 获取停车位状态的颜色
  getSpaceStatusColor(status) {
    const colors = {
      '空闲': '#f59e0b',   // 黄色
      '已租': '#10b981',   // 绿色
      '占用': '#3b82f6',   // 蓝色
      '维修': '#ef4444'    // 红色
    }
    return colors[status] || '#666'
  }
})