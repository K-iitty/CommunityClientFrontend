// pages/property/house/house-info/house-info.js
const { staffAPI } = require('../../../../utils/api.js')
const { showLoading, hideLoading, showToast } = require('../../../../utils/util.js')

Page({
  data: {
    house: null,
    loading: true,
    empty: false,
    houseId: null
  },

  onLoad(options) {
    const { id } = options
    if (id) {
      this.setData({ houseId: id })
      this.loadHouseDetail(id)
    } else {
      this.setData({ empty: true, loading: false })
    }
  },

  onPullDownRefresh() {
    if (this.data.houseId) {
      this.loadHouseDetail(this.data.houseId).then(() => {
        wx.stopPullDownRefresh()
      })
    }
  },

  async loadHouseDetail(id) {
    try {
      this.setData({ loading: true })
      showLoading('加载中...')

      const res = await staffAPI.getHouseDetail(id)

      hideLoading()

      console.log('House detail response:', res)

      if (res && res.success && res.data) {
        // 后端现在直接返回房屋数据
        const house = res.data
        
        if (house && house.id) {
          console.log('House data:', house)
          this.setData({
            house: house,
            loading: false,
            empty: false
          })
        } else {
          showToast('房屋数据为空')
          this.setData({ empty: true, loading: false })
        }
      } else {
        showToast('加载失败: ' + (res && res.message ? res.message : '未知错误'))
        this.setData({ empty: true, loading: false })
      }
    } catch (err) {
      hideLoading()
      console.error('加载房屋详情失败:', err)
      showToast('加载失败')
      this.setData({ empty: true, loading: false })
    }
  },

  // 预览户型图
  previewFloorPlan() {
    if (this.data.house && this.data.house.floorPlanImage) {
      wx.previewImage({
        urls: [this.data.house.floorPlanImage],
        current: this.data.house.floorPlanImage
      })
    }
  },

  goBack() {
    wx.navigateBack()
  }
})