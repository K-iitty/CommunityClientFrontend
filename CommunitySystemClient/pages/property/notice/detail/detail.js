// pages/property/notice/detail/detail.js
// 公告管理 - 详情页面
const { staffAPI } = require('../../../../utils/api.js')
const { showToast, showLoading, hideLoading } = require('../../../../utils/util.js')

Page({
  data: {
    noticeId: null,
    notice: null,
    noticeImagesList: [],
    attachmentsList: [],
    loading: true,
    empty: false
  },

  onLoad(options) {
    const { id } = options
    if (id) {
      this.setData({ noticeId: id })
      this.loadNoticeDetail(id)
    } else {
      this.setData({ empty: true, loading: false })
    }
  },

  // 加载公告详情
  async loadNoticeDetail(id) {
    try {
      this.setData({ loading: true })
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
        
        // 处理附件
        let attachmentsList = []
        if (notice.attachments) {
          try {
            if (typeof notice.attachments === 'string') {
              const parsed = JSON.parse(notice.attachments)
              attachmentsList = Array.isArray(parsed) ? parsed : [parsed]
            } else if (Array.isArray(notice.attachments)) {
              attachmentsList = notice.attachments
            }
          } catch (e) {
            console.error('解析附件失败:', e)
          }
        }
        
        this.setData({
          notice: notice,
          noticeImagesList: noticeImagesList,
          attachmentsList: attachmentsList,
          loading: false
        })
        
        // 增加阅读量
        this.incrementReadCount(id)
      } else {
        showToast('加载失败')
        this.setData({ empty: true, loading: false })
      }
    } catch (err) {
      hideLoading()
      console.error('加载公告详情失败:', err)
      showToast('加载失败')
      this.setData({ empty: true, loading: false })
    }
  },

  // 增加阅读量
  async incrementReadCount(id) {
    try {
      await staffAPI.incrementNoticeReadCount(id)
    } catch (err) {
      console.error('增加阅读量失败:', err)
    }
  },

  // 预览图片
  previewImage(e) {
    const { url } = e.currentTarget.dataset
    wx.previewImage({
      urls: [url],
      current: url
    })
  },

  // 编辑公告
  editNotice() {
    const { noticeId } = this.data
    wx.navigateTo({
      url: `/pages/property/notice/edit/edit?id=${noticeId}`
    })
  },

  // 删除公告
  deleteNotice() {
    wx.showModal({
      title: '确认删除？',
      content: '删除后无法恢复，请谨慎操作',
      success: async (res) => {
        if (res.confirm) {
          showLoading('删除中...')
          try {
            const result = await staffAPI.deleteNotice(this.data.noticeId)
            hideLoading()

            if (result && result.success) {
              showToast('删除成功')
              setTimeout(() => {
                wx.navigateBack()
              }, 1000)
            } else {
              showToast('删除失败')
            }
          } catch (err) {
            hideLoading()
            console.error('删除失败:', err)
            showToast('删除失败')
          }
        }
      }
    })
  },

  // 返回列表
  goBack() {
    wx.navigateBack()
  }
})