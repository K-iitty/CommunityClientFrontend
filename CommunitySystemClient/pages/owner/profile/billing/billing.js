// pages/owner/profile/billing/billing.js
const { ownerAPI } = require('../../../../utils/api.js')
const { showLoading, hideLoading, showToast } = require('../../../../utils/util.js')

Page({
  data: {
    bills: [],
    billingCards: [],
    activeTab: 0,
    tabs: [
      { name: 'all', label: '全部' },
      { name: 'meter', label: '仪表费用' },
      { name: 'parking', label: '停车费用' },
      { name: 'issue', label: '问题费用' }
    ],
    
    // 统计
    summary: {
      totalAmount: '0.00',
      unpaidAmount: '0.00',
      paidAmount: '0.00'
    },
    
    // 分类统计
    categorySummary: {
      meter: { count: 0, amount: '0.00' },
      parking: { count: 0, amount: '0.00' },
      issue: { count: 0, amount: '0.00' }
    },
    
    // 分页
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
      pages: 0
    },
    
    loading: false
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  onPullDownRefresh() {
    this.setData({ 'pagination.current': 1 })
    this.loadData()
  },

  async loadData() {
    try {
      showLoading()
      
      // 加载缴费卡片
      const cardsRes = await ownerAPI.getBillingCards()

      console.log('=== 账单数据加载 ===')
      console.log('cardsRes:', cardsRes)

      // 处理缴费卡片
      let bills = []
      if (cardsRes && cardsRes.success) {
        if (cardsRes.data && Array.isArray(cardsRes.data)) {
          bills = cardsRes.data
        }
      }

      console.log('处理后的账单数据:', bills)

      // 分类统计
      const categorySummary = {
        meter: { count: 0, amount: 0 },
        parking: { count: 0, amount: 0 },
        issue: { count: 0, amount: 0 }
      }

      bills.forEach(bill => {
        const amount = parseFloat(bill.amount) || 0
        if (bill.billType === 'meter') {
          categorySummary.meter.count++
          categorySummary.meter.amount += amount
        } else if (bill.billType === 'parking') {
          categorySummary.parking.count++
          categorySummary.parking.amount += amount
        } else if (bill.billType === 'issue') {
          categorySummary.issue.count++
          categorySummary.issue.amount += amount
        }
      })

      // 转换为字符串格式
      Object.keys(categorySummary).forEach(key => {
        categorySummary[key].amount = categorySummary[key].amount.toFixed(2)
      })

      this.setData({
        bills: bills,
        billingCards: bills,
        categorySummary: categorySummary,
        loading: false,
        'pagination.total': bills.length,
        'pagination.pages': Math.ceil(bills.length / this.data.pagination.pageSize)
      })

      // 计算统计数据
      this.calculateStatistics(bills)
      this.updateDisplayedBills()

      hideLoading()
    } catch (err) {
      console.error('加载账单信息失败:', err)
      hideLoading()
      showToast('加载失败，请稍后重试')
      this.setData({ loading: false })
    } finally {
      wx.stopPullDownRefresh()
    }
  },

  calculateStatistics(bills) {
    let totalAmount = 0
    let unpaidAmount = 0

    bills.forEach(bill => {
      const amount = parseFloat(bill.amount) || 0
      totalAmount += amount
      // 所有账单都默认为待缴
      unpaidAmount += amount
    })

    this.setData({
      summary: {
        totalAmount: totalAmount.toFixed(2),
        unpaidAmount: unpaidAmount.toFixed(2),
        paidAmount: '0.00'
      }
    })
  },

  // 标签页切换
  switchTab(e) {
    const tabName = e.currentTarget.dataset.tab
    const tabIndex = this.data.tabs.findIndex(tab => tab.name === tabName)
    
    this.setData({
      activeTab: tabIndex,
      'pagination.current': 1
    })
    
    // 延迟更新以避免卡顿
    setTimeout(() => {
      this.updateDisplayedBills()
    }, 100)
  },

  // 更新显示的账单（根据当前标签页和分页）
  updateDisplayedBills() {
    const activeTabName = this.data.tabs[this.data.activeTab].name
    let filtered = this.data.billingCards

    // 按分类筛选
    if (activeTabName !== 'all') {
      filtered = filtered.filter(bill => bill.billType === activeTabName)
    }

    // 分页处理
    const pageSize = this.data.pagination.pageSize
    const current = this.data.pagination.current
    const start = (current - 1) * pageSize
    const end = start + pageSize
    const displayedBills = filtered.slice(start, end)

    this.setData({
      bills: displayedBills,
      'pagination.total': filtered.length,
      'pagination.pages': Math.ceil(filtered.length / pageSize) || 1
    })
  },

  // 上一页
  prevPage() {
    if (this.data.pagination.current > 1) {
      this.setData({
        'pagination.current': this.data.pagination.current - 1
      })
      this.updateDisplayedBills()
    }
  },

  // 下一页
  nextPage() {
    if (this.data.pagination.current < this.data.pagination.pages) {
      this.setData({
        'pagination.current': this.data.pagination.current + 1
      })
      this.updateDisplayedBills()
    }
  },

  // 查看详情
  viewDetail(e) {
    const item = e.currentTarget.dataset
    const billType = e.currentTarget.dataset.type

    if (item.billType === 'meter' || item.type === 'meter') {
      wx.navigateTo({
        url: `/pages/owner/profile/meter/detail/detail?meterId=${item.id || item.meterid}`
      })
    } else if (item.billType === 'parking' || item.type === 'parking') {
      wx.navigateTo({
        url: `/pages/owner/profile/parking/detail?spaceId=${item.id || item.spaceid}`
      })
    } else if (item.billType === 'issue' || item.type === 'issue') {
      wx.navigateTo({
        url: `/pages/owner/home/issue/detail?id=${item.id || item.issueid}`
      })
    }
  }
})