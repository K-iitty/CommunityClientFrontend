// pages/property/house/add-house/add-house.js
const { staffAPI } = require('../../../../utils/api.js')
const { showToast, showLoading, hideLoading } = require('../../../../utils/util.js')

Page({
  data: {
    ownerList: [],
    roomNo: '',
    houseCode: '',
    buildingArea: '',
    usableArea: '',
    sharedArea: '',
    houseType: '住宅',
    houseLayout: '',
    houseOrientation: '',
    floorLevel: '',
    houseStatus: '空置',
    decorationStatus: '',
    remark: '',
    ownerId: null,
    ownerName: '',
    buildingId: null,
    communityId: null,
    
    // 图片相关
    floorPlanImage: null,  // 当前户型图
    floorPlanImageFile: null,  // 新上传的户型图
    
    houseTypes: ['住宅', '商铺', '办公', '车库'],
    houseStatusOptions: ['空置', '已售', '已租', '装修中'],
    decorationStatusOptions: ['未装修', '装修中', '已装修'],
    
    submitting: false,
    errors: {}
  },

  onLoad() {
    this.loadOwners()
  },

  async loadOwners() {
    try {
      showLoading('加载业主列表...')
      const res = await staffAPI.listOwners(1, 1000)
      hideLoading()
      
      if (res && res.success && res.data) {
        this.setData({ ownerList: res.data.items || [] })
      }
    } catch (err) {
      hideLoading()
      console.error('加载业主列表失败:', err)
      showToast('加载业主列表失败')
    }
  },

  onRoomNoInput(e) {
    this.setData({ roomNo: e.detail.value })
    this.validateField('roomNo')
  },

  onHouseCodeInput(e) {
    this.setData({ houseCode: e.detail.value })
  },

  onBuildingAreaInput(e) {
    this.setData({ buildingArea: e.detail.value })
  },

  onUsableAreaInput(e) {
    this.setData({ usableArea: e.detail.value })
  },

  onSharedAreaInput(e) {
    this.setData({ sharedArea: e.detail.value })
  },

  onHouseTypeChange(e) {
    const index = e.detail.value
    this.setData({ houseType: this.data.houseTypes[index] })
  },

  onHouseLayoutInput(e) {
    this.setData({ houseLayout: e.detail.value })
  },

  onHouseOrientationInput(e) {
    this.setData({ houseOrientation: e.detail.value })
  },

  onFloorLevelInput(e) {
    this.setData({ floorLevel: e.detail.value })
  },

  onHouseStatusChange(e) {
    const index = e.detail.value
    this.setData({ houseStatus: this.data.houseStatusOptions[index] })
  },

  onDecorationStatusChange(e) {
    const index = e.detail.value
    this.setData({ decorationStatus: this.data.decorationStatusOptions[index] })
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value })
  },

  onOwnerChange(e) {
    const index = e.detail.value
    if (index >= 0 && index < this.data.ownerList.length) {
      const owner = this.data.ownerList[index]
      this.setData({
        ownerId: owner.id,
        ownerName: owner.realName
      })
    }
  },

  // ===== 图片相关方法 =====
  chooseFloorPlanImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          floorPlanImageFile: res.tempFilePaths[0]
        })
      }
    })
  },

  deleteFloorPlanImage() {
    this.setData({ floorPlanImageFile: null })
  },

  previewFloorPlanImage() {
    if (this.data.floorPlanImageFile) {
      wx.previewImage({
        urls: [this.data.floorPlanImageFile],
        current: this.data.floorPlanImageFile
      })
    }
  },

  validateField(fieldName) {
    const errors = { ...this.data.errors }
    
    if (fieldName === 'roomNo') {
      if (!this.data.roomNo) {
        errors.roomNo = '房间号不能为空'
      } else if (this.data.roomNo.length > 20) {
        errors.roomNo = '房间号长度不超过20'
      } else {
        delete errors.roomNo
      }
    }
    
    this.setData({ errors })
  },

  validateForm() {
    const errors = {}
    
    if (!this.data.roomNo) errors.roomNo = '房间号不能为空'
    if (!this.data.houseType) errors.houseType = '请选择房屋类型'
    if (this.data.ownerId === null) errors.ownerId = '请选择业主'
    
    this.setData({ errors })
    return Object.keys(errors).length === 0
  },

  async submitForm() {
    if (!this.validateForm()) {
      showToast('请填写完整信息')
      return
    }

    if (this.data.submitting) return

    this.setData({ submitting: true })
    showLoading('新增中...')

    try {
      const houseData = {
        roomNo: this.data.roomNo,
        houseCode: this.data.houseCode || null,
        buildingArea: this.data.buildingArea ? parseFloat(this.data.buildingArea) : null,
        usableArea: this.data.usableArea ? parseFloat(this.data.usableArea) : null,
        sharedArea: this.data.sharedArea ? parseFloat(this.data.sharedArea) : null,
        houseType: this.data.houseType,
        houseLayout: this.data.houseLayout || null,
        houseOrientation: this.data.houseOrientation || null,
        floorLevel: this.data.floorLevel ? parseInt(this.data.floorLevel) : null,
        houseStatus: this.data.houseStatus,
        decorationStatus: this.data.decorationStatus || null,
        remark: this.data.remark || null
      }

      const res = await staffAPI.addHouse(houseData)
      hideLoading()

      if (res && res.success) {
        showToast('新增成功')
        setTimeout(() => {
          wx.navigateBack()
        }, 1000)
      } else {
        showToast(res?.message || '新增失败')
      }
    } catch (err) {
      hideLoading()
      console.error('新增失败:', err)
      showToast('新增失败')
    } finally {
      this.setData({ submitting: false })
    }
  },

  goBack() {
    wx.navigateBack()
  }
})
