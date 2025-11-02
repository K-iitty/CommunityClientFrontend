// pages/owner/profile/house/detail/detail.js
const { ownerAPI } = require('../../../../../utils/api.js')
const { showLoading, hideLoading, showToast } = require('../../../../../utils/util.js')

Page({
  data: {
    house: {},
    loading: true,
    houseId: null
  },

  onLoad(options) {
    console.log('📋 detail页面onLoad，options:', options)
    const { id } = options
    console.log('🔍 从options中提取的id:', id, '类型:', typeof id)
    
    if (id) {
      this.setData({ houseId: id })
      this.loadHouseDetail(id)
    } else {
      console.error('❌ 房屋ID不存在')
      showToast('房屋ID不存在')
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  onShow() {
    // 页面显示时，可以刷新数据
  },

  async loadHouseDetail(houseId) {
    try {
      showLoading()
      
      console.log('📍 开始加载房屋详情，houseId:', houseId)
      const res = await ownerAPI.getHouseDetail(houseId)
      
      console.log('=== 房屋详情数据 ===')
      console.log('res:', res)
      console.log('res.success:', res?.success)
      console.log('res.data:', res?.data)
      console.log('res.message:', res?.message)

      if (res && res.success && res.data) {
        console.log('✅ 房屋详情加载成功')
        console.log('详情数据:', res.data)
        this.setData({
          house: res.data,
          loading: false
        })
        hideLoading()
      } else {
        console.error('❌ 房屋详情加载失败')
        hideLoading()
        showToast(res?.message || '加载失败')
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    } catch (err) {
      console.error('❌ 加载房屋详情异常:', err)
      hideLoading()
      showToast('加载失败，请稍后重试')
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      this.setData({ loading: false })
    }
  },

  // 拨打电话
  callPhoneNumber(e) {
    const { phone } = e.currentTarget.dataset
    if (!phone) return

    wx.makePhoneCall({
      phoneNumber: phone,
      success() {
        console.log('拨打成功:', phone)
      },
      fail(err) {
        console.error('拨打失败:', err)
        showToast('拨打失败')
      }
    })
  },

  // 预览图片
  previewImage() {
    const { house } = this.data
    if (!house.floorPlanImage) return

    wx.previewImage({
      urls: [house.floorPlanImage],
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
