// pages/owner/feedback/submit/submit.js
const { ownerAPI } = require('../../../../utils/api.js')
const { showLoading, hideLoading, showToast, showSuccess, chooseImage, previewImage } = require('../../../../utils/util.js')

Page({
  data: {
    formData: {
      title: '',
      description: '',
      issueType: '维修',
      location: '',
      urgency: '中'
    },
    issueTypes: ['维修', '投诉', '建议', '咨询', '其他'],
    urgencyLevels: ['低', '中', '高', '紧急'],
    urgencyClassMap: {
      '低': 'low',
      '中': 'medium',
      '高': 'high',
      '紧急': 'critical'
    },
    images: [],
    maxImages: 6
  },

  // 获取紧急程度的CSS类名
  getUrgencyClass() {
    const urgency = this.data.formData.urgency
    return this.data.urgencyClassMap[urgency] || 'medium'
  },

  // 输入标题
  onTitleInput(e) {
    this.setData({
      'formData.title': e.detail.value
    })
  },

  // 输入描述
  onDescriptionInput(e) {
    this.setData({
      'formData.description': e.detail.value
    })
  },

  // 选择问题类型
  onIssueTypeChange(e) {
    this.setData({
      'formData.issueType': this.data.issueTypes[e.detail.value]
    })
  },

  // 输入位置
  onLocationInput(e) {
    this.setData({
      'formData.location': e.detail.value
    })
  },

  // 选择紧急程度
  onUrgencyChange(e) {
    const urgency = this.data.urgencyLevels[e.detail.value]
    this.setData({
      'formData.urgency': urgency
    })
  },

  // 选择图片
  async chooseImages() {
    try {
      const count = this.data.maxImages - this.data.images.length
      if (count <= 0) {
        showToast('最多上传6张图片')
        return
      }

      const tempImages = await chooseImage(count)
      this.setData({
        images: [...this.data.images, ...tempImages]
      })
    } catch (err) {
      console.error('选择图片失败:', err)
    }
  },

  // 预览图片
  previewImage(e) {
    const { url } = e.currentTarget.dataset
    previewImage(url, this.data.images)
  },

  // 删除图片
  deleteImage(e) {
    const { index } = e.currentTarget.dataset
    const images = [...this.data.images]
    images.splice(index, 1)
    this.setData({ images })
  },

  // 提交问题
  async handleSubmit() {
    const { formData, images } = this.data

    // 表单验证
    if (!formData.title.trim()) {
      showToast('请输入问题标题')
      return
    }
    if (!formData.description.trim()) {
      showToast('请描述问题详情')
      return
    }

    try {
      showLoading('提交中...')

      // 如果有图片，先上传到后端
      let additionalImages = ''
      if (images && images.length > 0) {
        console.log('📤 开始上传图片到后端...')
        additionalImages = await this.uploadImages(images)
        console.log('✅ 图片上传完成:', additionalImages)
      }

      // 构建提交数据 - 字段名必须与后端DTO匹配
      const submitData = {
        issueTitle: formData.title,              // 对应后端的issueTitle
        issueContent: formData.description,       // 对应后端的issueContent
        issueType: formData.issueType,           // 对应后端的issueType
        specificLocation: formData.location,     // 对应后端的specificLocation
        urgencyLevel: this.mapUrgency(formData.urgency), // 对应后端的urgencyLevel
        contactName: '',                         // 可选字段
        contactPhone: '',                        // 可选字段
        bestContactTime: '',                     // 可选字段
        additionalImages: additionalImages        // 对应后端的additionalImages，已上传到阿里云
      }

      console.log('📤 发送反馈数据:', submitData)

      const res = await ownerAPI.submitIssue(submitData)

      hideLoading()

      console.log('✅ 后端响应:', res)

      if (res.success) {
        showSuccess('提交成功')
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        showToast(res.message || '提交失败')
      }
    } catch (err) {
      hideLoading()
      console.error('❌ 提交反馈失败:', err)
      showToast('提交失败：' + (err.message || '未知错误'))
    }
  },

  // 上传图片到后端
  async uploadImages(images) {
    const uploadedUrls = []
    
    for (let i = 0; i < images.length; i++) {
      try {
        const filePath = images[i]
        console.log(`上传第 ${i + 1}/${images.length} 张图片: ${filePath}`)
        
        const url = await this.uploadSingleImage(filePath)
        uploadedUrls.push(url)
      } catch (err) {
        console.error(`上传第 ${i + 1} 张图片失败:`, err)
        throw new Error(`第 ${i + 1} 张图片上传失败: ${err.message}`)
      }
    }
    
    // 将URL数组转换为逗号分隔的字符串
    return uploadedUrls.join(',')
  },

  // 上传单个图片
  uploadSingleImage(filePath) {
    return new Promise((resolve, reject) => {
      const app = getApp()
      const token = app.getToken()
      
      wx.uploadFile({
        url: 'http://localhost:8081/api/owner/upload/issue-image',
        filePath: filePath,
        name: 'file',
        header: {
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          console.log('单个图片上传响应:', res)
          
          if (res.statusCode === 200) {
            try {
              const data = JSON.parse(res.data)
              if (data.success && data.data) {
                resolve(data.data)
              } else {
                reject(new Error(data.message || '上传失败'))
              }
            } catch (e) {
              reject(new Error('服务器响应异常'))
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: 上传失败`))
          }
        },
        fail: (err) => {
          console.error('图片上传失败:', err)
          reject(new Error('网络错误: ' + (err.message || '未知错误')))
        }
      })
    })
  },

  // 将UI紧急程度映射到后端值
  mapUrgency(urgency) {
    const urgencyMap = {
      '低': '低',
      '中': '一般',
      '高': '高',
      '紧急': '紧急'
    }
    return urgencyMap[urgency] || '一般'
  },

  // 重置表单
  handleReset() {
    this.setData({
      formData: {
        title: '',
        description: '',
        issueType: '维修',
        location: '',
        urgency: '中'
      },
      images: []
    })
  }
})

