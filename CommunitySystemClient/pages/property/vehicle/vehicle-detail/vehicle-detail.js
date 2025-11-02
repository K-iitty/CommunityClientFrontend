// pages/property/vehicle/vehicle-detail/vehicle-detail.js
// 车辆管理 - 车辆详情页面

const { staffAPI } = require('../../../../utils/api.js')
const { showToast, showLoading, hideLoading } = require('../../../../utils/util.js')

Page({
  data: {
    vehicleId: null,
    vehicle: null,
    vehicleImagesList: [],
    loading: true,
    empty: false,
    
    // 编辑模式
    isEditing: false,
    editData: {},
    statusOptions: ['正常', '冻结', '黑名单'],
    submitting: false,
    
    // 编辑时的图片临时存储
    editDriverLicenseImage: null,  // 驾驶证临时文件路径
    editVehicleImage: null,        // 车辆图片临时文件路径
    driverLicenseImageToDelete: false,  // 是否要删除驾驶证
    vehicleImageToDelete: false    // 是否要删除车辆图片
  },

  onLoad(options) {
    const { id } = options
    if (id) {
      this.setData({ vehicleId: id })
      this.loadVehicleDetail(id)
    } else {
      this.setData({ empty: true, loading: false })
    }
  },

  // 加载车辆详情
  async loadVehicleDetail(id) {
    try {
      this.setData({ loading: true })
      showLoading('加载中...')

      const res = await staffAPI.getVehicleDetail(id)

      hideLoading()

      if (res && res.success && res.data) {
        const vehicle = res.data
        
        // 处理车辆图片
        let vehicleImagesList = []
        if (vehicle.vehicleImages) {
          if (Array.isArray(vehicle.vehicleImages)) {
            vehicleImagesList = vehicle.vehicleImages
          } else if (typeof vehicle.vehicleImages === 'string') {
            vehicleImagesList = [vehicle.vehicleImages]
          }
        }
        
        this.setData({
          vehicle: vehicle,
          vehicleImagesList: vehicleImagesList,
          editData: { ...vehicle },
          loading: false
        })
      } else {
        showToast('加载失败')
        this.setData({ empty: true, loading: false })
      }
    } catch (err) {
      hideLoading()
      console.error('加载车辆详情失败:', err)
      showToast('加载失败')
      this.setData({ empty: true, loading: false })
    }
  },

  // 预览驾驶证图片
  previewDriverLicense() {
    if (this.data.vehicle && this.data.vehicle.driverLicenseImage) {
      wx.previewImage({
        urls: [this.data.vehicle.driverLicenseImage],
        current: this.data.vehicle.driverLicenseImage
      })
    }
  },

  // 预览车辆图片
  previewVehicleImage(e) {
    const { index } = e.currentTarget.dataset
    if (this.data.vehicleImagesList && this.data.vehicleImagesList.length > 0) {
      wx.previewImage({
        urls: this.data.vehicleImagesList,
        current: this.data.vehicleImagesList[index || 0]
      })
    }
  },

  // 开始编辑
  startEdit() {
    this.setData({ 
      isEditing: true,
      editData: { ...this.data.vehicle },
      editDriverLicenseImage: null,
      editVehicleImage: null,
      driverLicenseImageToDelete: false,
      vehicleImageToDelete: false
    })
  },

  // 取消编辑
  cancelEdit() {
    this.setData({ 
      isEditing: false,
      editData: {},
      editDriverLicenseImage: null,
      editVehicleImage: null,
      driverLicenseImageToDelete: false,
      vehicleImageToDelete: false
    })
  },

  // 输入改变
  onInputChange(e) {
    const { field } = e.currentTarget.dataset
    const value = e.detail.value
    const editData = this.data.editData
    editData[field] = value
    this.setData({ editData })
  },

  // 状态改变
  onStatusChange(e) {
    const index = e.detail.value
    const editData = this.data.editData
    editData.status = this.data.statusOptions[index]
    this.setData({ editData })
  },

  // 选择驾驶证图片
  chooseDriverLicenseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({ 
          editDriverLicenseImage: res.tempFilePaths[0],
          driverLicenseImageToDelete: false
        })
      }
    })
  },

  // 选择车辆图片
  chooseVehicleImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({ 
          editVehicleImage: res.tempFilePaths[0],
          vehicleImageToDelete: false
        })
      }
    })
  },

  // 删除驾驶证图片
  deleteDriverLicense() {
    this.setData({ 
      editDriverLicenseImage: null,
      driverLicenseImageToDelete: true
    })
  },

  // 删除车辆图片
  deleteVehicleImage() {
    this.setData({ 
      editVehicleImage: null,
      vehicleImageToDelete: true
    })
  },

  // 提交编辑
  async submitEdit() {
    if (this.data.submitting) return
    
    this.setData({ submitting: true })
    showLoading('保存中...')

    try {
      const vehicleData = {
        plateNumber: this.data.editData.plateNumber,
        brand: this.data.editData.brand,
        model: this.data.editData.model,
        color: this.data.editData.color,
        vehicleType: this.data.editData.vehicleType,
        status: this.data.editData.status,
        vehicleLicenseNo: this.data.editData.vehicleLicenseNo,
        engineNo: this.data.editData.engineNo,
        registerDate: this.data.editData.registerDate,
        remark: this.data.editData.remark,
        ownerId: this.data.editData.ownerId,
        fixedSpaceId: this.data.editData.fixedSpaceId
      }

      // 检查是否有图片变化
      const hasNewDriverLicense = !!this.data.editDriverLicenseImage
      const hasNewVehicleImage = !!this.data.editVehicleImage
      const deletingDriverLicense = this.data.driverLicenseImageToDelete
      const deletingVehicleImage = this.data.vehicleImageToDelete

      // 如果有图片变化（新增、删除），使用updateVehicleWithImages
      if (hasNewDriverLicense || hasNewVehicleImage || deletingDriverLicense || deletingVehicleImage) {
        // 构建表单数据，但不包括后端不需要的ownerId字段
        const formData = {
          plateNumber: vehicleData.plateNumber,
          brand: vehicleData.brand,
          model: vehicleData.model,
          color: vehicleData.color,
          vehicleType: vehicleData.vehicleType,
          status: vehicleData.status,
          vehicleLicenseNo: vehicleData.vehicleLicenseNo,
          engineNo: vehicleData.engineNo,
          registerDate: vehicleData.registerDate,
          remark: vehicleData.remark,
          fixedSpaceId: vehicleData.fixedSpaceId
        }
        
        // 构建图片数据
        if (hasNewDriverLicense) {
          formData.driverLicenseImageFiles = [this.data.editDriverLicenseImage]
        }
        if (hasNewVehicleImage) {
          formData.vehicleImageFiles = [this.data.editVehicleImage]
        }
        // 删除标志
        if (deletingDriverLicense && this.data.vehicle.driverLicenseImage) {
          formData.driverLicenseImageToDelete = this.data.vehicle.driverLicenseImage
        }
        if (deletingVehicleImage && this.data.vehicleImagesList.length > 0) {
          formData.vehicleImagesToDelete = this.data.vehicleImagesList[0]
        }

        const res = await staffAPI.updateVehicleWithImages(this.data.vehicleId, formData)
        hideLoading()

        if (res && res.success) {
          showToast('保存成功')
          await this.loadVehicleDetail(this.data.vehicleId)
          this.setData({ isEditing: false, submitting: false })
        } else {
          showToast(res?.message || '保存失败')
          this.setData({ submitting: false })
        }
      } else {
        // 无图片变化，使用updateVehicle
        const res = await staffAPI.updateVehicle(this.data.vehicleId, vehicleData)
        hideLoading()

        if (res && res.success) {
          showToast('保存成功')
          this.setData({ 
            vehicle: this.data.editData,
            isEditing: false,
            submitting: false
          })
        } else {
          showToast(res?.message || '保存失败')
          this.setData({ submitting: false })
        }
      }
    } catch (err) {
      hideLoading()
      console.error('保存失败:', err)
      showToast('保存失败')
      this.setData({ submitting: false })
    }
  },

  goBack() {
    wx.navigateBack()
  }
})
