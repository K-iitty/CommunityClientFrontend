// pages/property/feedback/follow-up/follow-up.js
const { staffAPI } = require('../../../../utils/api.js')
const { showLoading, hideLoading, showToast, showSuccess } = require('../../../../utils/util.js')

Page({
  data: {
    issueId: '',
    followUpType: '',
    followUpContent: '',
    internalNote: '',
    loading: false,
    submitting: false,
    followUpTypes: [
      { label: '处理进展', value: '处理进展' },
      { label: '延期说明', value: '延期说明' },
      { label: '协调记录', value: '协调记录' },
      { label: '其他', value: '其他' }
    ]
  },

  onLoad(options) {
    if (options.issueId) {
      this.setData({ issueId: options.issueId })
    }
  },

  // 选择追加类型
  onFollowUpTypeChange(e) {
    const value = e.currentTarget.dataset.value
    console.log('选择类型:', value)
    this.setData({ followUpType: value })
  },

  // 追加内容输入
  onFollowUpContentInput(e) {
    this.setData({
      followUpContent: e.detail.value
    })
  },

  // 内部备注输入
  onInternalNoteInput(e) {
    this.setData({
      internalNote: e.detail.value
    })
  },

  // 提交追加
  async onSubmit() {
    // 表单验证
    if (!this.data.followUpType) {
      showToast('请选择追加类型')
      return
    }

    if (!this.data.followUpContent.trim()) {
      showToast('请输入追加内容')
      return
    }

    try {
      showLoading('提交中...')
      this.setData({ submitting: true })

      // 构建提交数据
      const submitData = {
        followUpType: this.data.followUpType,
        followUpContent: this.data.followUpContent.trim(),
        internalNote: this.data.internalNote.trim()
      }

      // 调用API提交
      const res = await staffAPI.addFollowUp(this.data.issueId, submitData)

      hideLoading()

      if (res && res.success) {
        showSuccess('追加记录已保存')
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        showToast(res?.message || '提交失败，请重试')
      }
    } catch (err) {
      hideLoading()
      console.error('提交失败:', err)
      showToast('提交失败，请检查网络后重试')
    } finally {
      this.setData({ submitting: false })
    }
  },

  // 返回上一页
  onBack() {
    wx.navigateBack()
  }
})