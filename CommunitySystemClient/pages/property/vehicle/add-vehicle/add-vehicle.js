// pages/property/vehicle/add-vehicle/add-vehicle.js
const { staffAPI } = require('../../../../utils/api.js')
const { showToast, showLoading, hideLoading } = require('../../../../utils/util.js')

Page({
  data: {
    isEdit: false,
    vehicleId: null,
    
    // 基本信息
    ownerId: null,
    plateNumber: '',
    brand: '',
    model: '',
    color: '',
    vehicleType: '',
    status: '正常',
    vehicleLicenseNo: '',
    engineNo: '',
    registerDate: '',
    remark: '',
    fixedSpaceId: null,
    
    // 图片：从本地选择后暂存
    driverLicenseImageFile: null,
    vehicleImageFiles: [],
    
    statusOptions: ['正常', '冻结', '黑名单'],
    submitting: false,
    loading: false,
    errors: {}
  },

  onLoad(options) {
    const { id, edit } = options
    if (id && edit === 'true') {
      this.setData({ isEdit: true, vehicleId: parseInt(id), loading: true })
      this.loadVehicleData(id)
    }
  },

  async loadVehicleData(vehicleId) {
    try {
      showLoading('加载中...')
      const res = await staffAPI.getVehicleDetail(vehicleId)
      hideLoading()

      if (res && res.success && res.data) {
        const v = res.data
        let vehicleImagesList = []
        if (v.vehicleImages) {
          vehicleImagesList = Array.isArray(v.vehicleImages) ? v.vehicleImages : [v.vehicleImages]
        }
        
        this.setData({
          ownerId: v.ownerId,
          plateNumber: v.plateNumber || '',
          brand: v.brand || '',
          model: v.model || '',
          color: v.color || '',
          vehicleType: v.vehicleType || '',
          status: v.status || '正常',
          vehicleLicenseNo: v.vehicleLicenseNo || '',
          engineNo: v.engineNo || '',
          registerDate: v.registerDate || '',
          remark: v.remark || '',
          fixedSpaceId: v.fixedSpaceId || null,
          driverLicenseImage: v.driverLicenseImage || null,
          vehicleImages: vehicleImagesList,
          loading: false
        })
      } else {
        showToast('加载失败')
        this.setData({ loading: false })
      }
    } catch (err) {
      hideLoading()
      console.error('加载失败:', err)
      showToast('加载失败')
      this.setData({ loading: false })
    }
  },

  // ===== 表单输入处理 =====
  onOwnerIdInput(e) {
    const ownerId = e.detail.value ? parseInt(e.detail.value) : null
    this.setData({ ownerId })
    this.validateField('owner')
  },

  onPlateNumberInput(e) {
    const value = e.detail.value.toUpperCase()
    this.setData({ plateNumber: value })
    console.log('车牌输入:', value, '长度:', value.length)
    this.validateField('plateNumber')
  },

  onBrandInput(e) {
    this.setData({ brand: e.detail.value })
  },

  onModelInput(e) {
    this.setData({ model: e.detail.value })
  },

  onColorInput(e) {
    this.setData({ color: e.detail.value })
  },

  onVehicleTypeInput(e) {
    this.setData({ vehicleType: e.detail.value })
  },

  onStatusChange(e) {
    this.setData({ status: this.data.statusOptions[e.detail.value] })
  },

  onVehicleLicenseNoInput(e) {
    this.setData({ vehicleLicenseNo: e.detail.value })
  },

  onEngineNoInput(e) {
    this.setData({ engineNo: e.detail.value })
  },

  onRegisterDateChange(e) {
    this.setData({ registerDate: e.detail.value })
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value })
  },

  onFixedSpaceIdInput(e) {
    const fixedSpaceId = e.detail.value ? parseInt(e.detail.value) : null
    this.setData({ fixedSpaceId })
  },

  // ===== 图片处理：简单的选择、暂存、删除、预览 =====
  chooseDriverLicenseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({ driverLicenseImageFile: res.tempFilePaths[0] })
      }
    })
  },

  chooseVehicleImages() {
    if (this.data.vehicleImageFiles.length > 0) {
      showToast('最多上传1张，请先删除')
      return
    }
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({ vehicleImageFiles: [res.tempFilePaths[0]] })
      }
    })
  },

  deleteDriverLicenseImage() {
    this.setData({ driverLicenseImageFile: null })
  },

  deleteVehicleImage(e) {
    const files = [...this.data.vehicleImageFiles]
    files.splice(e.currentTarget.dataset.index, 1)
    this.setData({ vehicleImageFiles: files })
  },

  previewDriverLicense() {
    if (this.data.driverLicenseImageFile) {
      wx.previewImage({
        urls: [this.data.driverLicenseImageFile],
        current: this.data.driverLicenseImageFile
      })
    }
  },

  previewVehicleImage(e) {
    wx.previewImage({
      urls: this.data.vehicleImageFiles,
      current: this.data.vehicleImageFiles[e.currentTarget.dataset.index]
    })
  },

  // ===== 表单验证 =====
  validateField(fieldName) {
    const errors = { ...this.data.errors }
    
    if (fieldName === 'owner' && !this.data.ownerId) {
      errors.owner = '请输入业主ID'
    } else if (fieldName === 'plateNumber') {
      if (!this.data.plateNumber) {
        errors.plateNumber = '车牌不能为空'
      } else {
        // 简化验证：中文字符 + 至少5个字母/数字/中点
        const plateRegex = /^[\u4e00-\u9fff][A-Z0-9·\s]{5,8}$/
        console.log('验证车牌:', this.data.plateNumber, '结果:', plateRegex.test(this.data.plateNumber))
        if (!plateRegex.test(this.data.plateNumber)) {
          errors.plateNumber = '车牌格式不正确(示例: 湘A12345)'
        } else {
          delete errors.plateNumber
        }
      }
    } else if (fieldName === 'owner') {
      delete errors.owner
    }
    
    this.setData({ errors })
  },

  validateForm() {
    const errors = {}
    if (!this.data.ownerId) errors.owner = '请输入业主ID'
    if (!this.data.plateNumber) {
      errors.plateNumber = '车牌不能为空'
    } else {
      // 简化验证：中文字符 + 至少5个字母/数字/中点
      const plateRegex = /^[\u4e00-\u9fff][A-Z0-9·\s]{5,8}$/
      if (!plateRegex.test(this.data.plateNumber)) {
        errors.plateNumber = '车牌格式不正确(示例: 湘A12345)'
      }
    }
    
    this.setData({ errors })
    return Object.keys(errors).length === 0
  },

  // ===== 提交 =====
  async submitForm() {
    if (!this.validateForm()) {
      showToast('请填写必填项')
      return
    }

    if (this.data.submitting) return
    this.setData({ submitting: true })
    
    try {
      if (this.data.isEdit) {
        await this.updateVehicle()
      } else {
        await this.addVehicle()
      }
    } finally {
      this.setData({ submitting: false })
    }
  },

  async addVehicle() {
    showLoading('提交中...')
    try {
      const data = {
        ownerId: this.data.ownerId,
        plateNumber: this.data.plateNumber,
        vehicleType: this.data.vehicleType || '',
        brand: this.data.brand || '',
        model: this.data.model || '',
        color: this.data.color || '',
        fixedSpaceId: this.data.fixedSpaceId ? this.data.fixedSpaceId.toString() : '',
        vehicleLicenseNo: this.data.vehicleLicenseNo || '',
        engineNo: this.data.engineNo || '',
        status: this.data.status || '正常',
        registerDate: this.data.registerDate || '',
        remark: this.data.remark || '',
        // 图片：从本地暂存的临时路径
        driverLicenseImageFiles: this.data.driverLicenseImageFile ? [this.data.driverLicenseImageFile] : [],
        vehicleImageFiles: this.data.vehicleImageFiles || []
      }

      const res = await staffAPI.addVehicle(data)
      hideLoading()

      if (res && res.success) {
        showToast('新增成功')
        setTimeout(() => wx.navigateBack(), 1000)
      } else {
        showToast(res?.message || '新增失败')
      }
    } catch (err) {
      hideLoading()
      console.error('新增失败:', err)
      showToast('新增失败')
    }
  },

  async updateVehicle() {
    showLoading('更新中...')
    try {
      const data = {
        ownerId: this.data.ownerId,
        plateNumber: this.data.plateNumber,
        vehicleType: this.data.vehicleType || '',
        brand: this.data.brand || '',
        model: this.data.model || '',
        color: this.data.color || '',
        fixedSpaceId: this.data.fixedSpaceId ? this.data.fixedSpaceId.toString() : '',
        vehicleLicenseNo: this.data.vehicleLicenseNo || '',
        engineNo: this.data.engineNo || '',
        status: this.data.status || '正常',
        registerDate: this.data.registerDate || '',
        remark: this.data.remark || '',
        driverLicenseImageFiles: this.data.driverLicenseImageFile ? [this.data.driverLicenseImageFile] : [],
        vehicleImageFiles: this.data.vehicleImageFiles || []
      }

      const res = await staffAPI.updateVehicle(this.data.vehicleId, data)
      hideLoading()

      if (res && res.success) {
        showToast('更新成功')
        setTimeout(() => wx.navigateBack(), 1000)
      } else {
        showToast(res?.message || '更新失败')
      }
    } catch (err) {
      hideLoading()
      console.error('更新失败:', err)
      showToast('更新失败')
    }
  },

  goBack() {
    wx.navigateBack()
  }
})

