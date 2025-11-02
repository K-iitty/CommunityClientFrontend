// pages/property/feedback/detail/detail.js
const { staffAPI } = require('../../../../utils/api.js')
const { showLoading, hideLoading, showToast, showSuccess } = require('../../../../utils/util.js')

Page({
  data: {
    id: '',
    issue: {},
    followUps: [],
    loading: false,
    showStartModal: false,
    startPlanDescription: '',
    startPlanValid: false,
    submitting: false,
    staffList: [],  // 可分配的员工列表
    selectedStaffId: null,
    assignRemark: '',
    statusClassMap: {
      '待处理': 'status-pending',
      '处理中': 'status-processing',
      '已完成': 'status-completed'
    }
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id })
      this.loadDetail()
      this.loadFollowUps()
    }
  },

  onShow() {
    // 页面显示时重新加载数据，确保获取最新的追加记录
    if (this.data.id) {
      this.loadFollowUps()
    }
  },

  async loadDetail() {
    try {
      showLoading('加载中...')
      const res = await staffAPI.getIssueDetail(this.data.id)
      
      if (res && res.success && res.data) {
        const issue = res.data
        issue.statusClass = this.data.statusClassMap[issue.issueStatus] || ''
        // 格式化时间
        issue.reportedDate = this.formatDateTime(issue.reportedTime)
        issue.assignedTime = issue.assignedTime ? this.formatDateTime(issue.assignedTime) : '-'
        issue.processStartTime = issue.processStartTime ? this.formatDateTime(issue.processStartTime) : '-'
        issue.actualCompleteTime = issue.actualCompleteTime ? this.formatDateTime(issue.actualCompleteTime) : '-'
        issue.estimatedCompleteTime = issue.estimatedCompleteTime ? this.formatDateTime(issue.estimatedCompleteTime) : '-'
        issue.actualHours = issue.actualHours || 0
        issue.hasCost = issue.hasCost === 1 || issue.hasCost === true
        
        // 确保所有字段都存在 (来自后端API的完整字段)
        issue.id = issue.id || this.data.id
        issue.issueTitle = issue.issueTitle || issue.title || ''
        issue.issueStatus = issue.issueStatus || issue.status || '待处理'
        issue.issueType = issue.issueType || issue.type || '-'
        issue.issueContent = issue.issueContent || issue.description || '-'
        issue.specificLocation = issue.specificLocation || '-'
        issue.urgencyLevel = issue.urgencyLevel || '中'
        issue.contactName = issue.contactName || (issue.owner && issue.owner.name) || '-'
        issue.contactPhone = issue.contactPhone || (issue.owner && issue.owner.phone) || '-'
        issue.ownerId = issue.ownerId || '-'
        issue.bestContactTime = issue.bestContactTime || '-'
        issue.houseId = issue.houseId || '-'
        issue.processPlan = issue.processPlan || '-'
        issue.processResult = issue.processResult || '-'
        issue.assignedDepartmentId = issue.assignedDepartmentId || '-'
        issue.materialCost = issue.materialCost || 0
        issue.laborCost = issue.laborCost || 0
        issue.totalCost = issue.totalCost || 0
        issue.costPaymentStatus = issue.costPaymentStatus || '-'
        
        this.setData({ issue: issue })
      } else {
        showToast(res?.message || '加载失败')
      }
      hideLoading()
    } catch (err) {
      console.error('加载详情失败:', err)
      hideLoading()
      showToast('加载失败: ' + err.message)
    }
  },

  async loadFollowUps() {
    try {
      const res = await staffAPI.getFollowUps(this.data.id, 1, 100)
      
      // 检查响应结构
      console.log('获取跟进记录响应:', res)
      
      // 后端返回格式: { page, size, total, pages, items }
      if (res && (res.success !== false) && res.items) {
        const followUps = (res.items || []).map(item => {
          item.createdDate = this.formatDateTime(item.createdAt)
          return item
        })
        console.log('处理后的跟进记录:', followUps)
        this.setData({ followUps: followUps })
      } else if (res && res.data && res.data.items) {
        // 备选格式处理
        const followUps = (res.data.items || []).map(item => {
          item.createdDate = this.formatDateTime(item.createdAt)
          return item
        })
        this.setData({ followUps: followUps })
      } else {
        console.warn('未找到跟进记录或格式不对:', res)
        this.setData({ followUps: [] })
      }
    } catch (err) {
      console.error('加载跟进记录失败:', err)
      this.setData({ followUps: [] })
    }
  },

  formatDateTime(time) {
    if (!time) return ''
    const date = new Date(time)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  },

  // 开始处理
  onStartProcessing() {
    if (this.data.issue.issueStatus === '处理中') {
      showToast('已在处理中')
      return
    }
    // 显示模态框而不是直接导航
    this.setData({ 
      showStartModal: true,
      startPlanDescription: ''
    })
  },

  // 关闭开始处理模态框
  onCloseStartModal() {
    this.setData({ 
      showStartModal: false,
      startPlanDescription: ''
    })
  },

  // 处理计划输入
  onStartPlanInput(e) {
    const value = e.detail.value || ''
    const trimmedValue = value.trim()
    this.setData({
      startPlanDescription: value,
      startPlanValid: trimmedValue.length > 0
    })
  },

  // 确认开始处理
  async onConfirmStart() {
    const plan = this.data.startPlanDescription.trim()
    if (!plan) {
      showToast('请输入处理方案')
      return
    }

    try {
      showLoading('处理中...')
      this.setData({ submitting: true })

      // 调用后端API开始处理
      const res = await staffAPI.startProcessing(this.data.id, {
        processPlan: plan
      })

      hideLoading()

      if (res && res.success) {
        showSuccess('处理已开始')
        this.setData({ 
          showStartModal: false,
          startPlanDescription: ''
        })
        // 重新加载详情和跟进记录
        setTimeout(() => {
          this.loadDetail()
          this.loadFollowUps()
        }, 500)
      } else {
        showToast(res.message || '开始处理失败')
      }
    } catch (err) {
      hideLoading()
      console.error('开始处理失败:', err)
      showToast('开始处理失败: ' + err.message)
    } finally {
      this.setData({ submitting: false })
    }
  },

  // 分配问题
  onAssignIssue() {
    wx.showModal({
      title: '分配问题',
      content: '请输入员工ID进行分配',
      editable: true,
      placeholderText: '员工ID',
      success: async (res) => {
        if (res.confirm && res.content) {
          try {
            showLoading('分配中...')
            const result = await staffAPI.assignIssue(this.data.id, {
              staffId: parseInt(res.content),
              remark: this.data.assignRemark
            })
            hideLoading()
            if (result && result.success) {
              showSuccess('分配成功')
              this.loadDetail()
            } else {
              showToast('分配失败')
            }
          } catch (err) {
            hideLoading()
            showToast('分配失败')
          }
        }
      }
    })
  },

  // 重新分配
  onReassignIssue() {
    wx.showModal({
      title: '重新分配',
      content: '请输入新员工ID',
      editable: true,
      placeholderText: '新员工ID',
      success: async (res) => {
        if (res.confirm && res.content) {
          try {
            showLoading('重新分配中...')
            const result = await staffAPI.reassignIssue(this.data.id, {
              newStaffId: parseInt(res.content),
              remark: '需要重新分配'
            })
            hideLoading()
            if (result && result.success) {
              showSuccess('重新分配成功')
              this.loadDetail()
            } else {
              showToast('重新分配失败')
            }
          } catch (err) {
            hideLoading()
            showToast('重新分配失败')
          }
        }
      }
    })
  },

  // 标记为已解决
  onMarkResolved() {
    wx.showModal({
      title: '确认标记为已解决',
      content: '确定要标记这个问题为已解决吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            showLoading('更新中...')
            const result = await staffAPI.markAsResolved(this.data.id)
            hideLoading()
            if (result && result.success) {
              showSuccess('已标记为已解决')
              setTimeout(() => {
                wx.navigateBack()
              }, 1500)
            } else {
              showToast('更新失败')
            }
          } catch (err) {
            hideLoading()
            showToast('更新失败')
          }
        }
      }
    })
  },

  // 添加跟进
  onAddFollowUp() {
    wx.navigateTo({
      url: `/pages/property/feedback/follow-up/follow-up?issueId=${this.data.id}`
    })
  },

  // 返回上一页
  onBack() {
    wx.navigateBack()
  }
})