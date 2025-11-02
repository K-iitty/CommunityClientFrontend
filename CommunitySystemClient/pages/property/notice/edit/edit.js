// pages/property/notice/edit/edit.js
// 公告管理 - 编辑公告页面
const { staffAPI } = require('../../../../utils/api.js')
const { showToast, showLoading, hideLoading } = require('../../../../utils/util.js')

Page({
  data: {
    noticeId: null,
    
    // 基本信息
    title: '',
    content: '',
    noticeType: '社区公告',
    noticeTypeIndex: 0,
    status: '已发布',
    isUrgent: 0,
    isTop: 0,
    
    // 活动信息
    activityDate: '',
    activityTime: '',
    activityLocation: '',
    activityOrganizer: '',
    activityContact: '',
    activityContactPhone: '',
    
    // 生效时间
    startTime: '',
    endTime: '',
    
    // 备注
    remark: '',
    
    // 图片相关
    noticeImages: [],        // 当前已有的公告图片
    noticeImageFiles: [],    // 新上传的公告图片
    noticeImagesToDelete: [], // 需要删除的公告图片
    
    // 选项
    noticeTypeOptions: ['社区公告', '活动公告', '紧急通知', '温馨提示'],
    statusOptions: ['草稿', '已发布', '已撤回', '已过期'],
    
    // 加载和提交状态
    loading: true,
    submitting: false,
    errors: {}
  },

  onLoad(options) {
    const { id } = options
    if (id) {
      this.setData({ noticeId: id })
      this.loadNoticeData(id)
    } else {
      this.setData({ loading: false })
    }
  },

  // 加载公告数据
  async loadNoticeData(id) {
    try {
      showLoading('加载中...')

      const res = await staffAPI.getNoticeDetail(id)

      hideLoading()

      if (res && res.success && res.data) {
        const notice = res.data
        
        // 处理公告图片 - 后端返回的是完整URL，可能是数组或单个字符串
        let noticeImagesList = []
        if (notice.noticeImages) {
          try {
            if (typeof notice.noticeImages === 'string') {
              // 单个字符串，直接作为URL使用
              noticeImagesList = [notice.noticeImages]
            } else if (Array.isArray(notice.noticeImages)) {
              // 数组，直接使用
              noticeImagesList = notice.noticeImages
            }
          } catch (e) {
            console.error('解析公告图片失败:', e)
          }
        }
        
        // 获取noticeType的索引
        const noticeTypeIndex = this.data.noticeTypeOptions.indexOf(notice.noticeType || '社区公告')
        
        this.setData({
          title: notice.title || '',
          content: notice.content || '',
          noticeType: notice.noticeType || '社区公告',
          noticeTypeIndex: noticeTypeIndex >= 0 ? noticeTypeIndex : 0,
          status: notice.status || '已发布',
          isUrgent: notice.isUrgent || 0,
          isTop: notice.isTop || 0,
          activityDate: notice.activityDate || '',
          activityTime: notice.activityTime || '',
          activityLocation: notice.activityLocation || '',
          activityOrganizer: notice.activityOrganizer || '',
          activityContact: notice.activityContact || '',
          activityContactPhone: notice.activityContactPhone || '',
          startTime: notice.startTime || '',
          endTime: notice.endTime || '',
          remark: notice.remark || '',
          noticeImages: noticeImagesList,
          loading: false
        })
      } else {
        showToast('加载失败')
        this.setData({ loading: false })
      }
    } catch (err) {
      hideLoading()
      console.error('加载公告数据失败:', err)
      showToast('加载失败')
      this.setData({ loading: false })
    }
  },

  // 标题输入
  onTitleInput(e) {
    this.setData({ title: e.detail.value })
    this.validateField('title')
  },

  // 内容输入
  onContentInput(e) {
    this.setData({ content: e.detail.value })
    this.validateField('content')
  },

  // 公告类型选择
  onNoticeTypeChange(e) {
    const index = e.detail.value
    this.setData({ 
      noticeTypeIndex: index,
      noticeType: this.data.noticeTypeOptions[index] 
    })
  },

  // 状态选择
  onStatusChange(e) {
    const index = e.detail.value
    this.setData({ status: this.data.statusOptions[index] })
  },

  // 紧急标记
  onUrgentChange(e) {
    this.setData({ isUrgent: e.detail.value ? 1 : 0 })
  },

  // 置顶标记
  onTopChange(e) {
    this.setData({ isTop: e.detail.value ? 1 : 0 })
  },

  // 活动信息输入
  onActivityDateChange(e) {
    this.setData({ activityDate: e.detail.value })
  },

  onActivityTimeInput(e) {
    this.setData({ activityTime: e.detail.value })
  },

  onActivityLocationInput(e) {
    this.setData({ activityLocation: e.detail.value })
  },

  onActivityOrganizerInput(e) {
    this.setData({ activityOrganizer: e.detail.value })
  },

  onActivityContactInput(e) {
    this.setData({ activityContact: e.detail.value })
  },

  onActivityContactPhoneInput(e) {
    this.setData({ activityContactPhone: e.detail.value })
  },

  // 时间选择
  onStartTimeChange(e) {
    this.setData({ startTime: e.detail.value })
  },

  onEndTimeChange(e) {
    this.setData({ endTime: e.detail.value })
  },

  // 备注输入
  onRemarkInput(e) {
    this.setData({ remark: e.detail.value })
  },

  // ===== 图片相关方法 =====
  chooseNoticeImage(e) {
    // 允许修改现有图片
    // 如果已有图片，替换时需要先删除，或者直接允许选择新图片来替换
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const oldImages = [...this.data.noticeImages]
        // 如果有现有图片，自动将其标记为删除
        if (oldImages.length > 0) {
          this.setData({
            noticeImagesToDelete: [...this.data.noticeImagesToDelete, ...oldImages],
            noticeImages: [],
            noticeImageFiles: res.tempFilePaths
          })
        } else {
          this.setData({
            noticeImageFiles: res.tempFilePaths
          })
        }
      }
    })
  },

  deleteNoticeImage(e) {
    const { index } = e.currentTarget.dataset
    const images = [...this.data.noticeImages]
    const image = images.splice(index, 1)[0]
    const toDelete = [...this.data.noticeImagesToDelete, image]
    this.setData({
      noticeImages: images,
      noticeImagesToDelete: toDelete
    })
  },

  deleteNoticeImageFile(e) {
    const { index } = e.currentTarget.dataset
    const files = [...this.data.noticeImageFiles]
    files.splice(index, 1)
    this.setData({ noticeImageFiles: files })
  },

  previewNoticeImage(e) {
    const { index } = e.currentTarget.dataset
    const image = this.data.noticeImages[index]
    wx.previewImage({
      urls: [image],
      current: image
    })
  },

  previewNoticeImageFile(e) {
    const { index } = e.currentTarget.dataset
    wx.previewImage({
      urls: this.data.noticeImageFiles,
      current: this.data.noticeImageFiles[index]
    })
  },

  // 字段验证
  validateField(fieldName) {
    const errors = this.data.errors
    
    switch (fieldName) {
      case 'title':
        if (!this.data.title.trim()) {
          errors.title = '标题不能为空'
        } else if (this.data.title.length > 100) {
          errors.title = '标题长度不超过100字'
        } else {
          delete errors.title
        }
        break
      case 'content':
        if (!this.data.content.trim()) {
          errors.content = '内容不能为空'
        } else {
          delete errors.content
        }
        break
    }
    
    this.setData({ errors })
  },

  // 验证所有字段
  validateForm() {
    this.validateField('title')
    this.validateField('content')

    return Object.keys(this.data.errors).length === 0
  },

  // 提交表单
  async submitForm() {
    if (!this.validateForm()) {
      showToast('请填写完整信息')
      return
    }

    if (this.data.submitting) return

    this.setData({ submitting: true })
    showLoading(this.data.noticeId ? '更新中...' : '发布中...')

    try {
      // 如果有新上传的图片文件，需要上传图片
      if (this.data.noticeImageFiles.length > 0) {
        // 使用包含图片的方式提交
        const formData = {
          title: this.data.title.trim(),
          content: this.data.content.trim(),
          noticeType: this.data.noticeType,
          isUrgent: this.data.isUrgent,
          isTop: this.data.isTop,
          activityDate: this.data.activityDate || '',
          activityTime: this.data.activityTime || '',
          activityLocation: this.data.activityLocation || '',
          activityOrganizer: this.data.activityOrganizer || '',
          activityContact: this.data.activityContact || '',
          activityContactPhone: this.data.activityContactPhone || '',
          startTime: this.data.startTime || '',
          endTime: this.data.endTime || '',
          remark: this.data.remark || '',
          noticeImageFiles: this.data.noticeImageFiles,
          noticeImagesToDelete: this.data.noticeImagesToDelete.length > 0 ? JSON.stringify(this.data.noticeImagesToDelete) : ''
        }
        
        let res
        if (this.data.noticeId) {
          // 更新时使用updateNoticeWithImages
          res = await staffAPI.updateNoticeWithImages(this.data.noticeId, formData)
        } else {
          // 新增时需要添加社区ID
          formData.communityId = 1 // 假设社区ID为1，实际需要从登录信息中获取
          res = await staffAPI.createNoticeWithImages(formData)
        }

        hideLoading()

        if (res && res.success) {
          showToast(this.data.noticeId ? '更新成功' : '发布成功')
          setTimeout(() => {
            wx.navigateBack()
          }, 1000)
        } else {
          showToast('操作失败: ' + (res?.message || '请重试'))
        }
      } else {
        // 没有新图片文件，使用JSON方式提交
        const submitData = {
          title: this.data.title.trim(),
          content: this.data.content.trim(),
          noticeType: this.data.noticeType,
          isUrgent: this.data.isUrgent,
          isTop: this.data.isTop,
          activityDate: this.data.activityDate || null,
          activityTime: this.data.activityTime || null,
          activityLocation: this.data.activityLocation || null,
          activityOrganizer: this.data.activityOrganizer || null,
          activityContact: this.data.activityContact || null,
          activityContactPhone: this.data.activityContactPhone || null,
          startTime: this.data.startTime || null,
          endTime: this.data.endTime || null,
          remark: this.data.remark || null,
          noticeImagesToDelete: this.data.noticeImagesToDelete.length > 0 ? JSON.stringify(this.data.noticeImagesToDelete) : null
        }

        let res
        if (this.data.noticeId) {
          res = await staffAPI.updateNotice(this.data.noticeId, submitData)
        } else {
          submitData.communityId = 1 // 假设社区ID为1，实际需要从登录信息中获取
          res = await staffAPI.addNotice(submitData)
        }

        hideLoading()

        if (res && res.success) {
          showToast(this.data.noticeId ? '更新成功' : '发布成功')
          setTimeout(() => {
            wx.navigateBack()
          }, 1000)
        } else {
          showToast('操作失败: ' + (res?.message || '请重试'))
        }
      }
    } catch (err) {
      hideLoading()
      console.error('提交失败:', err)
      showToast('提交失败，请重试')
    } finally {
      this.setData({ submitting: false })
    }
  },

  // 返回
  goBack() {
    wx.navigateBack()
  }
})