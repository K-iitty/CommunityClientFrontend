// pages/property/department/department.js
// 部门管理 - 部门信息页面
const { staffAPI } = require('../../../utils/api.js')
const { showToast, showLoading, hideLoading } = require('../../../utils/util.js')

Page({
  data: {
    department: null,
    members: [],
    statistics: null,
    
    loading: true,
    empty: false,
    
    // 标签页
    activeTab: 'info',
    tabs: [
      { id: 'info', label: '部门信息' },
      { id: 'members', label: '团队成员' }
    ]
  },

  onLoad() {
    this.loadDepartmentData()
  },

  onShow() {
    // 每次显示时刷新数据
    this.loadDepartmentData()
  },

  // 加载部门数据
  async loadDepartmentData() {
    try {
      this.setData({ loading: true })
      showLoading('加载中...')

      // 并行加载数据
      const [deptRes, membersRes, statsRes] = await Promise.all([
        staffAPI.getMyDepartment(),
        staffAPI.getDepartmentMembers(),
        staffAPI.getDepartmentTaskStatistics()
      ])

      hideLoading()

      if (deptRes && deptRes.success && deptRes.data) {
        this.setData({
          department: deptRes.data,
          members: (membersRes && membersRes.data) || [],
          statistics: (statsRes && statsRes.data) || {},
          loading: false,
          empty: false
        })
      } else {
        showToast('加载失败')
        this.setData({ empty: true, loading: false })
      }
    } catch (err) {
      hideLoading()
      console.error('加载部门数据失败:', err)
      showToast('加载失败')
      this.setData({ empty: true, loading: false })
    }
  },

  // 切换标签页
  switchTab(e) {
    const { id } = e.currentTarget.dataset
    this.setData({ activeTab: id })
  },

  // 获取职位颜色
  getPositionColor(position) {
    const colorMap = {
      'manager': '#7c3aed',
      'supervisor': '#0ea5e9',
      'staff': '#10b981',
      'admin': '#ef4444',
      '经理': '#7c3aed',
      '主管': '#0ea5e9',
      '秩序员': '#10b981',
      '管理员': '#ef4444'
    }
    return colorMap[position] || '#6b7280'
  }
})