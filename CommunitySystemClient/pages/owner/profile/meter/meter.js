// pages/owner/profile/meter/meter.js
const { ownerAPI } = require('../../../../utils/api.js')
const { showLoading, hideLoading, showToast } = require('../../../../utils/util.js')

Page({
  data: {
    meterCards: [],
    meters: [],
    activeTab: 0,
    tabItems: [
      { label: '仪表卡片', value: 0 },
      { label: '我的仪表', value: 1 }
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
      meters: [],
      total: 0,
      hasMore: true
    })
    this.loadData()
  },

  async loadData() {
    try {
      showLoading()
      
      // 加载仪表卡片列表
      const cardsRes = await ownerAPI.getMeterCards()

      console.log('=== 仪表数据加载 ===')
      console.log('cardsRes:', cardsRes)

      // 处理仪表卡片
      let meters = []
      if (cardsRes && cardsRes.success) {
        if (cardsRes.data && Array.isArray(cardsRes.data)) {
          meters = cardsRes.data
        } else if (cardsRes.data && cardsRes.data.items) {
          meters = cardsRes.data.items
        }
      }

      console.log('处理后的仪表数据:', meters)

      this.setData({
        meters: meters,
        meterCards: meters,
        total: meters.length,
        hasMore: false,
        loading: false
      })

      hideLoading()
    } catch (err) {
      console.error('加载仪表信息失败:', err)
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

  // 加载更多
  loadMoreMeters() {
    if (this.data.loading || !this.data.hasMore) return

    this.setData({ loading: true, page: this.data.page + 1 })
    this.loadMoreData()
  },

  async loadMoreData() {
    try {
      // 仪表列表无分页，无需加载更多
      this.setData({ loading: false })
      showToast('已加载全部数据')
    } catch (err) {
      console.error('加载更多失败:', err)
      this.setData({ loading: false })
    }
  },

  // 查看详情
  viewDetail(e) {
    const dataset = e.currentTarget.dataset
    const id = dataset.id || dataset.meterId || dataset.meterid
    
    if (!id) {
      console.warn('仪表ID未找到', e)
      wx.showToast({
        title: '仪表信息异常',
        icon: 'none'
      })
      return
    }
    
    wx.navigateTo({
      url: `/pages/owner/profile/meter/detail?id=${id}`
    })
  },

  // 申请新增仪表
  applyAddMeter() {
    wx.navigateTo({
      url: '/pages/owner/profile/meter/apply'
    })
  },

  // 申请删除仪表
  applyDelete(e) {
    const { id } = e.currentTarget.dataset
    if (!id) return

    wx.showModal({
      title: '申请删除仪表',
      content: '确定要申请删除此仪表吗?',
      editable: true,
      placeholderText: '请说明删除原因',
      success: async (res) => {
        if (res.confirm && res.content.trim()) {
          try {
            showLoading()
            const result = await ownerAPI.applyDeleteMeter(id, res.content.trim())
            hideLoading()

            if (result && result.success) {
              showToast('删除申请已提交')
              this.loadData()
            } else {
              showToast(result && result.message ? result.message : '申请提交失败')
            }
          } catch (err) {
            hideLoading()
            console.error('删除申请失败:', err)
            showToast('申请提交失败，请稍后重试')
          }
        } else {
          showToast('请输入删除原因')
        }
      }
    })
  }
})