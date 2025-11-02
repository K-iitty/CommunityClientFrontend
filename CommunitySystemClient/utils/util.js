// 工具函数

/**
 * 格式化时间
 */
const formatTime = (date) => {
  if (!date) return ''
  
  const d = new Date(date)
  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  const hour = d.getHours().toString().padStart(2, '0')
  const minute = d.getMinutes().toString().padStart(2, '0')
  const second = d.getSeconds().toString().padStart(2, '0')

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

/**
 * 格式化日期
 */
const formatDate = (date) => {
  if (!date) return ''
  
  const d = new Date(date)
  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * 格式化相对时间
 */
const formatRelativeTime = (date) => {
  if (!date) return ''
  
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 7) {
    return formatDate(date)
  } else if (days > 0) {
    return `${days}天前`
  } else if (hours > 0) {
    return `${hours}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟前`
  } else {
    return '刚刚'
  }
}

/**
 * Loading提示
 */
const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title,
    mask: true
  })
}

const hideLoading = () => {
  wx.hideLoading()
}

/**
 * Toast提示
 */
const showToast = (title, icon = 'none', duration = 2000) => {
  wx.showToast({
    title,
    icon,
    duration
  })
}

const showSuccess = (title = '操作成功') => {
  wx.showToast({
    title,
    icon: 'success'
  })
}

const showError = (title = '操作失败') => {
  wx.showToast({
    title,
    icon: 'none'
  })
}

/**
 * 确认对话框
 */
const showConfirm = (content, title = '提示') => {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title,
      content,
      success: (res) => {
        if (res.confirm) {
          resolve()
        } else {
          reject()
        }
      }
    })
  })
}

/**
 * 选择图片
 */
const chooseImage = (count = 1) => {
  return new Promise((resolve, reject) => {
    wx.chooseImage({
      count,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        resolve(res.tempFilePaths)
      },
      fail: reject
    })
  })
}

/**
 * 预览图片
 */
const previewImage = (current, urls) => {
  wx.previewImage({
    current,
    urls
  })
}

/**
 * 拨打电话
 */
const makePhoneCall = (phoneNumber) => {
  wx.makePhoneCall({
    phoneNumber
  })
}

/**
 * 防抖函数
 */
const debounce = (fn, delay = 500) => {
  let timer = null
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 */
const throttle = (fn, delay = 500) => {
  let lastTime = 0
  return function(...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      fn.apply(this, args)
      lastTime = now
    }
  }
}

/**
 * 获取状态标签类型
 */
const getStatusTagType = (status) => {
  const statusMap = {
    '待处理': 'warning',
    '处理中': 'primary',
    '已完成': 'success',
    '已关闭': 'info',
    '正常': 'success',
    '禁用': 'danger',
    '申请': 'warning',
    '已验证': 'success',
    '未验证': 'warning'
  }
  return statusMap[status] || 'info'
}

/**
 * 获取优先级标签类型
 */
const getPriorityTagType = (priority) => {
  const priorityMap = {
    '紧急': 'danger',
    '高': 'warning',
    '中': 'primary',
    '低': 'info'
  }
  return priorityMap[priority] || 'info'
}

/**
 * 复制文本
 */
const copyText = (text) => {
  wx.setClipboardData({
    data: text,
    success: () => {
      showSuccess('已复制')
    }
  })
}

/**
 * 数字格式化（保留两位小数）
 */
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0.00'
  return Number(num).toFixed(2)
}

/**
 * 数组分页
 */
const paginate = (array, page, size) => {
  const start = (page - 1) * size
  const end = start + size
  return array.slice(start, end)
}

/**
 * 判断是否为空
 */
const isEmpty = (value) => {
  return value === null || value === undefined || value === '' || 
         (Array.isArray(value) && value.length === 0) ||
         (typeof value === 'object' && Object.keys(value).length === 0)
}

module.exports = {
  formatTime,
  formatDate,
  formatRelativeTime,
  showLoading,
  hideLoading,
  showToast,
  showSuccess,
  showError,
  showConfirm,
  chooseImage,
  previewImage,
  makePhoneCall,
  debounce,
  throttle,
  getStatusTagType,
  getPriorityTagType,
  copyText,
  formatNumber,
  paginate,
  isEmpty
}
