// pages/owner/profile/property-contact/property-contact.js
const { ownerAPI } = require('../../../../utils/api.js')
const { showLoading, hideLoading, showToast } = require('../../../../utils/util.js')

Page({
  data: {
    staff: [],
    loading: true,
    activeStaffId: null,
    expandedStaffId: null,
    page: 1,
    size: 10,
    total: 0,
    pages: 0,
    hasMore: true
  },

  onLoad() {
    this.loadPropertyInfo()
  },

  onShow() {
    // 设置TabBar
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3
      })
    }
  },

  onPullDownRefresh() {
    this.setData({ page: 1, staff: [] })
    this.loadPropertyInfo()
  },

  onReachBottom() {
    // 如果还有更多数据，自动加载下一页
    if (this.data.hasMore && this.data.page < this.data.pages) {
      this.loadMorePropertyInfo()
    }
  },

  async loadPropertyInfo() {
    try {
      showLoading()
      const res = await ownerAPI.getCommunityStaffInfo(this.data.page, this.data.size)

      console.log('=== 物业信息加载 ===')
      console.log('res:', res)

      if (res && res.success && res.data) {
        const pageData = res.data
        const staff = pageData.items || []

        console.log('员工列表:', staff)
        console.log('分页信息:', { page: pageData.page, total: pageData.total, pages: pageData.pages })

        this.setData({
          staff: staff,
          page: pageData.page,
          total: pageData.total,
          pages: pageData.pages,
          hasMore: pageData.page < pageData.pages,
          loading: false
        })
      } else {
        showToast(res && res.message ? res.message : '加载失败')
        this.setData({ loading: false })
      }

      hideLoading()
    } catch (err) {
      console.error('加载物业信息失败:', err)
      hideLoading()
      showToast('加载失败，请稍后重试')
      this.setData({ loading: false })
    } finally {
      wx.stopPullDownRefresh()
    }
  },

  async loadMorePropertyInfo() {
    try {
      const nextPage = this.data.page + 1
      const res = await ownerAPI.getCommunityStaffInfo(nextPage, this.data.size)

      if (res && res.success && res.data) {
        const pageData = res.data
        const newStaff = pageData.items || []

        this.setData({
          staff: [...this.data.staff, ...newStaff],
          page: pageData.page,
          hasMore: pageData.page < pageData.pages
        })
      }
    } catch (err) {
      console.error('加载更多物业信息失败:', err)
    }
  },

  // 切换员工详情展开
  toggleStaffDetail(e) {
    const { id } = e.currentTarget.dataset
    const expandedId = this.data.expandedStaffId === id ? null : id
    this.setData({
      expandedStaffId: expandedId
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

  // 复制到剪贴板
  copyToClipboard(text) {
    if (!text) return

    wx.setClipboardData({
      data: text,
      success() {
        showToast('已复制到剪贴板')
      },
      fail() {
        showToast('复制失败')
      }
    })
  },

  // 复制电话号码
  copyPhone(e) {
    const { phone } = e.currentTarget.dataset
    this.copyToClipboard(phone)
  },

  // 复制微信
  copyWechat(e) {
    const { wechat } = e.currentTarget.dataset
    this.copyToClipboard(wechat)
  },

  // 复制邮箱
  copyEmail(e) {
    const { email } = e.currentTarget.dataset
    this.copyToClipboard(email)
  }
})
