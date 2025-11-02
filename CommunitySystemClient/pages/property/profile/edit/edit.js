// pages/property/profile/edit/edit.js
// 员工资料管理 - 编辑个人信息页面
const { staffAPI } = require('../../../../utils/api.js')
const { showToast, showLoading, hideLoading } = require('../../../../utils/util.js')

Page({
  data: {
    // 基本信息
    phone: '',
    email: '',
    gender: '',
    birthDate: '',
    
    // 联系信息
    wechat: '',
    telephoneAreaCode: '',
    telephoneNumber: '',
    telephoneExtension: '',
    emergencyContact: '',
    emergencyPhone: '',
    
    // 教育信息
    graduateSchool: '',
    graduationDate: '',
    educationLevel: '',
    major: '',
    
    // 籍贯
    nativePlace: '',
    
    // 头像
    avatar: '',
    
    // 图片相关
    idCardPhotos: null,  // 当前已有的身份证照片
    certificatePhotos: null,  // 当前已有的证件照
    idCardPhotoFiles: [],  // 新上传的身份证照片
    certificatePhotoFiles: [],  // 新上传的证件照
    idCardPhotosToDelete: [],  // 需要删除的身份证照片
    certificatePhotosToDelete: [],  // 需要删除的证件照
    
    // 选项
    genderOptions: ['男', '女', '保密'],
    educationLevelOptions: ['初中', '高中', '中专', '大专', '本科', '硕士', '博士'],
    
    // 状态
    loading: true,
    submitting: false,
    errors: {}
  },

  onLoad() {
    this.loadProfileData()
  },

  // 加载个人资料数据
  async loadProfileData() {
    try {
      showLoading('加载中...')

      const res = await staffAPI.getProfile()

      hideLoading()

      if (res && res.success && res.data) {
        const data = res.data
        this.setData({
          phone: data.phone || '',
          email: data.email || '',
          gender: data.gender || '保密',
          birthDate: data.birthDate || '',
          wechat: data.wechat || '',
          telephoneAreaCode: data.telephoneAreaCode || '',
          telephoneNumber: data.telephoneNumber || '',
          telephoneExtension: data.telephoneExtension || '',
          emergencyContact: data.emergencyContact || '',
          emergencyPhone: data.emergencyPhone || '',
          graduateSchool: data.graduateSchool || '',
          graduationDate: data.graduationDate || '',
          educationLevel: data.educationLevel || '',
          major: data.major || '',
          nativePlace: data.nativePlace || '',
          avatar: data.avatar || '',
          // 处理身份证照片：可能是JSON数组或单个URL字符串
          idCardPhotos: this.parseImageField(data.idCardPhotos),
          // 处理证件照：可能是JSON数组或单个URL字符串
          certificatePhotos: this.parseImageField(data.certificatePhotos),
          loading: false
        })
      } else {
        showToast('加载失败')
        this.setData({ loading: false })
      }
    } catch (err) {
      hideLoading()
      console.error('加载资料失败:', err)
      showToast('加载失败')
      this.setData({ loading: false })
    }
  },

  // 解析图片字段，支持单个URL字符串
  parseImageField(data) {
    if (!data) {
      return null
    }
    
    // 如果是数组，取第一个（向后兼容）
    if (Array.isArray(data)) {
      return data[0] || null
    }
    
    // 如果是字符串，直接返回
    if (typeof data === 'string') {
      return data
    }
    
    return null
  },

  // ===== 基本字段输入 =====
  onPhoneInput(e) {
    this.setData({ phone: e.detail.value })
    this.validateField('phone')
  },

  onEmailInput(e) {
    this.setData({ email: e.detail.value })
    this.validateField('email')
  },

  onGenderChange(e) {
    this.setData({ gender: this.data.genderOptions[e.detail.value] })
  },

  onBirthDateChange(e) {
    this.setData({ birthDate: e.detail.value })
  },

  onWechatInput(e) {
    this.setData({ wechat: e.detail.value })
  },

  onTelephoneAreaCodeInput(e) {
    this.setData({ telephoneAreaCode: e.detail.value })
  },

  onTelephoneNumberInput(e) {
    this.setData({ telephoneNumber: e.detail.value })
  },

  onTelephoneExtensionInput(e) {
    this.setData({ telephoneExtension: e.detail.value })
  },

  onEmergencyContactInput(e) {
    this.setData({ emergencyContact: e.detail.value })
  },

  onEmergencyPhoneInput(e) {
    this.setData({ emergencyPhone: e.detail.value })
  },

  onGraduateSchoolInput(e) {
    this.setData({ graduateSchool: e.detail.value })
  },

  onGraduationDateChange(e) {
    this.setData({ graduationDate: e.detail.value })
  },

  onEducationLevelChange(e) {
    this.setData({ educationLevel: this.data.educationLevelOptions[e.detail.value] })
  },

  onMajorInput(e) {
    this.setData({ major: e.detail.value })
  },

  onNativePlaceInput(e) {
    this.setData({ nativePlace: e.detail.value })
  },

  // ===== 图片相关方法 =====
  chooseIdCardPhotos() {
    // 只允许上传1张
    if (this.data.idCardPhotos || this.data.idCardPhotoFiles.length > 0) {
      showToast('身份证照片最多1张，请先删除')
      return
    }

    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          idCardPhotoFiles: [res.tempFilePaths[0]]
        })
      }
    })
  },

  chooseCertificatePhotos() {
    // 只允许上传1张
    if (this.data.certificatePhotos || this.data.certificatePhotoFiles.length > 0) {
      showToast('证件照最多1张，请先删除')
      return
    }

    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          certificatePhotoFiles: [res.tempFilePaths[0]]
        })
      }
    })
  },

  deleteIdCardPhoto(e) {
    this.setData({
      idCardPhotos: null,
      idCardPhotosToDelete: this.data.idCardPhotos ? [this.data.idCardPhotos] : []
    })
  },

  deleteCertificatePhoto(e) {
    this.setData({
      certificatePhotos: null,
      certificatePhotosToDelete: this.data.certificatePhotos ? [this.data.certificatePhotos] : []
    })
  },

  deleteIdCardPhotoFile(e) {
    const { index } = e.currentTarget.dataset
    const files = [...this.data.idCardPhotoFiles]
    files.splice(index, 1)
    this.setData({ idCardPhotoFiles: files })
  },

  deleteCertificatePhotoFile(e) {
    const { index } = e.currentTarget.dataset
    const files = [...this.data.certificatePhotoFiles]
    files.splice(index, 1)
    this.setData({ certificatePhotoFiles: files })
  },

  previewPhoto(e) {
    const { url } = e.currentTarget.dataset
    wx.previewImage({
      urls: [url],
      current: url
    })
  },

  // 字段验证
  validateField(fieldName) {
    const errors = this.data.errors
    
    switch (fieldName) {
      case 'phone':
        if (this.data.phone && !/^1[3-9]\d{9}$/.test(this.data.phone)) {
          errors.phone = '请输入有效的手机号'
        } else {
          delete errors.phone
        }
        break
      case 'email':
        if (this.data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.data.email)) {
          errors.email = '请输入有效的邮箱地址'
        } else {
          delete errors.email
        }
        break
    }
    
    this.setData({ errors })
  },

  // 验证所有字段
  validateForm() {
    const errors = {}
    
    if (this.data.phone && !/^1[3-9]\d{9}$/.test(this.data.phone)) {
      errors.phone = '请输入有效的手机号'
    }
    if (this.data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.data.email)) {
      errors.email = '请输入有效的邮箱地址'
    }

    this.setData({ errors })
    return Object.keys(errors).length === 0
  },

  // 提交表单
  async submitForm() {
    if (!this.validateForm()) {
      showToast('请检查输入的信息')
      return
    }

    if (this.data.submitting) return

    this.setData({ submitting: true })
    showLoading('更新中...')

    try {
      // 获取token，确保token存在
      const app = getApp()
      const token = app.getToken ? app.getToken() : wx.getStorageSync('authToken')
      
      if (!token) {
        hideLoading()
        showToast('认证失败，请重新登录')
        wx.navigateTo({
          url: '/pages/login/login'
        })
        return
      }

      console.log('Token已获取:', token.substring(0, 20) + '...')

      // 构建基础表单数据对象
      const baseFormData = {}

      // 基本字段
      if (this.data.phone) baseFormData.phone = this.data.phone.trim()
      if (this.data.email) baseFormData.email = this.data.email.trim()
      if (this.data.gender) baseFormData.gender = this.data.gender
      if (this.data.birthDate) baseFormData.birthDate = this.data.birthDate
      if (this.data.wechat) baseFormData.wechat = this.data.wechat.trim()
      if (this.data.telephoneAreaCode) baseFormData.telephoneAreaCode = this.data.telephoneAreaCode.trim()
      if (this.data.telephoneNumber) baseFormData.telephoneNumber = this.data.telephoneNumber.trim()
      if (this.data.telephoneExtension) baseFormData.telephoneExtension = this.data.telephoneExtension.trim()
      if (this.data.emergencyContact) baseFormData.emergencyContact = this.data.emergencyContact.trim()
      if (this.data.emergencyPhone) baseFormData.emergencyPhone = this.data.emergencyPhone.trim()
      if (this.data.graduateSchool) baseFormData.graduateSchool = this.data.graduateSchool.trim()
      if (this.data.graduationDate) baseFormData.graduationDate = this.data.graduationDate
      if (this.data.educationLevel) baseFormData.educationLevel = this.data.educationLevel
      if (this.data.major) baseFormData.major = this.data.major.trim()
      if (this.data.nativePlace) baseFormData.nativePlace = this.data.nativePlace.trim()
      if (this.data.avatar) baseFormData.avatar = this.data.avatar.trim()

      // 删除的图片（JSON数组字符串）
      if (this.data.idCardPhotosToDelete.length > 0) {
        baseFormData.idCardPhotosToDelete = JSON.stringify(this.data.idCardPhotosToDelete)
      }
      if (this.data.certificatePhotosToDelete.length > 0) {
        baseFormData.certificatePhotosToDelete = JSON.stringify(this.data.certificatePhotosToDelete)
      }

      const uploadUrl = `http://localhost:8082/api/property/profile/update-basic-with-images`
      
      console.log('🎯 ====== 个人资料编辑提交 ======')
      console.log('📍 uploadUrl:', uploadUrl)
      console.log('📍 Token:', token.substring(0, 20) + '...')
      console.log('📍 baseFormData:', baseFormData)
      
      // 检查是否有图片需要上传
      const hasIdCardPhotos = this.data.idCardPhotoFiles && this.data.idCardPhotoFiles.length > 0
      const hasCertificatePhotos = this.data.certificatePhotoFiles && this.data.certificatePhotoFiles.length > 0
      
      console.log('📸 身份证照片:', {
        has: hasIdCardPhotos,
        count: this.data.idCardPhotoFiles?.length || 0,
        files: this.data.idCardPhotoFiles
      })
      console.log('📸 证件照:', {
        has: hasCertificatePhotos,
        count: this.data.certificatePhotoFiles?.length || 0,
        files: this.data.certificatePhotoFiles
      })

      // 如果有身份证照片，一张一张上传（不包含删除列表在中间的上传）
      if (hasIdCardPhotos) {
        console.log('🔄 开始上传身份证照片...')
        for (let i = 0; i < this.data.idCardPhotoFiles.length; i++) {
          console.log(`📤 上传身份证照片 ${i + 1}/${this.data.idCardPhotoFiles.length}`)
          try {
            // 上传文件时，不包含删除列表，使用无删除列表的formData
            const uploadFormData = { ...baseFormData }
            delete uploadFormData.idCardPhotosToDelete
            delete uploadFormData.certificatePhotosToDelete
            console.log('📝 上传时使用的formData:', uploadFormData)
            await this.uploadImageFile(uploadUrl, this.data.idCardPhotoFiles[i], 'idCardPhotoFiles', token, uploadFormData)
            console.log(`✅ 身份证照片 ${i + 1} 上传成功`)
          } catch (err) {
            console.error(`❌ 身份证照片 ${i + 1} 上传失败:`, err)
            throw err
          }
        }
      }

      // 如果有证件照，一张一张上传（不包含删除列表在中间的上传）
      if (hasCertificatePhotos) {
        console.log('🔄 开始上传证件照...')
        for (let i = 0; i < this.data.certificatePhotoFiles.length; i++) {
          console.log(`📤 上传证件照 ${i + 1}/${this.data.certificatePhotoFiles.length}`)
          try {
            // 上传文件时，不包含删除列表，使用无删除列表的formData
            const uploadFormData = { ...baseFormData }
            delete uploadFormData.idCardPhotosToDelete
            delete uploadFormData.certificatePhotosToDelete
            console.log('📝 上传时使用的formData:', uploadFormData)
            await this.uploadImageFile(uploadUrl, this.data.certificatePhotoFiles[i], 'certificatePhotoFiles', token, uploadFormData)
            console.log(`✅ 证件照 ${i + 1} 上传成功`)
          } catch (err) {
            console.error(`❌ 证件照 ${i + 1} 上传失败:`, err)
            throw err
          }
        }
      }

      // 如果有文本内容需要更新，或者有图片需要删除，或者没有上传任何文件，都要发送最终更新请求
      // 这确保删除列表只在最后一次请求中发送，避免与文件上传冲突
      if (Object.keys(baseFormData).length > 0 || (!hasIdCardPhotos && !hasCertificatePhotos)) {
        console.log('📝 发送文本字段更新请求（包含删除列表）')
        console.log('📝 最终提交的baseFormData:', baseFormData)
        try {
          await this.updateProfileData(uploadUrl, baseFormData, token)
          console.log('✅ 文本字段更新成功')
        } catch (err) {
          console.error('❌ 文本字段更新失败:', err)
          throw err
        }
      }

      hideLoading()
      showToast('更新成功')
      setTimeout(() => {
        wx.navigateBack()
      }, 1000)
    } catch (err) {
      hideLoading()
      console.error('提交失败:', err)
      if (err.message && err.message.includes('认证失败')) {
        showToast('认证失败，请重新登录')
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/login/login'
          })
        }, 1000)
      } else {
        showToast('提交失败: ' + (err.message || '网络错误'))
      }
    } finally {
      this.setData({ submitting: false })
    }
  },

  /**
   * 异步上传图片文件
   */
  uploadImageFile(url, filePath, paramName, token, formData) {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: url,
        filePath: filePath,
        name: paramName,
        formData: formData,
        header: {
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          console.log(`📥 ${paramName} 上传响应:`, res.statusCode)
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject({
              statusCode: res.statusCode,
              data: res.data
            })
          }
        },
        fail: (err) => {
          console.error(`❌ ${paramName} 上传失败:`, err)
          reject(err)
        }
      })
    })
  },

  /**
   * 异步更新个人资料数据
   */
  updateProfileData(url, formData, token) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: url,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: formData,
        success: (res) => {
          console.log('📥 个人资料更新响应:', res.statusCode)
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject({
              statusCode: res.statusCode,
              data: res.data
            })
          }
        },
        fail: (err) => {
          console.error('❌ 个人资料更新失败:', err)
          reject(err)
        }
      })
    })
  },

  // 返回
  goBack() {
    wx.navigateBack()
  }
})