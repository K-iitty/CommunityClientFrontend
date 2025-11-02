// pages/property/meter/reading/reading-list.js
const { staffAPI } = require('../../../../utils/api.js')
const { showLoading, hideLoading, showToast } = require('../../../../utils/util.js')

Page({
  data: {
    readings: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    total: 0,
    meterId: null,
    meterName: '',
    meterCode: '',
    empty: false
  },

  onLoad(options) {
    // 从路由参数中获取meterId
    if (options.meterId) {
      this.setData({
        meterId: parseInt(options.meterId),
        meterName: options.meterName || '抄表记录',
        meterCode: options.meterCode || ''
      })
    }
    this.loadReadings()
  },

  onShow() {
    // 每次返回页面都刷新数据
    this.setData({
      page: 1,
      readings: [],
      hasMore: true
    })
    this.loadReadings()
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      readings: [],
      hasMore: true
    })
    this.loadReadings().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      const nextPage = this.data.page + 1
      this.setData({ page: nextPage })
      this.loadReadings()
    }
  },

  async loadReadings() {
    if (this.data.loading) return

    // 如果没有meterId，显示空状态
    if (!this.data.meterId) {
      this.setData({ empty: true })
      return
    }

    this.setData({ loading: true })
    showLoading('加载中...')

    try {
      const res = await staffAPI.listMeterReadings(
        this.data.meterId,
        this.data.page,
        this.data.pageSize
      )

      hideLoading()

      if (res && res.success && res.data) {
        const newReadings = res.data.items || []
        const allReadings = this.data.page === 1
          ? newReadings
          : [...this.data.readings, ...newReadings]

        this.setData({
          readings: allReadings,
          total: res.data.total || 0,
          hasMore: newReadings.length === this.data.pageSize,
          empty: allReadings.length === 0
        })
      } else {
        showToast('加载抄表记录失败', 'error')
        this.setData({ empty: true })
      }
    } catch (err) {
      hideLoading()
      console.error('加载抄表记录失败:', err)
      showToast('加载失败，请稍后重试', 'error')
      this.setData({ empty: true })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 新增抄表记录
  goToAdd() {
    console.log('点击新增抄表按钮')
    console.log('当前meterId:', this.data.meterId)
    
    if (!this.data.meterId) {
      console.warn('meterId为空，无法跳转')
      showToast('请先选择仪表', 'error')
      return
    }
    
    const url = `/pages/property/meter/reading/reading-add?meterId=${this.data.meterId}&meterCode=${this.data.meterCode}&meterName=${this.data.meterName}`
    console.log('准备跳转到:', url)
    
    wx.navigateTo({
      url: url,
      success: () => {
        console.log('跳转成功')
      },
      fail: (err) => {
        console.error('跳转失败:', err)
        showToast('跳转失败，请重试', 'error')
      }
    })
  },

  // 查看详情
  viewDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/property/meter/reading/reading-detail?id=${id}`
    })
  }
})