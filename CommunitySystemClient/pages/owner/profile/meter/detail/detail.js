// pages/owner/profile/meter/detail/detail.js
const { ownerAPI } = require('../../../../../utils/api.js')
const { showLoading, hideLoading, showToast } = require('../../../../../utils/util.js')

Page({
  data: {
    meterId: null,
    meter: null,
    config: null,
    house: null,
    building: null,
    community: null,
    loading: true
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ meterId: options.id })
      this.loadMeterDetail()
    }
  },

  onShow() {
    if (this.data.meterId) {
      this.loadMeterDetail()
    }
  },

  async loadMeterDetail() {
    try {
      showLoading()
      
      const res = await ownerAPI.getMeterDetail(this.data.meterId)
      
      console.log('=== 仪表详情加载 ===')
      console.log('res:', res)

      if (res && res.success && res.data) {
        this.setData({
          meter: res.data.meter,
          config: res.data.config,
          house: res.data.house,
          building: res.data.building,
          community: res.data.community,
          loading: false
        })
      } else {
        showToast(res && res.message ? res.message : '加载详情失败')
        this.setData({ loading: false })
      }

      hideLoading()
    } catch (err) {
      console.error('加载仪表详情失败:', err)
      hideLoading()
      showToast('加载失败，请稍后重试')
      this.setData({ loading: false })
    }
  }
})
