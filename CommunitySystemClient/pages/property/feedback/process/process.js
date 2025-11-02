// pages/property/feedback/process/process.js
const { staffAPI } = require('../../../../utils/api.js')
const { showLoading, hideLoading, showToast, showSuccess } = require('../../../../utils/util.js')

Page({
  data: {
    id: '',
    issue: {},
    processPlan: '',  // 处理方案
    resultDescription: '',  // 处理结果
    uploadedImages: [],  // 处理过程图片
    maxImages: 9,
    loading: false,
    submitting: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id })
      this.loadIssueDetail()
    }
  },

  async loadIssueDetail() {
    try {
      showLoading('加载中...')
      const res = await staffAPI.getIssueDetail(this.data.id)
      
      if (res && res.success && res.data) {
        const issue = res.data
        this.setData({
          issue: issue,
          processPlan: issue.processPlan || ''
        })
      } else {
        showToast('加载失败')
      }
      hideLoading()
    } catch (err) {
      hideLoading()
      showToast('加载失败，请稍后重试')
    }
  },

  // 处理方案输入
  onPlanDescriptionInput(e) {
    this.setData({
      processPlan: e.detail.value
    })
  },

  // 处理结果描述输入
  onResultDescriptionInput(e) {
    this.setData({
      resultDescription: e.detail.value
    })
  },

  // 选择图片
  chooseImage() {
    const remaining = this.data.maxImages - this.data.uploadedImages.length
    if (remaining <= 0) {
      showToast(`图片最多上传${this.data.maxImages}张`)
      return
    }

    wx.chooseImage({
      count: remaining,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = [...this.data.uploadedImages, ...res.tempFilePaths]
        this.setData({
          uploadedImages: newImages.slice(0, this.data.maxImages)
        })
      }
    })
  },

  // 删除图片
  deleteImage(e) {
    const { index } = e.currentTarget.dataset
    const images = [...this.data.uploadedImages]
    images.splice(index, 1)
    this.setData({
      uploadedImages: images
    })
  },

  // 预览图片
  previewImage(e) {
    const { index, urls } = e.currentTarget.dataset
    const urlArray = urls || this.data.uploadedImages
    
    if (!urlArray || urlArray.length === 0) return
    
    wx.previewImage({
      urls: urlArray,
      current: urlArray[index]
    })
  },

  // 提交处理结果
  async onSubmit() {
    // 表单验证
    if (!this.data.processPlan.trim()) {
      showToast('请输入处理方案')
      return
    }

    if (!this.data.resultDescription.trim()) {
      showToast('请输入处理结果描述')
      return
    }

    if (this.data.uploadedImages.length === 0) {
      showToast('请上传至少一张处理过程图片')
      return
    }

    try {
      showLoading('提交中...')
      this.setData({ submitting: true })

      // 构建完整的提交数据
      const submitData = {
        planDescription: this.data.processPlan.trim(),
        resultDescription: this.data.resultDescription.trim(),
        processImages: this.data.uploadedImages,  // 直接传递图片路径数组
        resultImages: []  // 暂时为空，因为当前设计中没有分开的结果图片
      }

      // 调用API提交
      const res = await staffAPI.submitProcessResultWithImages(this.data.id, submitData)

      hideLoading()

      if (res && res.success) {
        showSuccess('处理结果已提交')
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        showToast(res.message || '提交失败，请重试')
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