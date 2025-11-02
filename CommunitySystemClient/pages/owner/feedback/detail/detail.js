// pages/owner/feedback/detail/detail.js
const { ownerAPI } = require('../../../../utils/api.js')
const { showLoading, hideLoading, showToast, showSuccess, formatTime, previewImage } = require('../../../../utils/util.js')

Page({
  data: {
    id: 0,
    issue: null,
    issueImages: [],
    resultImages: [],
    followUpRecords: [],
    followUpContent: '',
    showEvaluateModal: false,
    evaluationData: {
      evaluationScore: 5,
      evaluationComment: ''
    }
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id })
      this.loadDetail()
      this.loadFollowUpRecords()
    }
  },

  async loadDetail() {
    try {
      showLoading()
      const res = await ownerAPI.getIssueDetail(this.data.id)
      if (res && res.data) {
        const issue = res.data
        
        // 解析附加图片 - 处理阿里云OSS URL格式
        let issueImages = []
        if (issue.additionalImages) {
          try {
            // 如果是逗号分隔的URL字符串，按逗号分割
            if (typeof issue.additionalImages === 'string' && issue.additionalImages.includes(',')) {
              issueImages = issue.additionalImages.split(',').map(url => url.trim()).filter(url => url)
            } else if (typeof issue.additionalImages === 'string' && issue.additionalImages) {
              // 单个URL
              issueImages = [issue.additionalImages.trim()]
            } else {
              issueImages = typeof issue.additionalImages === 'string' 
                ? JSON.parse(issue.additionalImages) 
                : issue.additionalImages
            }
          } catch (e) {
            console.warn('解析附加图片失败:', e)
            issueImages = []
          }
        }
        
        // 解析处理结果图片
        let resultImages = []
        if (issue.resultImages) {
          try {
            resultImages = typeof issue.resultImages === 'string' 
              ? JSON.parse(issue.resultImages) 
              : issue.resultImages
          } catch (e) {
            console.warn('解析处理结果图片失败:', e)
            resultImages = []
          }
        }

        this.setData({
          issue: issue,
          issueImages: issueImages,
          resultImages: resultImages
        })
      }
      hideLoading()
    } catch (err) {
      hideLoading()
      console.error('加载详情失败:', err)
      showToast('加载失败')
    }
  },

  async loadFollowUpRecords() {
    try {
      const res = await ownerAPI.getIssueFollowUps(this.data.id, 1, 100)
      if (res && res.data && res.data.items) {
        this.setData({
          followUpRecords: res.data.items
        })
      }
    } catch (err) {
      console.error('加载跟进记录失败:', err)
    }
  },

  // 预览问题图片
  previewImages(e) {
    const { url } = e.currentTarget.dataset
    previewImage(url, this.data.issueImages)
  },

  // 预览处理结果图片
  previewResultImages(e) {
    const { url } = e.currentTarget.dataset
    previewImage(url, this.data.resultImages)
  },

  // 输入追加内容
  onFollowUpInput(e) {
    this.setData({
      followUpContent: e.detail.value
    })
  },

  // 提交追加
  async handleFollowUp() {
    const { followUpContent, id, issue } = this.data

    if (!followUpContent.trim()) {
      showToast('请输入追加内容')
      return
    }

    // 检查问题状态 - "已完成"的问题不允许提交追加
    if (issue.issueStatus === '已完成') {
      showToast('已完成的问题无法追加，请通过评价反馈意见')
      return
    }

    // 检查问题状态 - "待处理"的问题不允许提交追加
    if (issue.issueStatus === '待处理') {
      showToast('问题处理中，请稍后再试')
      return
    }

    try {
      showLoading('提交中...')
      const res = await ownerAPI.followUpIssue(id, {
        followUpContent: followUpContent
      })

      hideLoading()

      if (res.success) {
        showSuccess('追加成功')
        this.setData({ followUpContent: '' })
        // 重新加载问题详情和跟进记录
        this.loadDetail()
        this.loadFollowUpRecords()
      } else {
        showToast(res.message || '追加失败')
      }
    } catch (err) {
      hideLoading()
      console.error('追加失败:', err)
      showToast('追加失败: ' + (err.message || '未知错误'))
    }
  },

  // 显示评价弹窗
  showEvaluate() {
    const { issue } = this.data
    
    // 检查问题状态 - 只有"已完成"状态才允许评价
    if (issue.issueStatus !== '已完成') {
      showToast('只有已完成的问题才能评价')
      return
    }
    
    // 检查是否已经评价 - 已评价不能再次评价
    if (issue.isEvaluated === 1) {
      showToast('您已评价过此问题，无法再次评价')
      return
    }
    
    this.setData({
      showEvaluateModal: true
    })
  },

  // 关闭评价弹窗
  closeEvaluate() {
    this.setData({
      showEvaluateModal: false
    })
  },

  // 设置评分
  setScore(e) {
    const score = parseInt(e.currentTarget.dataset.score)
    this.setData({
      'evaluationData.evaluationScore': score
    })
  },

  // 输入评价
  onCommentInput(e) {
    this.setData({
      'evaluationData.evaluationComment': e.detail.value
    })
  },

  // 提交评价
  async handleEvaluate() {
    const { id, issue, evaluationData } = this.data

    // 再次检查问题状态
    if (issue.issueStatus !== '已完成') {
      showToast('问题状态已变更，请刷新重试')
      return
    }

    // 再次检查是否已经评价
    if (issue.isEvaluated === 1) {
      showToast('您已评价过此问题，无法再次评价')
      return
    }

    try {
      showLoading('提交中...')
      const res = await ownerAPI.evaluateIssue(id, {
        satisfactionLevel: evaluationData.evaluationScore,
        satisfactionFeedback: evaluationData.evaluationComment
      })

      hideLoading()

      if (res.success) {
        showSuccess('评价成功')
        this.setData({
          showEvaluateModal: false,
          'issue.isEvaluated': 1,
          'issue.satisfactionLevel': evaluationData.evaluationScore,
          'issue.satisfactionFeedback': evaluationData.evaluationComment
        })
        // 3秒后关闭详情页，返回列表
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        showToast(res.message || '评价失败')
      }
    } catch (err) {
      hideLoading()
      console.error('评价失败:', err)
      showToast('评价失败: ' + (err.message || '未知错误'))
    }
  }
})

