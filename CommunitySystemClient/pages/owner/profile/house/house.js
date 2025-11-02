// pages/owner/profile/house/house.js
const { ownerAPI } = require('../../../../utils/api.js')
const { showLoading, hideLoading, showToast } = require('../../../../utils/util.js')

Page({
  data: {
    houses: [],
    applications: [],
    activeTab: 0,
    tabItems: [
      { label: '我的房屋', value: 0 },
      { label: '申请记录', value: 1 }
    ],
    // 分页相关
    page: 1,
    pageSize: 10,
    total: 0,
    hasMore: true,
    loading: false,
    // 申请记录过滤
    statusFilters: [
      { label: '全部申请', value: null, verified: null },
      { label: '待审核', value: null, verified: 0 },
      { label: '已验证', value: null, verified: 1 }
    ],
    activeStatusFilter: 0,
    applicationPage: 1,
    applicationPageSize: 10,
    applicationTotal: 0,
    applicationHasMore: true
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    // 页面显示时刷新数据
    this.setData({ 
      page: 1,
      applicationPage: 1,
      activeStatusFilter: 0,
      loading: false
    })
    
    // 只在activeTab为0时加载房屋数据，为1时加载申请数据
    if (this.data.activeTab === 0) {
      this.loadData()
    } else {
      this.loadApplicationsData()
    }
  },

  async loadApplicationsData() {
    try {
      showLoading()
      const applicationsRes = await this.loadApplicationsByStatus()
      
      if (applicationsRes && applicationsRes.items) {
        this.setData({
          applications: applicationsRes.items,
          applicationTotal: applicationsRes.total || 0,
          applicationHasMore: (this.data.applicationPage * this.data.applicationPageSize) < (applicationsRes.total || 0)
        })
      }
      hideLoading()
    } catch (err) {
      console.error('加载申请记录失败:', err)
      hideLoading()
    }
  },

  async loadData() {
    try {
      showLoading()
      console.log('=== 房屋数据加载 ===')
      
      // 并发加载房屋列表和申请记录
      const [housesRes, applicationsRes] = await Promise.all([
        ownerAPI.getHouseCards(),
        this.loadApplicationsByStatus().catch(err => {
          console.warn('加载申请记录失败（非致命）:', err)
          return { items: [], total: 0 }
        })
      ])

      console.log('housesRes:', housesRes)
      console.log('applicationsRes:', applicationsRes)

      // 处理房屋列表响应
      let houses = []
      if (housesRes && housesRes.success) {
        if (housesRes.data && housesRes.data.items) {
          houses = housesRes.data.items
        } else if (Array.isArray(housesRes.data)) {
          houses = housesRes.data
        }
      }

      // 处理申请记录
      if (applicationsRes && applicationsRes.items) {
        this.setData({
          applications: applicationsRes.items,
          applicationTotal: applicationsRes.total || 0,
          applicationHasMore: (this.data.applicationPage * this.data.applicationPageSize) < (applicationsRes.total || 0)
        })
      }

      this.setData({
        houses: houses,
        loading: false
      })

      hideLoading()
    } catch (err) {
      console.error('加载房屋列表失败:', err)
      hideLoading()
      showToast('加载失败，请稍后重试')
      this.setData({ loading: false })
    }
  },

  // 按状态加载申请记录
  async loadApplicationsByStatus() {
    try {
      const filter = this.data.statusFilters[this.data.activeStatusFilter]
      const res = await ownerAPI.getHouseApplicationsByStatus(
        filter.verified,
        filter.value,
        this.data.applicationPage,
        this.data.applicationPageSize
      )

      console.log('按状态查询申请记录:', res)

      if (res && res.success && res.data) {
        return res.data
      }
      return { items: [], total: 0 }
    } catch (err) {
      console.error('加载申请记录失败:', err)
      return { items: [], total: 0 }
    }
  },

  // 选择状态过滤
  async selectStatusFilter(e) {
    let index = e.currentTarget.dataset.index
    
    // 如果是字符串类型，转换为数字
    if (typeof index === 'string') {
      index = parseInt(index)
    }
    
    if (this.data.activeStatusFilter === index) return

    this.setData({
      activeStatusFilter: index,
      applicationPage: 1,
      applications: [],
      loading: true
    })

    try {
      const applicationsRes = await this.loadApplicationsByStatus()
      this.setData({
        applications: applicationsRes.items || [],
        applicationTotal: applicationsRes.total || 0,
        applicationHasMore: (this.data.applicationPage * this.data.applicationPageSize) < (applicationsRes.total || 0),
        loading: false
      })
    } catch (err) {
      console.error('过滤申请记录失败:', err)
      this.setData({
        applications: [],
        loading: false
      })
    }
  },

  // 加载更多申请记录
  async loadMoreApplications() {
    if (this.data.loading || !this.data.applicationHasMore) return

    this.setData({
      applicationPage: this.data.applicationPage + 1,
      loading: true
    })

    try {
      const applicationsRes = await this.loadApplicationsByStatus()
      this.setData({
        applications: [...this.data.applications, ...(applicationsRes.items || [])],
        applicationHasMore: (this.data.applicationPage * this.data.applicationPageSize) < (applicationsRes.total || 0),
        loading: false
      })
    } catch (err) {
      console.error('加载更多申请记录失败:', err)
      showToast('加载失败，请稍后重试')
      this.setData({
        applicationPage: this.data.applicationPage - 1,
        loading: false
      })
    }
  },

  // 切换Tab
  async switchTab(e) {
    let index = e.currentTarget.dataset.index
    
    // 关键：将data-index从字符串转换为数字
    if (typeof index === 'string') {
      index = parseInt(index)
    }
    
    if (this.data.activeTab === index) return
    
    this.setData({
      activeTab: index,
      loading: true
    })

    // 如果切换到申请记录标签（index === 1），加载数据
    if (index === 1) {
      try {
        const applicationsRes = await this.loadApplicationsByStatus()
        this.setData({
          applications: applicationsRes.items || [],
          applicationTotal: applicationsRes.total || 0,
          applicationHasMore: (this.data.applicationPage * this.data.applicationPageSize) < (applicationsRes.total || 0),
          loading: false
        })
      } catch (err) {
        console.error('切换到申请记录时加载失败:', err)
        this.setData({
          applications: [],
          applicationTotal: 0,
          applicationHasMore: false,
          loading: false
        })
      }
    } else {
      // 切换到房屋列表（index === 0）
      this.setData({
        loading: false
      })
    }
  },

  // 加载更多房屋（如果使用分页）
  loadMoreHouses() {
    if (this.data.loading || !this.data.hasMore) return
    
    this.setData({ page: this.data.page + 1 })
    this.loadMoreData()
  },

  async loadMoreData() {
    try {
      const res = await ownerAPI.getMyHouses(this.data.page, this.data.pageSize)
      
      if (res && res.success && res.data) {
        const newHouses = res.data.items || []
        this.setData({
          houses: [...this.data.houses, ...newHouses],
          total: res.data.total,
          hasMore: (this.data.page * this.data.pageSize) < res.data.total
        })
      }
    } catch (err) {
      console.error('加载更多失败:', err)
      showToast('加载更多失败')
    }
  },

  // 查看详情
  viewDetail(e) {
    console.log('🏠 房屋卡片被点击了')
    console.log('e:', e)
    console.log('currentTarget:', e.currentTarget)
    console.log('currentTarget.dataset:', e.currentTarget.dataset)
    
    const houseId = e.currentTarget.dataset.houseId
    console.log('📌 房屋ID:', houseId)
    
    if (!houseId) {
      console.error('❌ 房屋ID为空，无法跳转')
      return
    }
    
    console.log('✅ 跳转到房屋详情页，ID:', houseId)
    wx.navigateTo({
      url: `/pages/owner/profile/house/detail/detail?id=${houseId}`,
      success() {
        console.log('✅ 页面跳转成功')
      },
      fail(err) {
        console.error('❌ 页面跳转失败:', err)
        showToast('页面加载失败')
      }
    })
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

  // 申请关联房屋
  applyHouse() {
    wx.navigateTo({
      url: '/pages/owner/profile/house/apply'
    })
  }
})

