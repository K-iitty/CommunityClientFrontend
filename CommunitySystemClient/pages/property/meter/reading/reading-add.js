// pages/property/meter/reading/reading-add.js
const { staffAPI } = require('../../../../utils/api.js')
const { showLoading, hideLoading, showToast } = require('../../../../utils/util.js')

Page({
  data: {
    meterId: null,
    categoryName: '',
    meterType: '',
    meterName: '',  // 添加仪表名称
    meterCode: '',
    
    // 必填字段
    previousReading: '',
    currentReading: '',
    usageAmount: '',
    readingDate: '',
    
    // 非必填字段
    readingTime: new Date().getHours().toString().padStart(2, '0') + ':' + new Date().getMinutes().toString().padStart(2, '0'),
    unit: '',
    readingType: '手动',
    readingStatus: '正常',
    abnormalReason: '',
    remark: '',
    
    readingTypes: ['手动', '自动'],
    readingStatuses: ['正常', '异常'],
    submitting: false
  },

  onLoad(options) {
    // 从路由参数中获取仪表信息
    if (options.meterId) {
      this.setData({
        meterId: parseInt(options.meterId),
        categoryName: options.categoryName || '',
        meterType: options.meterType || '',
        meterName: options.meterName || '',  // 接收仪表名称
        meterCode: options.meterCode || ''
      })
    }

    // 设置默认日期为今天
    const today = this.getDateString(new Date())
    this.setData({
      readingDate: today
    })
  },

  getDateString(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  // 上次读数变化
  onPreviousReadingChange(e) {
    const value = e.detail.value
    this.setData({ previousReading: value })
    this.calculateUsage()
  },

  // 本次读数变化
  onCurrentReadingChange(e) {
    const value = e.detail.value
    this.setData({ currentReading: value })
    this.calculateUsage()
  },

  // 自动计算用量
  calculateUsage() {
    const { previousReading, currentReading } = this.data
    if (previousReading && currentReading) {
      const prev = parseFloat(previousReading) || 0
      const curr = parseFloat(currentReading) || 0
      const usage = Math.max(0, curr - prev)
      this.setData({ usageAmount: usage.toFixed(2) })
    }
  },

  // 抄表日期变化
  onReadingDateChange(e) {
    this.setData({ readingDate: e.detail.value })
  },

  // 抄表时间变化
  onReadingTimeChange(e) {
    this.setData({ readingTime: e.detail.value })
  },

  // 计量单位变化
  onUnitChange(e) {
    this.setData({ unit: e.detail.value })
  },

  // 抄表类型变化
  onReadingTypeChange(e) {
    const index = parseInt(e.detail.value)
    this.setData({ readingType: this.data.readingTypes[index] })
  },

  // 抄表状态变化
  onReadingStatusChange(e) {
    const index = parseInt(e.detail.value)
    this.setData({ readingStatus: this.data.readingStatuses[index] })
  },

  // 异常原因变化
  onAbnormalReasonChange(e) {
    this.setData({ abnormalReason: e.detail.value })
  },

  // 备注变化
  onRemarkChange(e) {
    this.setData({ remark: e.detail.value })
  },

  // 表单验证
  validateForm() {
    const { previousReading, currentReading, usageAmount, readingDate, readingStatus, abnormalReason } = this.data
    
    if (!previousReading && previousReading !== 0 && previousReading !== '0') {
      showToast('请输入上次读数', 'error')
      return false
    }

    if (!currentReading && currentReading !== 0 && currentReading !== '0') {
      showToast('请输入本次读数', 'error')
      return false
    }

    if (!usageAmount && usageAmount !== 0 && usageAmount !== '0') {
      showToast('用量计算异常，请检查读数', 'error')
      return false
    }

    if (!readingDate) {
      showToast('请选择抄表日期', 'error')
      return false
    }

    if (readingStatus === '异常' && !abnormalReason.trim()) {
      showToast('抄表异常需要填写原因', 'error')
      return false
    }

    return true
  },

  // 提交表单
  async submitForm() {
    if (!this.validateForm()) return

    this.setData({ submitting: true })
    showLoading('提交中...')

    try {
      const { meterId, previousReading, currentReading, usageAmount, readingDate, readingTime, unit, readingType, readingStatus, abnormalReason, remark } = this.data

      const params = {
        meterId: parseInt(meterId),
        previousReading: parseFloat(previousReading),
        currentReading: parseFloat(currentReading),
        usageAmount: parseFloat(usageAmount),
        readingDate: readingDate.trim(),
        readingTime: readingTime && readingTime.trim() ? readingTime.trim() : new Date().getHours().toString().padStart(2, '0') + ':' + new Date().getMinutes().toString().padStart(2, '0'),
        readingType: readingType.trim(),
        readingStatus: readingStatus.trim()
      }

      // 非必填字段
      if (unit && unit.trim()) {
        params.unit = unit.trim()
      }
      if (abnormalReason && abnormalReason.trim()) {
        params.abnormalReason = abnormalReason.trim()
      }
      if (remark && remark.trim()) {
        params.remark = remark.trim()
      }

      console.log('提交抄表记录:', JSON.stringify(params, null, 2))

      const res = await staffAPI.addMeterReading(params)

      hideLoading()

      if (res && res.success) {
        showToast('抄表记录添加成功')
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        showToast(res?.message || '添加失败', 'error')
      }
    } catch (err) {
      hideLoading()
      console.error('提交抄表记录失败:', err)
      showToast('提交失败，请稍后重试', 'error')
    } finally {
      this.setData({ submitting: false })
    }
  },

  // 返回上一页
  goBack() {
    wx.navigateBack()
  }
})
