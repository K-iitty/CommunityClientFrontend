// pages/owner/profile/vehicle/detail/detail.js
const { ownerAPI } = require('../../../../../utils/api.js')
const { showLoading, hideLoading, showToast } = require('../../../../../utils/util.js')

Page({
  data: {
    vehicle: {},
    vehicleImages: [],
    loading: true,
    vehicleId: null
  },

  onLoad(options) {
    const { id } = options
    if (id) {
      this.setData({ vehicleId: id })
      this.loadVehicleDetail(id)
    } else {
      showToast('车辆ID不存在')
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  onShow() {
    // 页面显示时，可以刷新数据
  },

  async loadVehicleDetail(vehicleId) {
    try {
      showLoading()
      
      const res = await ownerAPI.getVehicleDetail(vehicleId)
      
      console.log('=== 车辆详情数据 ===')
      console.log('res:', res)

      if (res && res.success && res.data) {
        const vehicle = res.data
        
        // 解析车辆照片JSON
        let vehicleImages = []
        if (vehicle.vehicleImages) {
          try {
            // 尝试解析JSON
            if (typeof vehicle.vehicleImages === 'string') {
              vehicleImages = JSON.parse(vehicle.vehicleImages)
            } else if (Array.isArray(vehicle.vehicleImages)) {
              vehicleImages = vehicle.vehicleImages
            }
          } catch (err) {
            console.warn('车辆照片JSON解析失败:', err)
            vehicleImages = []
          }
        }

        this.setData({
          vehicle: vehicle,
          vehicleImages: vehicleImages,
          loading: false
        })
        hideLoading()
      } else {
        hideLoading()
        showToast(res?.message || '加载失败')
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    } catch (err) {
      console.error('加载车辆详情失败:', err)
      hideLoading()
      showToast('加载失败，请稍后重试')
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      this.setData({ loading: false })
    }
  },

  // 预览图片
  previewImage(e) {
    const { src } = e.currentTarget.dataset
    if (!src) return

    // 收集所有图片URL用于预览
    const allImages = []
    
    // 添加驾照照片
    if (this.data.vehicle.driverLicenseImage) {
      allImages.push(this.data.vehicle.driverLicenseImage)
    }
    
    // 添加车辆信息照片
    if (this.data.vehicleImages && this.data.vehicleImages.length > 0) {
      allImages.push(...this.data.vehicleImages)
    }

    // 找到当前点击的图片在数组中的位置
    const currentIndex = allImages.indexOf(src)

    wx.previewImage({
      urls: allImages,
      current: currentIndex >= 0 ? currentIndex : 0,
      success() {
        console.log('预览成功')
      },
      fail(err) {
        console.error('预览失败:', err)
        showToast('预览失败')
      }
    })
  }
})
