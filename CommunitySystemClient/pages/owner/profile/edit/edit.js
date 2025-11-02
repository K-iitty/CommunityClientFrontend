// pages/owner/profile/edit/edit.js
const app = getApp()
const { ownerAPI } = require('../../../../utils/api.js')
const { showLoading, hideLoading, showToast, showConfirm } = require('../../../../utils/util.js')

Page({
  data: {
    owner: null,
    loading: true,
    saving: false,
    editMode: false,  // 编辑模式开关：false=预览，true=编辑
    avatar: null,
    idCardPhotos: [],
    formData: {
      name: '',
      phone: '',
      idCard: '',
      gender: '',
      birthDate: '',
      politicalStatus: '',
      maritalStatus: '',
      nationality: '汉族',
      householdType: '',
      censusRegister: '',
      currentAddress: '',
      emergencyContactName: '',
      emergencyContactRelation: '',
      emergencyContactPhone: '',
      residenceType: '',
      moveInDate: ''
    }
  },

  onLoad() {
    this.loadOwnerInfo()
  },

  async loadOwnerInfo() {
    try {
      showLoading()
      const res = await ownerAPI.getProfile()
      
      if (res && res.success && res.data) {
        const owner = res.data
        
        // 处理证件照 (accessControlPhotos) - 支持多种格式
        let avatar = null
        if (owner.accessControlPhotos) {
          if (typeof owner.accessControlPhotos === 'string' && owner.accessControlPhotos.length > 0) {
            avatar = owner.accessControlPhotos
            console.log('✅ 加载证件照:', avatar)
          }
        } else if (owner.avatar) {
          // 备用字段
          avatar = owner.avatar
          console.log('✅ 加载证件照(avatar):', avatar)
        }
        
        // 处理 idCardPhotos - 支持多种格式
        let idCardPhotos = []
        if (owner.idCardPhotos) {
          try {
            if (typeof owner.idCardPhotos === 'string') {
              // 尝试解析JSON数组
              const parsed = JSON.parse(owner.idCardPhotos)
              if (Array.isArray(parsed)) {
                idCardPhotos = parsed
              } else if (typeof parsed === 'string' && parsed.length > 0) {
                // 单个URL
                idCardPhotos = [parsed]
              }
            } else if (Array.isArray(owner.idCardPhotos)) {
              // 已经是数组
              idCardPhotos = owner.idCardPhotos
            } else if (typeof owner.idCardPhotos === 'string' && owner.idCardPhotos.length > 0) {
              // 单个URL字符串
              idCardPhotos = [owner.idCardPhotos]
            }
          } catch (parseErr) {
            console.warn('解析idCardPhotos失败:', parseErr)
            // 如果是单个URL字符串，则作为单元素数组处理
            if (typeof owner.idCardPhotos === 'string' && owner.idCardPhotos.length > 0) {
              idCardPhotos = [owner.idCardPhotos]
            }
          }
        }
        
        console.log('📋 加载完成 - 证件照:', avatar, '身份证照片:', idCardPhotos)
        
        this.setData({
          owner: owner,
          formData: {
            name: owner.name || '',
            phone: owner.phone || '',
            idCard: owner.idCard || '',
            gender: owner.gender || '未知',
            birthDate: owner.birthDate || '',
            politicalStatus: owner.politicalStatus || '',
            maritalStatus: owner.maritalStatus || '',
            nationality: owner.nationality || '汉族',
            householdType: owner.householdType || '',
            censusRegister: owner.censusRegister || '',
            currentAddress: owner.currentAddress || '',
            emergencyContactName: owner.emergencyContactName || '',
            emergencyContactRelation: owner.emergencyContactRelation || '',
            emergencyContactPhone: owner.emergencyContactPhone || '',
            residenceType: owner.residenceType || '',
            moveInDate: owner.moveInDate || ''
          },
          avatar: avatar,
          idCardPhotos: idCardPhotos,
          loading: false,
          editMode: false  // 初始为预览模式
        })
      } else {
        showToast('加载个人信息失败')
        this.setData({ loading: false })
      }
      hideLoading()
    } catch (err) {
      console.error('加载个人信息失败:', err)
      hideLoading()
      showToast('加载失败，请稍后重试')
      this.setData({ loading: false })
    }
  },

  // 输入框变化
  onInputChange(e) {
    const { field } = e.currentTarget.dataset
    const { value } = e.detail
    this.setData({
      [`formData.${field}`]: value
    })
  },

  // 选择日期
  onDateChange(e) {
    const { field } = e.currentTarget.dataset
    const { value } = e.detail
    this.setData({
      [`formData.${field}`]: value
    })
  },

  // 选择性别
  onGenderChange(e) {
    this.setData({
      'formData.gender': e.detail.value
    })
  },

  // 上传头像（只选择并暂存）
  async uploadAvatar() {
    try {
      const result = await new Promise((resolve, reject) => {
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success(res) {
            resolve(res)
          },
          fail(err) {
            reject(err)
          }
        })
      })

      if (result.tempFilePaths.length === 0) return

      const filePath = result.tempFilePaths[0]
      console.log('📸 选择证件照:', filePath)
      
      this.setData({
        avatar: filePath
      })
      showToast('证件照已选择，点击保存修改后生效')
    } catch (err) {
      console.error('选择证件照失败:', err)
      showToast('选择失败，请重试')
    }
  },

  // 删除头像
  async deleteAvatar() {
    try {
      await showConfirm('确定要删除证件照吗？')
      this.setData({
        avatar: null
      })
      showToast('证件照已删除')
    } catch (err) {
      // 用户取消
    }
  },

  // 上传身份证照片（只选择并暂存）
  async uploadIdCardPhoto() {
    try {
      const result = await new Promise((resolve, reject) => {
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success(res) {
            resolve(res)
          },
          fail(err) {
            reject(err)
          }
        })
      })

      if (result.tempFilePaths.length === 0) return

      const filePath = result.tempFilePaths[0]
      console.log('📸 选择身份证照片:', filePath)
      
      const photos = this.data.idCardPhotos || []
      if (photos.length >= 2) {
        showToast('最多只能上传2张身份证照片')
        return
      }
      
      photos.push(filePath)
      this.setData({
        idCardPhotos: photos
      })
      showToast(`身份证照片已选择 (${photos.length}/2)，点击保存修改后生效`)
    } catch (err) {
      console.error('选择身份证照片失败:', err)
      showToast('选择失败，请重试')
    }
  },

  // 删除身份证照片
  async deleteIdCardPhoto(e) {
    try {
      const { index } = e.currentTarget.dataset
      await showConfirm('确定要删除这张身份证照片吗？')
      const photos = this.data.idCardPhotos
      photos.splice(index, 1)
      this.setData({
        idCardPhotos: photos
      })
      showToast('照片已删除')
    } catch (err) {
      // 用户取消
    }
  },

  // 上传单个文件到服务器
  uploadFileToServer(filePath, fileType) {
    return new Promise((resolve, reject) => {
      const token = app.getToken()
      let uploadUrl = ''
      
      // 根据文件类型使用不同的上传接口
      if (fileType === 'avatar') {
        uploadUrl = 'http://localhost:8081/api/owner/upload/access-control-photo'
      } else if (fileType === 'idCard') {
        uploadUrl = 'http://localhost:8081/api/owner/upload/id-card-photo'
      }
      
      console.log(`📤 上传${fileType}到阿里云OSS`)
      console.log('上传URL:', uploadUrl)
      console.log('文件路径:', filePath)
      
      wx.uploadFile({
        url: uploadUrl,
        filePath: filePath,
        name: 'file',
        header: {
          'Authorization': `Bearer ${token}`
        },
        success(res) {
          console.log(`✅ ${fileType}上传响应 - 状态码:`, res.statusCode)
          console.log('📋 响应内容:', res.data)
          
          if (res.statusCode === 200) {
            try {
              const data = JSON.parse(res.data)
              console.log('✅ 响应解析成功:', data)
              if (data.success && data.data) {
                resolve({
                  success: true,
                  data: { path: data.data }
                })
              } else {
                reject(new Error(data.message || '上传失败'))
              }
            } catch (parseErr) {
              console.error(`❌ ${fileType}响应解析失败:`, parseErr)
              console.error('原始响应:', res.data)
              reject(new Error('响应解析失败'))
            }
          } else {
            console.error(`❌ ${fileType}上传失败 - 状态码: ${res.statusCode}`)
            console.error('响应内容:', res.data)
            reject(new Error(`上传失败 (状态码: ${res.statusCode})`))
          }
        },
        fail(err) {
          console.error(`❌ ${fileType}上传请求失败:`, err)
          reject(err)
        }
      })
    })
  },

  // 保存个人信息
  async saveProfile() {
    try {
      // 验证必填项
      if (!this.data.formData.name) {
        showToast('请输入姓名')
        return
      }
      if (!this.data.formData.phone) {
        showToast('请输入手机号')
        return
      }
      if (!this.data.formData.idCard) {
        showToast('请输入身份证号')
        return
      }

      this.setData({ saving: true })
      showLoading()

      let avatarPath = this.data.owner?.accessControlPhotos || null
      let idCardPhotoPaths = []

      // 上传新选择的头像
      if (this.data.avatar && this.data.avatar.includes('oss-cn-beijing.aliyuncs.com')) {
        // 如果已经是阿里云OSS URL，则不需要上传
        avatarPath = this.data.avatar
      } else if (this.data.avatar) {
        // 如果是本地路径或临时路径，需要上传到OSS
        try {
          console.log('📤 开始上传新的头像文件到阿里云...')
          const uploadRes = await this.uploadFileToServer(this.data.avatar, 'avatar')
          if (uploadRes.success && uploadRes.data?.path) {
            avatarPath = uploadRes.data.path
            console.log('✅ 头像上传成功:', avatarPath)
          } else {
            throw new Error('头像上传失败')
          }
        } catch (err) {
          console.error('头像上传失败:', err)
          hideLoading()
          this.setData({ saving: false })
          showToast('头像上传失败，请重试')
          return
        }
      }

      // 上传新选择的身份证照片
      if (this.data.idCardPhotos && this.data.idCardPhotos.length > 0) {
        for (let i = 0; i < this.data.idCardPhotos.length; i++) {
          const photo = this.data.idCardPhotos[i]
          
          // 如果已经是阿里云OSS URL，则保留；否则上传
          if (photo.includes('oss-cn-beijing.aliyuncs.com')) {
            idCardPhotoPaths.push(photo)
          } else {
            try {
              console.log(`📤 开始上传第${i + 1}张身份证照片到阿里云...`)
              const uploadRes = await this.uploadFileToServer(photo, 'idCard')
              if (uploadRes.success && uploadRes.data?.path) {
                idCardPhotoPaths.push(uploadRes.data.path)
                console.log(`✅ 第${i + 1}张身份证照片上传成功:`, uploadRes.data.path)
              } else {
                throw new Error(`第${i + 1}张照片上传失败`)
              }
            } catch (err) {
              console.error(`第${i + 1}张身份证照片上传失败:`, err)
              hideLoading()
              this.setData({ saving: false })
              showToast(`第${i + 1}张身份证照片上传失败，请重试`)
              return
            }
          }
        }
      }

      const updateData = {
        ...this.data.formData,
        accessControlPhotos: avatarPath,  // 使用数据库中的字段名
        idCardPhotos: idCardPhotoPaths.length > 0 ? JSON.stringify(idCardPhotoPaths) : null
      }

      console.log('📝 保存的数据:', updateData)
      const res = await ownerAPI.updateProfile(updateData)

      if (res && res.success) {
        showToast('保存成功')
        // 保存成功后，返回预览模式并重新加载数据
        this.setData({ editMode: false })
        setTimeout(() => {
          this.loadOwnerInfo()
        }, 500)
      } else {
        showToast(res.message || '保存失败')
      }

      this.setData({ saving: false })
      hideLoading()
    } catch (err) {
      console.error('保存个人信息失败:', err)
      this.setData({ saving: false })
      hideLoading()
      showToast('保存失败，请重试')
    }
  },

  // 进入编辑模式
  enterEditMode() {
    console.log('📝 进入编辑模式')
    this.setData({
      editMode: true
    })
  },

  // 取消编辑，返回预览模式
  cancelEdit() {
    try {
      wx.showModal({
        title: '取消编辑',
        content: '确定要放弃修改吗？',
        success: (res) => {
          if (res.confirm) {
            console.log('❌ 放弃编辑，返回预览模式')
            // 重新加载原始数据
            this.loadOwnerInfo()
            this.setData({
              editMode: false
            })
            showToast('已放弃修改')
          }
        }
      })
    } catch (err) {
      console.error('取消编辑失败:', err)
    }
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack()
  }
})
