// API请求封装
const app = getApp()

// 端口配置 - 根据模块类型选择不同的端口
const OWNER_BASE_URL = 'http://localhost:8081'      // 业主模块 (owner-module)
const STAFF_BASE_URL = 'http://localhost:8082'      // 物业模块 (property-module)

// 通用请求方法
const request = (url, method = 'GET', data = {}, needAuth = true, moduleType = 'owner') => {
  return new Promise((resolve, reject) => {
    // 根据模块类型选择基础URL
    const baseUrl = moduleType === 'staff' ? STAFF_BASE_URL : OWNER_BASE_URL
    const token = app.getToken()

    // 请求头配置
    const header = {
      'Content-Type': 'application/json'
    }

    // 添加Token
    if (needAuth && token) {
      header['Authorization'] = `Bearer ${token}`
    }

    wx.request({
      url: `${baseUrl}${url}`,
      method,
      data,
      header,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else if (res.statusCode === 401) {
          // Token过期，跳转登录
          wx.showToast({
            title: '登录已过期',
            icon: 'none'
          })
          app.clearLoginInfo()
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/login/login'
            })
          }, 1500)
          reject(res.data)
        } else {
          wx.showToast({
            title: res.data.message || '请求失败',
            icon: 'none'
          })
          reject(res.data)
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '网络连接失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

// 业主API (owner-module - 8081)
const ownerAPI = {
  // 认证相关
  login: (data) => request('/api/auth/owner/login', 'POST', data, false, 'owner'),
  register: (data) => request('/api/auth/owner/register', 'POST', data, false, 'owner'),
  forgotPassword: (data) => request('/api/auth/owner/forgot-password', 'POST', data, false, 'owner'),
  logout: () => request('/api/auth/owner/logout', 'POST', {}, true, 'owner'),

  // 个人信息
  getProfile: () => request('/api/owner/profile', 'GET', {}, true, 'owner'),
  updateProfile: (data) => request('/api/owner/profile', 'PUT', data, true, 'owner'),

  // 房屋管理
  getMyHouses: (page, pageSize) => request(`/api/owner/houses?page=${page}&size=${pageSize}`, 'GET', {}, true, 'owner'),
  getHouseCards: () => request('/api/owner/houses/cards', 'GET', {}, true, 'owner'),
  getHouseDetail: (id) => request(`/api/owner/houses/${id}`, 'GET', {}, true, 'owner'),
  applyHouse: (data) => request('/api/owner/houses/apply', 'POST', data, true, 'owner'),
  getHouseApplications: () => request('/api/owner/houses/applications', 'GET', {}, true, 'owner'),
  getHouseApplicationsByStatus: (verified, status, page, pageSize) => {
    let url = '/api/owner/houses/applications/by-status?'
    const params = []
    if (verified !== null && verified !== undefined) {
      params.push(`verified=${verified}`)
    }
    if (status) {
      params.push(`status=${encodeURIComponent(status)}`)
    }
    if (page) {
      params.push(`page=${page}`)
    }
    if (pageSize) {
      params.push(`size=${pageSize}`)
    }
    return request(url + params.join('&'), 'GET', {}, true, 'owner')
  },
  getCommunityStaffInfo: (page, pageSize) => request(`/api/owner/houses/community-staff?page=${page}&size=${pageSize}`, 'GET', {}, true, 'owner'),

  // 车辆管理
  getMyVehicles: (page, pageSize) => request(`/api/owner/vehicles?page=${page}&size=${pageSize}`, 'GET', {}, true, 'owner'),
  getVehicleDetail: (id) => request(`/api/owner/vehicles/${id}`, 'GET', {}, true, 'owner'),
  applyVehicle: (data) => request('/api/owner/vehicles/apply', 'POST', data, true, 'owner'),
  getVehicleApplications: () => request('/api/owner/vehicles/applications', 'GET', {}, true, 'owner'),

  // 车位管理
  getMyParkingSpaces: (page, pageSize) => request(`/api/owner/parking-spaces?page=${page}&size=${pageSize}`, 'GET', {}, true, 'owner'),
  getParkingSpaceDetail: (id) => request(`/api/owner/parking-spaces/${id}`, 'GET', {}, true, 'owner'),
  applyParkingSpace: (data) => request('/api/owner/parking-spaces/apply', 'POST', data, true, 'owner'),
  getParkingApplications: () => request('/api/owner/parking-spaces/applications', 'GET', {}, true, 'owner'),
  getParkingApplicationsByStatus: (status, page, pageSize) => {
    let url = '/api/owner/parking-spaces/applications/by-status?'
    const params = []
    if (status) {
      params.push(`status=${encodeURIComponent(status)}`)
    }
    if (page) {
      params.push(`page=${page}`)
    }
    if (pageSize) {
      params.push(`size=${pageSize}`)
    }
    return request(url + params.join('&'), 'GET', {}, true, 'owner')
  },
  searchAvailableParkingSpaces: (spaceStatus, page, pageSize) => {
    let url = '/api/owner/parking-spaces/search-available?'
    const params = []
    if (spaceStatus) {
      params.push(`spaceStatus=${encodeURIComponent(spaceStatus)}`)
    }
    if (page) {
      params.push(`page=${page}`)
    }
    if (pageSize) {
      params.push(`size=${pageSize}`)
    }
    return request(url + params.join('&'), 'GET', {}, true, 'owner')
  },

  // 仪表管理
  getMeterCards: () => request('/api/owner/meters/cards', 'GET', {}, true, 'owner'),
  getMyMeters: () => request('/api/owner/billing/meters', 'GET', {}, true, 'owner'),
  getMeterDetail: (id) => request(`/api/owner/meters/${id}`, 'GET', {}, true, 'owner'),
  applyAddMeter: (data) => request('/api/owner/meters/apply-add', 'POST', data, true, 'owner'),
  applyDeleteMeter: (id, reason) => request(`/api/owner/meters/${id}?reason=${encodeURIComponent(reason)}`, 'DELETE', {}, true, 'owner'),
  getMeterBillingCards: () => request('/api/owner/meters/billing/cards', 'GET', {}, true, 'owner'),

  // 缴费管理
  getBillingCards: () => request('/api/owner/billing/cards', 'GET', {}, true, 'owner'),
  getBillingDetail: (id) => request(`/api/owner/billing/${id}`, 'GET', {}, true, 'owner'),
  pay: (data) => request('/api/owner/billing/pay', 'POST', data, true, 'owner'),
  getBillingHistory: (page, pageSize) => request(`/api/owner/billing/history?page=${page}&size=${pageSize}`, 'GET', {}, true, 'owner'),

  // 反馈系统
  getMyIssues: (page, pageSize, status) => {
    const statusParam = status ? `&status=${status}` : ''
    return request(`/api/owner/issues/my-list?page=${page}&size=${pageSize}${statusParam}`, 'GET', {}, true, 'owner')
  },
  getIssueDetail: (id) => request(`/api/owner/issues/detail/${id}`, 'GET', {}, true, 'owner'),
  submitIssue: (data) => request('/api/owner/issues/submit', 'POST', data, true, 'owner'),
  followUpIssue: (id, data) => request(`/api/owner/issues/follow-up`, 'POST', { ...data, issueId: id }, true, 'owner'),
  evaluateIssue: (id, data) => request(`/api/owner/issues/evaluate`, 'POST', { ...data, issueId: id }, true, 'owner'),
  getIssueFollowUps: (id, page, pageSize) => request(`/api/owner/issues/${id}/follow-ups?page=${page}&size=${pageSize}`, 'GET', {}, true, 'owner'),

  // 社区公告
  getNoticeList: (page, pageSize) => request(`/api/owner/notices/list?page=${page}&size=${pageSize}`, 'GET', {}, true, 'owner'),
  getNoticeDetail: (id) => request(`/api/owner/notices/detail/${id}`, 'GET', {}, true, 'owner'),
  getNoticeCategories: () => request('/api/owner/notices/categories', 'GET', {}, true, 'owner'),
  filterNoticesByType: (data) => request('/api/owner/notices/filter', 'POST', data, true, 'owner'),

  // 咨询反馈
  applyConsultation: (data) => request('/api/owner/consultation/apply', 'POST', data, true, 'owner'),
  getConsultationRecords: (page, pageSize) => request(`/api/owner/consultation?page=${page}&size=${pageSize}`, 'GET', {}, true, 'owner'),
  getDepartmentContacts: () => request('/api/owner/consultation/department-contacts', 'GET', {}, true, 'owner'),

  // AI 智能问答 (流式输出)
  streamChat: (question, history = []) => {
    return new Promise((resolve, reject) => {
      const token = wx.getStorageSync('authToken') || ''
      const baseUrl = 'http://localhost:8081'
      
      const requestBody = {
        question: question,
        sessionId: wx.getStorageSync('sessionId') || `session_${Date.now()}`,
        history: history
      }
      
      // 建立SSE连接
      const eventSource = new wx.SocketTask()
      
      // 使用wx.request配合text/event-stream处理
      const requestId = wx.request({
        url: `${baseUrl}/api/owner/smart-qa/chat`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: requestBody,
        responseType: 'text',
        success: (res) => {
          resolve(res)
        },
        fail: (err) => {
          reject(err)
        }
      })
      
      return requestId
    })
  },
  
  // 流式聊天 - 使用WebSocket方式
  streamChatWebSocket: function(question, history, onMessage, onError, onComplete) {
    const token = wx.getStorageSync('authToken') || ''
    const baseUrl = 'ws://localhost:8081'  // 使用WebSocket
    
    const requestBody = {
      question: question,
      sessionId: wx.getStorageSync('sessionId') || `session_${Date.now()}`,
      history: history
    }
    
    // 由于微信小程序的限制，改用HTTP长连接
    // 实际使用中应该用 wx.connectSocket 连接 WebSocket
    return {
      abort: () => {}
    }
  }
}

// 物业API (property-module - 8082)
const staffAPI = {
  // 认证相关
  login: (data) => request('/api/auth/property/login', 'POST', data, false, 'staff'),
  changePassword: (oldPwd, newPwd) => 
    request(`/api/auth/property/change-password?oldPassword=${encodeURIComponent(oldPwd)}&newPassword=${encodeURIComponent(newPwd)}`, 'POST', {}, true, 'staff'),
  logout: async () => {
    try {
      // 先调用后端退出接口
      const result = await request('/api/auth/property/logout', 'POST', {}, true, 'staff')
      // 成功后清除本地登录信息
      const app = getApp()
      app.clearLoginInfo()
      return { success: true, message: result.message || '退出登录成功' }
    } catch (err) {
      // 即使后端请求失败，仍然清除本地登录信息
      const app = getApp()
      app.clearLoginInfo()
      return { success: true, message: '退出登录成功' }
    }
  },

  // 个人信息
  getProfile: () => request('/api/property/profile/my-info', 'GET', {}, true, 'staff'),
  updateBasicInfo: (data) => request('/api/property/profile/update-basic', 'PUT', data, true, 'staff'),
  updateBasicInfoWithImages: (formData) => {
    return new Promise((resolve, reject) => {
      const token = getApp().getToken()
      wx.request({
        url: `${STAFF_BASE_URL}/api/property/profile/update-basic-with-images`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`
        },
        data: formData,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(res.data)
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },
  applyUpdateInfo: (data) => request('/api/property/profile/apply-update', 'POST', data, true, 'staff'),
  getMyApplies: (page, pageSize) => request(`/api/property/profile/my-applies?page=${page}&size=${pageSize}`, 'GET', {}, true, 'staff'),

  // 反馈处理 - 新增
  listIssues: (page, pageSize, status) => {
    const statusParam = status ? `&status=${encodeURIComponent(status)}` : ''
    return request(`/api/property/issues/all?page=${page}&size=${pageSize}${statusParam}`, 'GET', {}, true, 'staff')
  },
  getAllIssues: (page, pageSize, status) => {
    const statusParam = status ? `&status=${encodeURIComponent(status)}` : ''
    return request(`/api/property/issues/all?page=${page}&size=${pageSize}${statusParam}`, 'GET', {}, true, 'staff')
  },
  getIssueStatistics: () => request(`/api/property/issues/statistics/summary`, 'GET', {}, true, 'staff'),
  getDepartmentIssues: (departmentId, page, pageSize, status) => {
    const statusParam = status ? `&status=${encodeURIComponent(status)}` : ''
    return request(`/api/property/issues/department?departmentId=${departmentId}&page=${page}&size=${pageSize}${statusParam}`, 'GET', {}, true, 'staff')
  },
  getIssueDetail: (id) => request(`/api/property/issues/${id}`, 'GET', {}, true, 'staff'),
  assignIssue: (id, data) => request(`/api/property/issues/${id}/assign`, 'POST', data, true, 'staff'),
  startProcessing: (id, data) => {
    const planDescription = data && data.processPlan ? encodeURIComponent(data.processPlan) : ''
    return request(`/api/property/issues/${id}/start-processing?planDescription=${planDescription}`, 'POST', {}, true, 'staff')
  },
  submitProcessResult: (id, data) => request(`/api/property/issues/${id}/submit-result`, 'POST', data, true, 'staff'),
  addFollowUp: (id, data) => request(`/api/property/issues/${id}/follow-up`, 'POST', data, true, 'staff'),
  getFollowUps: (id, page, pageSize) => request(`/api/property/issues/${id}/follow-ups?page=${page}&size=${pageSize}`, 'GET', {}, true, 'staff'),
  markAsResolved: (id) => request(`/api/property/issues/${id}/mark-resolved`, 'POST', {}, true, 'staff'),
  reassignIssue: (id, data) => request(`/api/property/issues/${id}/reassign`, 'POST', data, true, 'staff'),

  // 仪表管理
  getMeterOwnerList: (params) => {
    const { page = 1, pageSize = 20 } = params || {}
    return request(`/api/property/meter/owner-list?page=${page}&size=${pageSize}`, 'GET', {}, true, 'staff')
  },
  
  // 获取社区列表（用于仪表配置的社区选择）
  getCommunityList: (page, pageSize) => {
    return request(`/api/property/communities?page=${page}&size=${pageSize}`, 'GET', {}, true, 'staff')
  },
  
  addMeterToOwner: (data) => request('/api/property/meter/add-to-owner', 'POST', data, true, 'staff'),
  listOwnerMeters: (ownerId, page, pageSize) => request(`/api/property/meter/owner/${ownerId}?page=${page}&size=${pageSize}`, 'GET', {}, true, 'staff'),
  addMeterConfig: (data) => request('/api/property/meter/config/add', 'POST', data, true, 'staff'),
  updateMeterConfig: (configId, data) => request(`/api/property/meter/config/${configId}/update`, 'PUT', data, true, 'staff'),
  deleteMeterConfig: (configId) => request(`/api/property/meter/config/${configId}/delete`, 'DELETE', {}, true, 'staff'),
  listMeterConfigs: (page, pageSize, categoryName) => {
    const categoryParam = categoryName ? `&categoryName=${encodeURIComponent(categoryName)}` : ''
    return request(`/api/property/meter/configs?page=${page}&size=${pageSize}${categoryParam}`, 'GET', {}, true, 'staff')
  },
  addMeterReading: (data) => {
    return new Promise((resolve, reject) => {
      const token = getApp().getToken()
      wx.request({
        url: 'http://localhost:8082/api/property/meter/reading/add',
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: data,
        success: (res) => {
          if (res.statusCode === 200 && res.data && res.data.success) {
            resolve(res.data)
          } else {
            reject(res.data || { message: '请求失败' })
          }
        },
        fail: (err) => {
          console.error('addMeterReading request failed:', err)
          reject(err)
        }
      })
    })
  },
  listMeterReadings: (meterId, page, pageSize, params) => {
    let url = '/api/property/meter/readings'
    if (meterId) {
      url += `/${meterId}`
    }
    url += `?page=${page}&size=${pageSize}`
    
    if (params) {
      if (params.ownerName) {
        url += `&ownerName=${encodeURIComponent(params.ownerName)}`
      }
      if (params.startDate) {
        url += `&startDate=${params.startDate}`
      }
      if (params.endDate) {
        url += `&endDate=${params.endDate}`
      }
    }
    
    return request(url, 'GET', {}, true, 'staff')
  },

  // 编辑仪表信息
  updateMeterInfo: (meterId, data) => request(`/api/property/meter/${meterId}/update`, 'PUT', data, true, 'staff'),
  
  // 删除仪表
  deleteMeterInfo: (meterId) => request(`/api/property/meter/${meterId}/delete`, 'DELETE', {}, true, 'staff'),
  
  // 获取房屋列表（用于仪表配置选择）
  getHouseList: (communityId, page, pageSize) => {
    let url = '/api/property/meter/houses'
    let params = []
    if (communityId) params.push(`communityId=${communityId}`)
    params.push(`page=${page || 1}`)
    params.push(`size=${pageSize || 20}`)
    const queryString = params.join('&')
    return request(`${url}?${queryString}`, 'GET', {}, true, 'staff')
  },

  // 车辆管理
  // 第一步：创建车辆记录（不含图片）
  addVehicleBasic: (data) => {
    let params = []
    if (data.ownerId) params.push(`ownerId=${data.ownerId}`)
    if (data.plateNumber) params.push(`plateNumber=${encodeURIComponent(data.plateNumber)}`)
    if (data.vehicleType) params.push(`vehicleType=${encodeURIComponent(data.vehicleType)}`)
    if (data.brand) params.push(`brand=${encodeURIComponent(data.brand)}`)
    if (data.model) params.push(`model=${encodeURIComponent(data.model)}`)
    if (data.color) params.push(`color=${encodeURIComponent(data.color)}`)
    if (data.fixedSpaceId) params.push(`fixedSpaceId=${data.fixedSpaceId}`)
    if (data.vehicleLicenseNo) params.push(`vehicleLicenseNo=${encodeURIComponent(data.vehicleLicenseNo)}`)
    if (data.engineNo) params.push(`engineNo=${encodeURIComponent(data.engineNo)}`)
    if (data.status) params.push(`status=${encodeURIComponent(data.status)}`)
    if (data.registerDate) params.push(`registerDate=${encodeURIComponent(data.registerDate)}`)
    if (data.remark) params.push(`remark=${encodeURIComponent(data.remark)}`)
    
    const queryString = params.join('&')
    const url = `/api/property/vehicles/add-basic${queryString ? '?' + queryString : ''}`
    
    return new Promise((resolve, reject) => {
      const token = getApp().getToken()
      wx.request({
        url: `http://localhost:8082${url}`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(res.data)
          }
        },
        fail: (err) => reject(err)
      })
    })
  },

  // 第二步：为车辆上传图片
  uploadVehicleImages: (vehicleId, driverLicenseFile, vehicleImageFile) => {
    return new Promise((resolve, reject) => {
      const token = getApp().getToken()
      
      const formData = {}
      
      // 如果都有图片，用两个请求顺序上传
      if (driverLicenseFile && vehicleImageFile) {
        // 先上传驾照
        wx.uploadFile({
          url: `http://localhost:8082/api/property/vehicles/${vehicleId}/upload-images`,
          filePath: driverLicenseFile,
          name: 'driverLicenseImageFile',
          formData: formData,
          header: {
            'Authorization': `Bearer ${token}`
          },
          success: (res1) => {
            if (res1.statusCode === 200) {
              // 再上传车辆图片
              wx.uploadFile({
                url: `http://localhost:8082/api/property/vehicles/${vehicleId}/upload-images`,
                filePath: vehicleImageFile,
                name: 'vehicleImageFile',
                formData: formData,
                header: {
                  'Authorization': `Bearer ${token}`
                },
                success: (res2) => {
                  if (res2.statusCode === 200) {
                    resolve(JSON.parse(res2.data))
                  } else {
                    reject(JSON.parse(res2.data))
                  }
                },
                fail: (err) => reject(err)
              })
            } else {
              reject(JSON.parse(res1.data))
            }
          },
          fail: (err) => reject(err)
        })
      } else if (driverLicenseFile) {
        // 仅上传驾照
        wx.uploadFile({
          url: `http://localhost:8082/api/property/vehicles/${vehicleId}/upload-images`,
          filePath: driverLicenseFile,
          name: 'driverLicenseImageFile',
          formData: formData,
          header: {
            'Authorization': `Bearer ${token}`
          },
          success: (res) => {
            if (res.statusCode === 200) {
              resolve(JSON.parse(res.data))
            } else {
              reject(JSON.parse(res.data))
            }
          },
          fail: (err) => reject(err)
        })
      } else if (vehicleImageFile) {
        // 仅上传车辆图片
        wx.uploadFile({
          url: `http://localhost:8082/api/property/vehicles/${vehicleId}/upload-images`,
          filePath: vehicleImageFile,
          name: 'vehicleImageFile',
          formData: formData,
          header: {
            'Authorization': `Bearer ${token}`
          },
          success: (res) => {
            if (res.statusCode === 200) {
              resolve(JSON.parse(res.data))
            } else {
              reject(JSON.parse(res.data))
            }
          },
          fail: (err) => reject(err)
        })
      } else {
        // 没有图片，直接成功
        resolve({ success: true, message: '无图片上传' })
      }
    })
  },

  // 保留 addVehicle 但改为两步流程
  addVehicle: (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        // 第一步：创建记录
        const basicRes = await staffAPI.addVehicleBasic({
          ownerId: data.ownerId,
          plateNumber: data.plateNumber,
          vehicleType: data.vehicleType || '',
          brand: data.brand || '',
          model: data.model || '',
          color: data.color || '',
          fixedSpaceId: data.fixedSpaceId || '',
          vehicleLicenseNo: data.vehicleLicenseNo || '',
          engineNo: data.engineNo || '',
          status: data.status || '正常',
          registerDate: data.registerDate || '',
          remark: data.remark || ''
        })

        if (!basicRes.success) {
          reject(basicRes)
          return
        }

        const vehicleId = basicRes.data.id

        // 第二步：上传图片
        const driverLicense = data.driverLicenseImageFiles?.[0] || null
        const vehicleImage = data.vehicleImageFiles?.[0] || null

        if (driverLicense || vehicleImage) {
          const imageRes = await staffAPI.uploadVehicleImages(vehicleId, driverLicense, vehicleImage)
          resolve(imageRes)
        } else {
          resolve(basicRes)
        }
      } catch (err) {
        reject(err)
      }
    })
  },
  listOwnerVehicles: (ownerId, page, pageSize) => request(`/api/property/vehicles/${ownerId}/list?page=${page}&size=${pageSize}`, 'GET', {}, true, 'staff'),
  listVehicles: (page, pageSize, keyword) => 
    request(`/api/property/vehicles?page=${page}&size=${pageSize}${keyword ? '&keyword=' + encodeURIComponent(keyword) : ''}`, 'GET', {}, true, 'staff'),
  getVehicleDetail: (id) => 
    request(`/api/property/vehicles/${id}`, 'GET', {}, true, 'staff'),
  deleteVehicle: (id) => 
    request(`/api/property/vehicles/${id}/delete`, 'DELETE', {}, true, 'staff'),
  listOwners: (page, pageSize) => 
    request(`/api/property/owners?page=${page}&size=${pageSize}`, 'GET', {}, true, 'staff'),

  updateVehicle: (id, data) => {
    // 如果有图片文件，使用uploadFile；否则使用request
    if (data.driverLicenseImageFiles?.length > 0 || data.vehicleImageFiles?.length > 0) {
      return new Promise((resolve, reject) => {
        const token = getApp().getToken()
        
        // 构建formData参数
        const formData = {
          plateNumber: data.plateNumber || '',
          vehicleType: data.vehicleType || '',
          brand: data.brand || '',
          model: data.model || '',
          color: data.color || '',
          fixedSpaceId: data.fixedSpaceId || '',
          vehicleLicenseNo: data.vehicleLicenseNo || '',
          engineNo: data.engineNo || '',
          status: data.status || '',
          registerDate: data.registerDate || '',
          remark: data.remark || '',
          ownerId: data.ownerId || '',
          driverLicenseImageToDelete: data.driverLicenseImageToDelete || '',
          vehicleImagesToDelete: data.vehicleImagesToDelete || ''
        }
        
        // 如果有两个文件，需要分两次上传（但都保留完整参数）
        if (data.driverLicenseImageFiles?.length > 0 && data.vehicleImageFiles?.length > 0) {
          // 第一步：上传驾驶证
          wx.uploadFile({
            url: `http://localhost:8082/api/property/vehicles/${id}/update-with-images`,
            filePath: data.driverLicenseImageFiles[0],
            name: 'driverLicenseImageFile',
            formData: formData,
            header: {
              'Authorization': `Bearer ${token}`
            },
            success: (res1) => {
              if (res1.statusCode === 200) {
                // 驾驶证上传成功，继续上传车辆图片
                wx.uploadFile({
                  url: `http://localhost:8082/api/property/vehicles/${id}/update-with-images`,
                  filePath: data.vehicleImageFiles[0],
                  name: 'vehicleImageFiles',
                  formData: formData,
                  header: {
                    'Authorization': `Bearer ${token}`
                  },
                  success: (res2) => {
                    if (res2.statusCode === 200) {
                      resolve(JSON.parse(res2.data))
                    } else {
                      reject(JSON.parse(res2.data))
                    }
                  },
                  fail: (err) => reject(err)
                })
              } else {
                reject(JSON.parse(res1.data))
              }
            },
            fail: (err) => reject(err)
          })
        } else if (data.driverLicenseImageFiles?.length > 0) {
          // 仅上传驾驶证
          wx.uploadFile({
            url: `http://localhost:8082/api/property/vehicles/${id}/update-with-images`,
            filePath: data.driverLicenseImageFiles[0],
            name: 'driverLicenseImageFile',
            formData: formData,
            header: {
              'Authorization': `Bearer ${token}`
            },
            success: (res) => {
              if (res.statusCode === 200) {
                resolve(JSON.parse(res.data))
              } else {
                reject(JSON.parse(res.data))
              }
            },
            fail: (err) => reject(err)
          })
        } else if (data.vehicleImageFiles?.length > 0) {
          // 仅上传车辆图片
          wx.uploadFile({
            url: `http://localhost:8082/api/property/vehicles/${id}/update-with-images`,
            filePath: data.vehicleImageFiles[0],
            name: 'vehicleImageFiles',
            formData: formData,
            header: {
              'Authorization': `Bearer ${token}`
            },
            success: (res) => {
              if (res.statusCode === 200) {
                resolve(JSON.parse(res.data))
              } else {
                reject(JSON.parse(res.data))
              }
            },
            fail: (err) => reject(err)
          })
        }
      })
    }
    
    // 无图片，使用查询参数方式
    let params = []
    if (data.plateNumber) params.push(`plateNumber=${encodeURIComponent(data.plateNumber)}`)
    if (data.vehicleType) params.push(`vehicleType=${encodeURIComponent(data.vehicleType)}`)
    if (data.brand) params.push(`brand=${encodeURIComponent(data.brand)}`)
    if (data.model) params.push(`model=${encodeURIComponent(data.model)}`)
    if (data.color) params.push(`color=${encodeURIComponent(data.color)}`)
    if (data.vehicleLicenseNo) params.push(`vehicleLicenseNo=${encodeURIComponent(data.vehicleLicenseNo)}`)
    if (data.engineNo) params.push(`engineNo=${encodeURIComponent(data.engineNo)}`)
    if (data.status) params.push(`status=${encodeURIComponent(data.status)}`)
    if (data.registerDate) params.push(`registerDate=${encodeURIComponent(data.registerDate)}`)
    if (data.remark) params.push(`remark=${encodeURIComponent(data.remark)}`)
    if (data.ownerId) params.push(`ownerId=${data.ownerId}`)
    if (data.fixedSpaceId) params.push(`fixedSpaceId=${data.fixedSpaceId}`)
    
    const queryString = params.join('&')
    const url = `/api/property/vehicles/${id}/update${queryString ? '?' + queryString : ''}`
    return new Promise((resolve, reject) => {
      const token = getApp().getToken()
      wx.request({
        url: `http://localhost:8082${url}`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(res.data)
          }
        },
        fail: (err) => reject(err)
      })
    })
  },

  // 车位管理
  addParkingSpace: (data) => request('/api/property/parking/space/add', 'POST', data, true, 'staff'),
  listParkingSpaces: (page, pageSize, status) => 
    request(`/api/property/parking/spaces?page=${page}&size=${pageSize}${status ? '&status=' + status : ''}`, 'GET', {}, true, 'staff'),
  getParkingSpaceDetail: (id) => 
    request(`/api/property/parking/space/${id}`, 'GET', {}, true, 'staff'),
  updateParkingSpace: (id, data) => 
    request(`/api/property/parking/space/${id}/update`, 'PUT', data, true, 'staff'),
  deleteParkingSpace: (id) => 
    request(`/api/property/parking/space/${id}/delete`, 'DELETE', {}, true, 'staff'),

  // 房屋管理
  associateOwnerToHouse: (data) => request('/api/property/houses/associate', 'POST', data, true, 'staff'),
  listOwnerHouses: (ownerId, page, pageSize) => request(`/api/property/houses/${ownerId}?page=${page}&size=${pageSize}`, 'GET', {}, true, 'staff'),
  updateHouseInfo: (id, data) => request(`/api/property/houses/${id}/update`, 'POST', data, true, 'staff'),
  listHouses: (page, pageSize, keyword) =>
    request(`/api/property/houses?page=${page}&size=${pageSize}${keyword ? '&keyword=' + encodeURIComponent(keyword) : ''}`, 'GET', {}, true, 'staff'),
  getHouseDetail: (id) =>
    request(`/api/property/houses/${id}`, 'GET', {}, true, 'staff'),
  addHouse: (data) =>
    request('/api/property/houses/add', 'POST', data, true, 'staff'),
  updateHouse: (id, data) => {
    return new Promise((resolve, reject) => {
      const token = getApp().getToken()
      
      // 构建查询参数
      let params = []
      if (data.roomNo) params.push(`roomNo=${encodeURIComponent(data.roomNo)}`)
      if (data.fullRoomNo) params.push(`fullRoomNo=${encodeURIComponent(data.fullRoomNo)}`)
      if (data.houseCode) params.push(`houseCode=${encodeURIComponent(data.houseCode)}`)
      if (data.buildingArea !== null && data.buildingArea !== undefined) params.push(`buildingArea=${data.buildingArea}`)
      if (data.usableArea !== null && data.usableArea !== undefined) params.push(`usableArea=${data.usableArea}`)
      if (data.sharedArea !== null && data.sharedArea !== undefined) params.push(`sharedArea=${data.sharedArea}`)
      if (data.houseType) params.push(`houseType=${encodeURIComponent(data.houseType)}`)
      if (data.houseLayout) params.push(`houseLayout=${encodeURIComponent(data.houseLayout)}`)
      if (data.houseOrientation) params.push(`houseOrientation=${encodeURIComponent(data.houseOrientation)}`)
      if (data.parkingSpaceNo) params.push(`parkingSpaceNo=${encodeURIComponent(data.parkingSpaceNo)}`)
      if (data.parkingType) params.push(`parkingType=${encodeURIComponent(data.parkingType)}`)
      if (data.houseStatus) params.push(`houseStatus=${encodeURIComponent(data.houseStatus)}`)
      if (data.decorationStatus) params.push(`decorationStatus=${encodeURIComponent(data.decorationStatus)}`)
      if (data.floorLevel !== null && data.floorLevel !== undefined) params.push(`floorLevel=${data.floorLevel}`)
      if (data.hasBalcony !== null && data.hasBalcony !== undefined) params.push(`hasBalcony=${data.hasBalcony}`)
      if (data.hasGarden !== null && data.hasGarden !== undefined) params.push(`hasGarden=${data.hasGarden}`)
      if (data.remark) params.push(`remark=${encodeURIComponent(data.remark)}`)
      
      const queryString = params.length > 0 ? '?' + params.join('&') : ''
      const fullUrl = `${STAFF_BASE_URL}/api/property/houses/${id}/update${queryString}`
      
      console.log('🌐 API调用 updateHouse')
      console.log('🔗 完整URL:', fullUrl)
      console.log('📝 Data:', data)
      console.log('📋 构建的查询参数:', params)
      
      wx.request({
        url: fullUrl,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {},
        success: (res) => {
          console.log('✅ updateHouse 响应:', res)
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(res.data)
          }
        },
        fail: (err) => {
          console.error('❌ updateHouse 请求失败:', err)
          reject(err)
        }
      })
    })
  },
  updateHouseWithImages: (id, data, floorPlanImage, floorPlanToDelete) => {
    return new Promise((resolve, reject) => {
      const token = getApp().getToken()
      
      // 构建formData参数 - 仅包含后端支持的字段
      const formData = {
        roomNo: data.roomNo || '',
        fullRoomNo: data.fullRoomNo || '',
        houseCode: data.houseCode || '',
        buildingArea: data.buildingArea || '',
        usableArea: data.usableArea || '',
        sharedArea: data.sharedArea || '',
        houseType: data.houseType || '',
        houseLayout: data.houseLayout || '',
        houseOrientation: data.houseOrientation || '',
        parkingSpaceNo: data.parkingSpaceNo || '',
        parkingType: data.parkingType || '',
        houseStatus: data.houseStatus || '',
        decorationStatus: data.decorationStatus || '',
        floorLevel: data.floorLevel || '',
        hasBalcony: data.hasBalcony || '',
        hasGarden: data.hasGarden || '',
        remark: data.remark || '',
        floorPlanImageToDelete: floorPlanToDelete || ''
      }
      
      console.log('🏠 updateHouseWithImages called:', {
        id: id,
        hasFloorPlanImage: !!floorPlanImage,
        floorPlanToDelete: floorPlanToDelete,
        dataKeys: Object.keys(data)
      })
      
      // 如果有楼层平面图要上传
      if (floorPlanImage) {
        console.log('📸 上传楼层平面图:', floorPlanImage)
        wx.uploadFile({
          url: `${STAFF_BASE_URL}/api/property/houses/${id}/update-with-images`,
          filePath: floorPlanImage,
          name: 'floorPlanImageFile',
          formData: formData,
          header: {
            'Authorization': `Bearer ${token}`
          },
          success: (res) => {
            console.log('🏠 楼层平面图上传响应:', res.statusCode, res.data)
            if (res.statusCode === 200) {
              try {
                resolve(JSON.parse(res.data))
              } catch (e) {
                resolve(res.data)
              }
            } else {
              try {
                reject(JSON.parse(res.data))
              } catch (e) {
                reject({
                  success: false,
                  message: `上传失败: ${res.statusCode}`,
                  data: res.data
                })
              }
            }
          },
          fail: (err) => {
            console.error('🏠 楼层平面图上传失败:', err)
            reject(err)
          }
        })
      } else if (floorPlanToDelete) {
        // 仅删除不上传，使用wx.request
        console.log('🗑️  删除楼层平面图:', floorPlanToDelete)
        wx.request({
          url: `${STAFF_BASE_URL}/api/property/houses/${id}/update-with-images`,
          method: 'POST',
          header: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: formData,
          success: (res) => {
            console.log('🏠 楼层平面图删除响应:', res.statusCode, res.data)
            if (res.statusCode === 200) {
              resolve(res.data)
            } else {
              reject(res.data)
            }
          },
          fail: (err) => {
            console.error('🏠 楼层平面图删除失败:', err)
            reject(err)
          }
        })
      } else {
        // 无图片变化，使用普通update
        console.log('📝 无图片变化，仅更新其他字段')
        resolve({ success: true, message: '更新成功' })
      }
    })
  },
  deleteHouse: (id) =>
    request(`/api/property/houses/${id}/delete`, 'DELETE', {}, true, 'staff'),

  // 公告管理
  addNotice: (data) => request('/api/property/notice/add', 'POST', data, true, 'staff'),
  createNotice: (data) => request('/api/property/notice/add', 'POST', data, true, 'staff'),
  createNoticeWithJson: (data) => request('/api/property/notice/add-json', 'POST', data, true, 'staff'),
  updateNotice: (id, data) => request(`/api/property/notice/${id}/update`, 'POST', data, true, 'staff'),
  updateNoticeWithImages: (id, data) => {
    return new Promise((resolve, reject) => {
      const token = getApp().getToken()
      
      // 检查是否有新图片要上传
      const hasNewImages = data.noticeImageFiles && data.noticeImageFiles.length > 0
      console.log('updateNoticeWithImages called with:', {
        noticeId: id,
        hasNewImages: hasNewImages,
        imageCount: hasNewImages ? data.noticeImageFiles.length : 0,
        deleteImages: data.noticeImagesToDelete || '',
        title: data.title
      })
      
      // 构建formData参数 - 包含所有后端支持的字段
      const formData = {
        title: data.title || '',
        content: data.content || '',
        noticeType: data.noticeType || '',
        isUrgent: data.isUrgent || 0,
        isTop: data.isTop || 0,
        activityDate: data.activityDate || '',
        activityTime: data.activityTime || '',
        activityLocation: data.activityLocation || '',
        activityOrganizer: data.activityOrganizer || '',
        activityContact: data.activityContact || '',
        activityContactPhone: data.activityContactPhone || '',
        startTime: data.startTime || '',
        endTime: data.endTime || '',
        remark: data.remark || '',
        noticeImagesToDelete: data.noticeImagesToDelete || ''
      }
      
      // 如果有图片文件要上传（仅支持一张图片）
      if (hasNewImages) {
        // 只上传第一张图片
        const filePath = data.noticeImageFiles[0]
        console.log('准备上传图片，路径:', filePath)
        
        wx.uploadFile({
          url: `${STAFF_BASE_URL}/api/property/notice/${id}/update-with-images`,
          filePath: filePath,
          name: 'noticeImageFiles',
          formData: formData,
          header: {
            'Authorization': `Bearer ${token}`
          },
          success: (res) => {
            console.log('====== 公告图片上传响应 ======')
            console.log('状态码:', res.statusCode)
            console.log('响应数据:', res.data)
            console.log('响应headers:', res.header)
            
            if (res.statusCode === 200) {
              try {
                const result = JSON.parse(res.data)
                console.log('解析后的结果:', result)
                resolve(result)
              } catch (e) {
                console.error('JSON解析失败:', e)
                resolve(res.data)
              }
            } else {
              console.error('请求失败，状态码:', res.statusCode)
              try {
                reject(JSON.parse(res.data))
              } catch (e) {
                reject({
                  success: false,
                  message: `请求失败: ${res.statusCode}`,
                  data: res.data
                })
              }
            }
          },
          fail: (err) => {
            console.error('====== 公告图片上传失败 ======')
            console.error('错误详情:', err)
            reject(err)
          }
        })
      } else {
        // 无新图片要上传，但可能有图片要删除或其他字段要更新
        console.log('无新图片，使用wx.request更新其他字段，删除标志:', formData.noticeImagesToDelete)
        wx.request({
          url: `${STAFF_BASE_URL}/api/property/notice/${id}/update-with-images`,
          method: 'POST',
          header: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: formData,
          success: (res) => {
            console.log('====== 公告更新响应 ======')
            console.log('状态码:', res.statusCode)
            console.log('响应数据:', res.data)
            
            if (res.statusCode === 200) {
              resolve(res.data)
            } else {
              console.error('请求失败，状态码:', res.statusCode)
              reject(res.data)
            }
          },
          fail: (err) => {
            console.error('====== 公告更新失败 ======')
            console.error('错误详情:', err)
            reject(err)
          }
        })
      }
    })
  },
  createNoticeWithImages: (data) => {
    return new Promise((resolve, reject) => {
      const token = getApp().getToken()
      
      const formData = {
        title: data.title || '',
        content: data.content || '',
        categoryName: data.categoryName || '',
        remark: data.remark || '',
        noticeImageFile: data.noticeImageFile || ''
      }
      
      if (data.noticeImageFile) {
        wx.uploadFile({
          url: `${STAFF_BASE_URL}/api/property/notice/add-with-images`,
          filePath: data.noticeImageFile,
          name: 'noticeImageFile',
          formData: formData,
          header: {
            'Authorization': `Bearer ${token}`
          },
          success: (res) => {
            if (res.statusCode === 200) {
              resolve(JSON.parse(res.data))
            } else {
              reject(JSON.parse(res.data))
            }
          },
          fail: (err) => reject(err)
        })
      } else {
        resolve({ success: true, message: '无图片上传' })
      }
    })
  },
  deleteNotice: (id) => request(`/api/property/notice/${id}/delete`, 'POST', {}, true, 'staff'),
  listNotices: (page = 1, pageSize = 10, categoryName, keyword) => {
    let url = `/api/property/notice/notices?page=${page}&size=${pageSize}`
    if (categoryName && categoryName.trim()) {
      url += `&categoryName=${encodeURIComponent(categoryName)}`
    }
    if (keyword && keyword.trim()) {
      url += `&keyword=${encodeURIComponent(keyword)}`
    }
    return request(url, 'GET', {}, true, 'staff')
  },
  getNoticeDetail: (id) => request(`/api/property/notice/detail/${id}`, 'GET', {}, true, 'staff'),
  incrementNoticeReadCount: (id) => request(`/api/property/notice/${id}/read`, 'POST', {}, true, 'staff'),
  uploadImage: (filePath) => {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: `${STAFF_BASE_URL}/api/property/upload/image`,
        filePath: filePath,
        name: 'file',
        header: {
          'Authorization': `Bearer ${getApp().getToken()}`
        },
        success: (res) => {
          console.log('图片上传响应:', res)
          
          // 处理HTTP错误状态码
          if (res.statusCode !== 200) {
            let errorMsg = '上传失败'
            if (res.statusCode === 413) {
              errorMsg = '文件过大，请选择小于50MB的图片'
            } else if (res.statusCode === 401) {
              errorMsg = '认证失败，请重新登录'
            } else if (res.statusCode === 400) {
              errorMsg = '请求参数错误'
            } else if (res.statusCode >= 500) {
              errorMsg = '服务器错误，请稍后重试'
            }
            console.error(`上传失败 (${res.statusCode}):`, res.data, errorMsg)
            reject(new Error(errorMsg))
            return
          }
          
          try {
            const data = JSON.parse(res.data)
            if (data.success) {
              resolve({ success: true, data: data.data })
            } else {
              console.error('上传失败详情:', data)
              reject(new Error(data.message || '上传失败'))
            }
          } catch (parseErr) {
            console.error('响应解析失败:', parseErr, res.data)
            reject(new Error('服务器返回数据格式错误'))
          }
        },
        fail: (err) => {
          console.error('上传请求失败:', err)
          reject(err)
        }
      })
    })
  },

  // 部门信息
  getDepartmentInfo: (id) => request(`/api/property/department/${id}`, 'GET', {}, true, 'staff'),
  listDepartments: () => request('/api/property/department/my-department', 'GET', {}, true, 'staff'),
  
  // 任务管理 (保留原有的)
  getMyTasks: (page, pageSize, status, taskType) => {
    const statusParam = status ? `&status=${encodeURIComponent(status)}` : ''
    const typeParam = taskType ? `&taskType=${encodeURIComponent(taskType)}` : ''
    return request(`/api/property/task/my-list?page=${page}&size=${pageSize}${statusParam}${typeParam}`, 'GET', {}, true, 'staff')
  },
  getTaskDetail: (id) => request(`/api/property/task/detail/${id}`, 'GET', {}, true, 'staff'),
  acceptTask: (id, remark) => request(`/api/property/task/accept/${id}?remark=${encodeURIComponent(remark || '')}`, 'POST', {}, true, 'staff'),
  updateTaskProgress: (id, data) => request(`/api/property/task/update-progress/${id}`, 'POST', data, true, 'staff'),
  completeTask: (id, data) => request(`/api/property/task/complete/${id}`, 'POST', data, true, 'staff'),
  getTaskTimeline: (id) => request(`/api/property/task/timeline/${id}`, 'GET', {}, true, 'staff'),
  getTaskStatistics: () => request('/api/property/task/statistics', 'GET', {}, true, 'staff'),
  requestReassign: (id, reason, suggestedStaffId) => {
    const staffParam = suggestedStaffId ? `&suggestedStaffId=${suggestedStaffId}` : ''
    return request(`/api/property/task/request-reassign/${id}?reason=${encodeURIComponent(reason)}${staffParam}`, 'POST', {}, true, 'staff')
  },

  // 部门信息 (保留原有的)
  getMyDepartment: () => request('/api/property/department/my-department', 'GET', {}, true, 'staff'),
  getDepartmentMembers: () => request('/api/property/department/members', 'GET', {}, true, 'staff'),
  getDepartmentTaskStatistics: () => request('/api/property/department/task-statistics', 'GET', {}, true, 'staff'),

  // 仪表详情
  getMeterDetailInfo: (meterId) => request(`/api/property/meter/${meterId}`, 'GET', {}, true, 'staff'),

  // 获取业主仪表列表
  getOwnerMeters: (ownerId, page, pageSize) => request(`/api/property/meter/owner/${ownerId}?page=${page}&size=${pageSize}`, 'GET', {}, true, 'staff'),

  // 获取仪表配置列表
  getMeterConfigList: (page, pageSize, categoryName) => {
    const categoryParam = categoryName ? `&categoryName=${encodeURIComponent(categoryName)}` : ''
    return request(`/api/property/meter/configs?page=${page}&size=${pageSize}${categoryParam}`, 'GET', {}, true, 'staff')
  },

  // 添加仪表配置
  addMeterConfigNew: (data) => request('/api/property/meter/config/add', 'POST', data, true, 'staff'),

  // 添加抄表记录
  addMeterReadingNew: (formData) => {
    return new Promise((resolve, reject) => {
      const token = getApp().getToken()
      wx.request({
        url: `${STAFF_BASE_URL}/api/property/meter/reading/add`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`
        },
        data: formData,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(res.data)
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },

  // 查询抄表记录列表
  getMeterReadingsList: (meterId, page, pageSize) => request(`/api/property/meter/readings/${meterId}?page=${page}&size=${pageSize}`, 'GET', {}, true, 'staff'),

  // 为业主添加仪表
  addMeterToOwnerNew: (formData) => {
    return new Promise((resolve, reject) => {
      const token = getApp().getToken()
      wx.request({
        url: `${STAFF_BASE_URL}/api/property/meter/add-to-owner`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: formData,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(res.data)
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },

  // 为业主添加车辆 (修复路径和参数)
  addVehicleNew: (formData) => {
    return new Promise((resolve, reject) => {
      const token = getApp().getToken()
      wx.request({
        url: `${STAFF_BASE_URL}/api/property/vehicles/add`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`
        },
        data: formData,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(res.data)
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  },

  // 更新车辆信息 (包含图片)
  updateVehicleWithImages: (id, data) => {
    return new Promise((resolve, reject) => {
      const token = getApp().getToken()
      
      // 构建formData参数 - 仅包含后端支持的字段
      const formData = {
        vehicleType: data.vehicleType || '',
        brand: data.brand || '',
        model: data.model || '',
        color: data.color || '',
        fixedSpaceId: data.fixedSpaceId || '',
        vehicleLicenseNo: data.vehicleLicenseNo || '',
        engineNo: data.engineNo || '',
        status: data.status || '',
        registerDate: data.registerDate || '',
        remark: data.remark || '',
        driverLicenseImageToDelete: data.driverLicenseImageToDelete || '',
        vehicleImagesToDelete: data.vehicleImagesToDelete || ''
      }
      
      // 如果有两个文件，需要分两次上传（但都保留完整参数）
      if (data.driverLicenseImageFiles?.length > 0 && data.vehicleImageFiles?.length > 0) {
        // 第一步：上传驾驶证
        wx.uploadFile({
          url: `${STAFF_BASE_URL}/api/property/vehicles/${id}/update-with-images`,
          filePath: data.driverLicenseImageFiles[0],
          name: 'driverLicenseImageFile',
          formData: formData,
          header: {
            'Authorization': `Bearer ${token}`
          },
          success: (res1) => {
            if (res1.statusCode === 200) {
              // 驾驶证上传成功，继续上传车辆图片
              wx.uploadFile({
                url: `${STAFF_BASE_URL}/api/property/vehicles/${id}/update-with-images`,
                filePath: data.vehicleImageFiles[0],
                name: 'vehicleImageFiles',
                formData: formData,
                header: {
                  'Authorization': `Bearer ${token}`
                },
                success: (res2) => {
                  if (res2.statusCode === 200) {
                    resolve(JSON.parse(res2.data))
                  } else {
                    reject(JSON.parse(res2.data))
                  }
                },
                fail: (err) => reject(err)
              })
            } else {
              reject(JSON.parse(res1.data))
            }
          },
          fail: (err) => reject(err)
        })
      } else if (data.driverLicenseImageFiles?.length > 0) {
        // 仅上传驾驶证
        wx.uploadFile({
          url: `${STAFF_BASE_URL}/api/property/vehicles/${id}/update-with-images`,
          filePath: data.driverLicenseImageFiles[0],
          name: 'driverLicenseImageFile',
          formData: formData,
          header: {
            'Authorization': `Bearer ${token}`
          },
          success: (res) => {
            if (res.statusCode === 200) {
              resolve(JSON.parse(res.data))
            } else {
              reject(JSON.parse(res.data))
            }
          },
          fail: (err) => reject(err)
        })
      } else if (data.vehicleImageFiles?.length > 0) {
        // 仅上传车辆图片
        wx.uploadFile({
          url: `${STAFF_BASE_URL}/api/property/vehicles/${id}/update-with-images`,
          filePath: data.vehicleImageFiles[0],
          name: 'vehicleImageFiles',
          formData: formData,
          header: {
            'Authorization': `Bearer ${token}`
          },
          success: (res) => {
            if (res.statusCode === 200) {
              resolve(JSON.parse(res.data))
            } else {
              reject(JSON.parse(res.data))
            }
          },
          fail: (err) => reject(err)
        })
      } else {
        // 无图片，直接成功
        resolve({ success: true, message: '无图片上传' })
      }
    })
  }
}

// 导出API
module.exports = {
  ownerAPI,
  staffAPI,
  request
}

