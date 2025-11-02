// pages/property/notice/add/add.js
// 公告管理 - 新增公告页面
const { staffAPI } = require('../../../../utils/api.js')
const { showToast, showLoading, hideLoading } = require('../../../../utils/util.js')

Page({
  data: {
    // 表单数据
    noticeTitle: '',
    noticeContent: '',
    category: '',
    remarks: '',
    
    // 分类选项
    categories: [
      { id: '', name: '请选择分类' },
      { id: '社区公告', name: '社区公告' },
      { id: '温馨提示', name: '温馨提示' },
      { id: '活动公告', name: '活动公告' },
      { id: '紧急通知', name: '紧急通知' }
    ],
    categoryIndex: 0,
    
    // 图片上传
    images: [],
    maxImages: 3,
    
    // 提交状态
    submitting: false,
    errors: {}
  },

  onLoad() {
    // 初始化页面
  },

  // 标题输入
  onTitleInput(e) {
    this.setData({ noticeTitle: e.detail.value })
    this.validateField('noticeTitle')
  },

  // 内容输入
  onContentInput(e) {
    this.setData({ noticeContent: e.detail.value })
    this.validateField('noticeContent')
  },

  // 备注输入
  onRemarksInput(e) {
    this.setData({ remarks: e.detail.value })
  },

  // 分类选择
  onCategoryChange(e) {
    const index = e.detail.value
    const category = this.data.categories[index]
    this.setData({
      categoryIndex: index,
      category: category.id
    })
    this.validateField('category')
  },

  // 选择图片
  selectImages() {
    const { images, maxImages } = this.data
    const remaining = maxImages - images.length

    if (remaining <= 0) {
      showToast('最多上传3张图片')
      return
    }

    wx.chooseMedia({
      count: remaining,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB per image
        
        const newImages = res.tempFiles
          .filter(file => {
            if (file.size > MAX_FILE_SIZE) {
              showToast(`图片过大 (${(file.size / 1024 / 1024).toFixed(1)}MB)，请选择小于10MB的图片`)
              return false
            }
            return true
          })
          .map(file => ({
            tempFilePath: file.tempFilePath,
            size: file.size
          }))
        
        if (newImages.length > 0) {
          this.setData({
            images: [...images, ...newImages]
          })
        }
      }
    })
  },

  // 删除图片
  deleteImage(e) {
    const { index } = e.currentTarget.dataset
    const { images } = this.data
    images.splice(index, 1)
    this.setData({ images })
  },

  // 预览图片
  previewImage(e) {
    const { index } = e.currentTarget.dataset
    const urls = this.data.images.map(img => img.tempFilePath)
    wx.previewImage({
      urls: urls,
      current: urls[index]
    })
  },

  // 字段验证
  validateField(fieldName) {
    const errors = this.data.errors
    
    switch (fieldName) {
      case 'noticeTitle':
        if (!this.data.noticeTitle.trim()) {
          errors.noticeTitle = '标题不能为空'
        } else if (this.data.noticeTitle.length > 100) {
          errors.noticeTitle = '标题长度不超过100字'
        } else {
          delete errors.noticeTitle
        }
        break
      case 'noticeContent':
        if (!this.data.noticeContent.trim()) {
          errors.noticeContent = '内容不能为空'
        } else if (this.data.noticeContent.length > 5000) {
          errors.noticeContent = '内容长度不超过5000字'
        } else {
          delete errors.noticeContent
        }
        break
      case 'category':
        if (!this.data.category) {
          errors.category = '请选择分类'
        } else {
          delete errors.category
        }
        break
    }
    
    this.setData({ errors })
  },

  // 验证所有字段
  validateForm() {
    this.validateField('noticeTitle')
    this.validateField('noticeContent')
    this.validateField('category')

    return Object.keys(this.data.errors).length === 0
  },

  // 上传图片到服务器
  async uploadImages() {
    const { images } = this.data
    if (images.length === 0) return []

    const uploadedImages = []
    for (let i = 0; i < images.length; i++) {
      try {
        const image = images[i]
        showLoading(`上传图片 ${i + 1}/${images.length}...`)
        console.log(`开始上传图片 ${i + 1}:`, image)

        const res = await staffAPI.uploadImage(image.tempFilePath)
        console.log(`图片 ${i + 1} 上传响应:`, res)
        
        if (res && res.success && res.data) {
          // 优先使用 imageUrl，否则拼接URL
          let imageUrl = res.data.imageUrl
          
          if (!imageUrl) {
            // 如果没有imageUrl，尝试使用path拼接完整URL
            if (res.data.path) {
              imageUrl = `https://oss-cn-beijing.aliyuncs.com/smart-community-system/${res.data.path}`
            } else {
              // 最后的备选方案 - res.data可能直接是URL
              imageUrl = typeof res.data === 'string' ? res.data : null
            }
          }
          
          // 确保URL是HTTPS
          if (imageUrl && !imageUrl.startsWith('https://')) {
            imageUrl = 'https://' + imageUrl
          }
          
          if (!imageUrl) {
            throw new Error('无法获取图片URL')
          }
          
          console.log(`图片 ${i + 1} URL:`, imageUrl)
          uploadedImages.push(imageUrl)
        } else {
          console.error(`图片 ${i + 1} 上传失败:`, res)
          throw new Error(res?.message || '上传失败')
        }
      } catch (err) {
        console.error(`上传图片 ${i + 1} 失败:`, err)
        showToast('图片上传失败: ' + (err.message || err))
        return null
      }
    }

    return uploadedImages
  },

  // 提交表单
  async submitForm() {
    if (!this.validateForm()) {
      showToast('请填写完整信息')
      return
    }

    if (this.data.submitting) return

    this.setData({ submitting: true })
    showLoading('发布中...')

    try {
      // 上传图片
      let imageUrls = []
      if (this.data.images.length > 0) {
        console.log(`准备上传 ${this.data.images.length} 张图片`)
        imageUrls = await this.uploadImages()
        if (!imageUrls) {
          this.setData({ submitting: false })
          return
        }
        console.log('所有图片上传成功:', imageUrls)
      }

      hideLoading()
      showLoading('保存中...')

      // 获取当前时间并格式化为后端期望的格式 (yyyy-MM-dd'T'HH:mm:ss)
      const now = new Date()
      const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30天后
      
      // 时间格式化函数：将Date转换为 yyyy-MM-dd'T'HH:mm:ss 格式
      const formatDateTime = (date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        const seconds = String(date.getSeconds()).padStart(2, '0')
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
      }
      
      const startTime = formatDateTime(now)
      const endTime = formatDateTime(endDate)
      
      console.log('格式化后的时间:', { startTime, endTime })

      // 提交表单 - 使用所有必需参数
      const noticeData = {
        communityId: 1, // TODO: 需要获取真实的社区ID
        title: this.data.noticeTitle.trim(),
        content: this.data.noticeContent.trim(),
        noticeType: this.data.category, // 后端期望 noticeType 字段
        startTime: startTime,
        endTime: endTime,
        remark: this.data.remarks.trim(),
        imageUrls: imageUrls.length > 0 ? imageUrls : null,
        // 可选字段
        targetAudience: '全体业主',
        isUrgent: 0,
        isTop: 0
      }

      console.log('提交公告数据:', noticeData)
      const res = await staffAPI.createNoticeWithJson(noticeData)
      console.log('创建公告响应:', res)

      hideLoading()

      if (res && res.success) {
        showToast('发布成功')
        setTimeout(() => {
          wx.navigateBack()
        }, 1000)
      } else {
        showToast('发布失败，请重试: ' + (res?.message || '未知错误'))
      }
    } catch (err) {
      hideLoading()
      console.error('提交失败:', err)
      showToast('提交失败，请重试: ' + (err.message || err))
    } finally {
      this.setData({ submitting: false })
    }
  },

  // 返回
  goBack() {
    wx.navigateBack()
  }
})