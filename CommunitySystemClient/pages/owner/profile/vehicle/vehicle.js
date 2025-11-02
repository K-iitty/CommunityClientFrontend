// pages/owner/profile/vehicle/vehicle.js
const { ownerAPI } = require('../../../../utils/api.js')
const { showLoading, hideLoading, showToast } = require('../../../../utils/util.js')

Page({
  data: {
    vehicles: [],
    applications: [],
    activeTab: 0,
    tabItems: [
      { label: '我的车辆', value: 0 },
      { label: '申请记录', value: 1 }
    ],
    
    // 分页相关
    page: 1,
    pageSize: 10,
    total: 0,
    hasMore: true,
    loading: false
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
      vehicles: [],
      applications: [],
      total: 0,
      hasMore: true
    })
    this.loadData()
  },

  async loadData() {
    try {
      showLoading()
      
      // 并发加载车辆和申请记录
      const [vehiclesRes, applicationsRes] = await Promise.all([
        ownerAPI.getMyVehicles(this.data.page, this.data.pageSize),
        ownerAPI.getVehicleApplications()
      ])

      console.log('=== 车辆数据加载 ===')
      console.log('vehiclesRes:', vehiclesRes)
      console.log('applicationsRes:', applicationsRes)

      // 处理车辆列表
      if (vehiclesRes && vehiclesRes.success && vehiclesRes.data) {
        const items = vehiclesRes.data.items || []
        const total = vehiclesRes.data.total || 0

        console.log('解析后的车辆数据:', items)

        this.setData({
          vehicles: this.data.page === 1 ? items : [...this.data.vehicles, ...items],
          total: total,
          hasMore: (this.data.page * this.data.pageSize) < total,
          loading: false
        })
      }

      // 处理申请记录
      if (applicationsRes && applicationsRes.success && applicationsRes.data) {
        this.setData({
          applications: applicationsRes.data
        })
      }

      hideLoading()
    } catch (err) {
      console.error('加载车辆信息失败:', err)
      hideLoading()
      showToast('加载失败，请稍后重试')
      this.setData({ loading: false })
    } finally {
      wx.stopPullDownRefresh()
    }
  },

  // 切换Tab
  switchTab(e) {
    const { index } = e.currentTarget.dataset
    this.setData({
      activeTab: index
    })
  },

  // 加载更多车辆
  loadMoreVehicles() {
    if (this.data.loading || !this.data.hasMore) return

    this.setData({ loading: true, page: this.data.page + 1 })
    this.loadMoreData()
  },

  async loadMoreData() {
    try {
      const res = await ownerAPI.getMyVehicles(this.data.page, this.data.pageSize)

      if (res && res.success && res.data) {
        const newItems = res.data.items || []
        this.setData({
          vehicles: [...this.data.vehicles, ...newItems],
          total: res.data.total,
          hasMore: (this.data.page * this.data.pageSize) < res.data.total,
          page: this.data.page + 1
        })
      }
    } catch (err) {
      console.error('加载更多车辆失败:', err)
      showToast('加载更多失败')
    } finally {
      this.setData({ loading: false })
    }
  },

  // 查看详情
  viewDetail(e) {
    const { vehicleId } = e.currentTarget.dataset
    if (!vehicleId) return
    
    wx.navigateTo({
      url: `/pages/owner/profile/vehicle/detail/detail?id=${vehicleId}`
    })
  },

  // 申请添加车辆
  applyVehicle() {
    wx.navigateTo({
      url: '/pages/owner/profile/vehicle/apply'
    })
  }
})