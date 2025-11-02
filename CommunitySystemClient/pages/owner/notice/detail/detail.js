// pages/owner/notice/detail/detail.js
const { ownerAPI } = require('../../../../utils/api.js')
const { showLoading, hideLoading, showToast } = require('../../../../utils/util.js')

Page({
  data: {
    id: 0,
    notice: null,
    loading: true,
    noticeImages: [],  // 解析后的图片数组
    attachments: [],   // 解析后的附件数组
    showActivity: false  // 是否显示活动信息
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id })
      this.loadDetail()
    }
  },

  async loadDetail() {
    try {
      showLoading()
      const res = await ownerAPI.getNoticeDetail(this.data.id)
      
      // 处理API响应结构
      if (res && res.success && res.data) {
        const notice = res.data
        
        // 解析图片（JSON数组格式）
        let noticeImages = []
        if (notice.noticeImages) {
          try {
            if (typeof notice.noticeImages === 'string') {
              // 检查是否是JSON数组格式
              if (notice.noticeImages.trim().startsWith('[')) {
                // 是JSON数组
                noticeImages = JSON.parse(notice.noticeImages)
              } else {
                // 是单个URL字符串
                noticeImages = [notice.noticeImages]
              }
            } else if (Array.isArray(notice.noticeImages)) {
              // 已经是数组
              noticeImages = notice.noticeImages
            }
          } catch (e) {
            console.error('解析图片失败:', e)
            // 如果解析失败但是有字符串，将其作为单个URL处理
            if (typeof notice.noticeImages === 'string' && notice.noticeImages.trim()) {
              noticeImages = [notice.noticeImages]
            } else {
              noticeImages = []
            }
          }
        }
        
        // 解析附件（JSON格式）
        let attachments = []
        if (notice.attachments) {
          try {
            attachments = typeof notice.attachments === 'string'
              ? JSON.parse(notice.attachments)
              : notice.attachments
            // 确保是数组
            if (!Array.isArray(attachments)) {
              attachments = [attachments]
            }
          } catch (e) {
            console.error('解析附件失败:', e)
            attachments = []
          }
        }
        
        // 判断是否显示活动信息（当为活动公告时）
        const showActivity = notice.noticeType === '活动公告'
        
        // 格式化发布时间
        const publishTime = this.formatTime(notice.publishTime)
        
        this.setData({
          notice: {
            ...notice,
            publishTime: publishTime
          },
          noticeImages: noticeImages,
          attachments: attachments,
          showActivity: showActivity,
          loading: false
        })
      } else {
        showToast('加载失败，请稍后重试')
        this.setData({ loading: false })
      }
      hideLoading()
    } catch (err) {
      console.error('加载公告详情失败:', err)
      hideLoading()
      showToast('加载失败，请稍后重试')
      this.setData({ loading: false })
    }
  },

  // 格式化时间
  formatTime(timestamp) {
    if (!timestamp) return ''
    
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}`
  },

  // 格式化日期（仅显示日期）
  formatDate(dateStr) {
    if (!dateStr) return ''
    return dateStr
  },

  // 预览图片
  previewImage(e) {
    const { url, index } = e.currentTarget.dataset
    if (!url) return
    
    wx.previewImage({
      urls: this.data.noticeImages,
      current: index,
      fail: () => {
        showToast('图片加载失败')
      }
    })
  },

  // 打开附件
  openAttachment(e) {
    const { filename, url } = e.currentTarget.dataset
    if (!url) {
      showToast('附件链接无效')
      return
    }
    
    wx.showModal({
      title: '打开附件',
      content: `是否打开附件：${filename}？`,
      success: (res) => {
        if (res.confirm) {
          // 可以跳转到附件URL或下载
          wx.navigateTo({
            url: `/pages/common/file-viewer/file-viewer?url=${encodeURIComponent(url)}&name=${encodeURIComponent(filename)}`
          })
        }
      }
    })
  },

  // 复制联系电话
  copyPhone(e) {
    const { phone } = e.currentTarget.dataset
    if (!phone) {
      showToast('电话号码无效')
      return
    }
    
    wx.setClipboardData({
      data: phone,
      success: () => {
        showToast('已复制到剪贴板')
      }
    })
  },

  // 分享
  share() {
    const notice = this.data.notice
    if (!notice) return
    
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  }
})

