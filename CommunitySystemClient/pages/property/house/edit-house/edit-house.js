// pages/property/house/edit-house/edit-house.js
const { staffAPI } = require('../../../../utils/api.js')
const { showLoading, hideLoading, showToast } = require('../../../../utils/util.js')

Page({
  data: {
    houseId: null,
    house: null,
    formData: {},
    floorPlanImage: null,  // 新的户型图临时路径
    floorPlanToDelete: false,  // 是否删除原户型图
    loading: true,
    submitting: false,

    // 选项列表
    houseTypes: ['住宅', '商铺', '办公', '车库'],
    houseStatuses: ['空置', '已售', '已租', '装修中'],
    decorationStatuses: ['简装', '精装修', '毛坯'],
    yesNoOptions: ['否', '是'],
    relationshipTypes: ['业主', '家属', '租客', '其他']
  },

  onLoad(options) {
    const { id } = options
    if (id) {
      this.setData({ houseId: id })
      this.loadHouseDetail(id)
    }
  },

  async loadHouseDetail(id) {
    try {
      this.setData({ loading: true })
      showLoading('加载中...')

      const res = await staffAPI.getHouseDetail(id)

      hideLoading()

      if (res && res.success && res.data) {
        const house = res.data
        console.log('📥 API 返回的 house 数据:', house)
        console.log('🔄 当前的 formData:', this.data.formData)
        console.log('🖼️  当前的 floorPlanImage:', this.data.floorPlanImage)
        console.log('🗑️  当前的 floorPlanToDelete:', this.data.floorPlanToDelete)
        
        // 只初始化formData一次，之后不再覆盖用户的修改
        if (!this.data.formData || Object.keys(this.data.formData).length === 0) {
          console.log('✅ formData为空，使用house数据初始化')
          this.setData({
            house: house,
            formData: house,
            loading: false,
            // ✅ 初始化户型图状态为空
            floorPlanImage: null,
            floorPlanToDelete: false
          })
        } else {
          // formData已经有数据，说明用户已经做过修改，只更新house引用，不修改formData
          console.log('✅ formData已存在，保留用户修改，只更新house引用')
          console.log('⚠️  注意：保留 floorPlanImage 和 floorPlanToDelete 的当前值')
          this.setData({
            house: house,
            loading: false
            // ✅ 重要：不重置 floorPlanImage 和 floorPlanToDelete
            // ✅ 这样用户选择的新图片或删除标记不会被丢失
          })
        }
      } else {
        showToast('加载失败')
        this.setData({ loading: false })
      }
    } catch (err) {
      hideLoading()
      console.error('加载房屋详情失败:', err)
      showToast('加载失败')
      this.setData({ loading: false })
    }
  },

  // 输入框改变
  onInputChange(e) {
    const { field } = e.currentTarget.dataset
    const value = e.detail.value
    const formData = { ...this.data.formData }
    
    // 对数值字段进行类型转换
    if (['buildingArea', 'usableArea', 'sharedArea', 'floorLevel'].includes(field)) {
      formData[field] = field === 'floorLevel' ? parseInt(value) : parseFloat(value)
    } else {
      formData[field] = value
    }
    
    console.log(`✏️ 字段 "${field}" 修改为: "${value}"`)
    console.log(`📋 更新后的 formData:`, formData)
    
    this.setData({ formData })
  },

  // 选择器改变
  onPickerChange(e) {
    const { field, options } = e.currentTarget.dataset
    const index = e.detail.value
    const formData = { ...this.data.formData }
    formData[field] = options[index]
    this.setData({ formData })
  },

  // 选择户型图
  chooseFloorPlan() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        console.log('🎯 chooseFloorPlan 成功')
        console.log('📁 选择的文件路径:', res.tempFilePaths[0])
        console.log('📁 原有 floorPlanImage:', this.data.floorPlanImage)
        this.setData({
          floorPlanImage: res.tempFilePaths[0],
          floorPlanToDelete: false
        })
        console.log('✅ setData 完成，新的 floorPlanImage:', this.data.floorPlanImage)
      }
    })
  },

  // 删除户型图
  deleteFloorPlan() {
    console.log('🎯 deleteFloorPlan 被调用')
    console.log('📁 当前 floorPlanImage:', this.data.floorPlanImage)
    // 如果有新上传的户型图，直接清除
    if (this.data.floorPlanImage) {
      console.log('📁 检测到有 floorPlanImage，检查是否为本地路径...')
      const isLocalPath = !this.data.floorPlanImage.startsWith('http')
      console.log('📁 是本地路径:', isLocalPath)
      
      if (isLocalPath) {
        console.log('✅ 这是新上传的本地图片，直接清除')
        this.setData({
          floorPlanImage: null,
          floorPlanToDelete: false
        })
      } else {
        console.log('✅ 这是原有的网络图片，标记为删除')
        this.setData({
          floorPlanImage: null,
          floorPlanToDelete: true
        })
      }
    } else {
      // 如果是原有户型图，标记为删除
      console.log('📁 floorPlanImage 为空，但原有的 house.floorPlanImage 存在，标记为删除')
      this.setData({
        floorPlanImage: null,
        floorPlanToDelete: true
      })
    }
  },

  // 预览户型图
  previewFloorPlan() {
    const imageUrl = this.data.floorPlanImage || this.data.house?.floorPlanImage
    if (imageUrl) {
      wx.previewImage({
        urls: [imageUrl],
        current: imageUrl
      })
    }
  },

  // 验证表单
  validateForm() {
    const { formData } = this.data
    
    // 验证必填字段
    if (!formData.roomNo || !formData.roomNo.trim()) {
      showToast('房间号不能为空')
      return false
    }
    
    if (!formData.buildingArea) {
      showToast('建筑面积不能为空')
      return false
    }
    
    if (!formData.houseType || !formData.houseType.trim()) {
      showToast('房屋类型不能为空')
      return false
    }
    
    if (!formData.houseStatus || !formData.houseStatus.trim()) {
      showToast('房屋状态不能为空')
      return false
    }
    
    return true
  },

  // 提交编辑
  async submitEdit() {
    if (!this.validateForm()) return
    
    if (this.data.submitting) return
    
    this.setData({ submitting: true })
    showLoading('保存中...')

    try {
      const { formData, floorPlanImage, floorPlanToDelete } = this.data
      
      // 调试日志 - 详细追踪图片状态
      console.log('🔍 原始 house 数据:', this.data.house)
      console.log('🔍 当前 formData:', formData)
      console.log('🎯 ============ 关键调试信息 ============')
      console.log('🖼️  floorPlanImage 值:', floorPlanImage)
      console.log('🖼️  floorPlanImage 类型:', typeof floorPlanImage)
      console.log('🖼️  floorPlanImage 长度:', floorPlanImage ? floorPlanImage.length : 'null')
      console.log('🖼️  是否为空:', !floorPlanImage)
      console.log('🖼️  是否为 null:', floorPlanImage === null)
      console.log('🖼️  是否为 undefined:', floorPlanImage === undefined)
      console.log('🖼️  原始 house.floorPlanImage:', this.data.house?.floorPlanImage)
      console.log('🗑️  floorPlanToDelete:', floorPlanToDelete)
      console.log('🗑️  floorPlanToDelete 类型:', typeof floorPlanToDelete)
      console.log('🎯 ====================================')
      
      // 判断是否为本地路径还是 URL
      if (floorPlanImage) {
        const isLocalPath = !floorPlanImage.startsWith('http')
        const isHttpPath = floorPlanImage.startsWith('http')
        console.log('📍 isLocalPath (不是http开头):', isLocalPath)
        console.log('📍 isHttpPath (是http开头):', isHttpPath)
        console.log('📍 startsWith http 字符:', floorPlanImage.substring(0, 7))
      }
      
      // 准备表单数据，只包含可修改的字段
      const updateData = {
        roomNo: formData.roomNo,
        fullRoomNo: formData.fullRoomNo,
        houseCode: formData.houseCode,
        buildingArea: formData.buildingArea,
        usableArea: formData.usableArea,
        sharedArea: formData.sharedArea,
        houseType: formData.houseType,
        houseLayout: formData.houseLayout,
        houseOrientation: formData.houseOrientation,
        parkingSpaceNo: formData.parkingSpaceNo,
        parkingType: formData.parkingType,
        houseStatus: formData.houseStatus,
        decorationStatus: formData.decorationStatus,
        floorLevel: formData.floorLevel,
        // 转换 hasBalcony: "是"/"否" → 1/0
        hasBalcony: typeof formData.hasBalcony === 'string' 
          ? (formData.hasBalcony === '是' ? 1 : 0) 
          : formData.hasBalcony,
        // 转换 hasGarden: "是"/"否" → 1/0
        hasGarden: typeof formData.hasGarden === 'string' 
          ? (formData.hasGarden === '是' ? 1 : 0) 
          : formData.hasGarden,
        remark: formData.remark,
        // ✅ 新增：保存原始图片路径，用于后续对比判断是否有新图片
        floorPlanImageFromDB: this.data.house?.floorPlanImage
      }
      
      console.log('📤 准备发送的 updateData:', JSON.stringify(updateData, null, 2))
      
      // 如果有新的户型图，需要使用updateHouseWithImages
      if (floorPlanImage || floorPlanToDelete) {
        console.log('📸 检测到户型图变化，使用 updateHouseWithImages')
        console.log('   floorPlanImage:', floorPlanImage)
        console.log('   floorPlanToDelete:', floorPlanToDelete)
        // 传递更新数据和图片信息
        const res = await staffAPI.updateHouseWithImages(this.data.houseId, updateData, floorPlanImage, floorPlanToDelete)
        
        hideLoading()
        
        if (res && res.success) {
          showToast('保存成功')
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
        } else {
          showToast(res?.message || '保存失败')
          this.setData({ submitting: false })
        }
      } else {
        // 无图片变化，使用普通update
        console.log('📝 无户型图变化，使用普通 updateHouse')
        const res = await staffAPI.updateHouse(this.data.houseId, updateData)
        
        hideLoading()
        
        if (res && res.success) {
          showToast('保存成功')
          setTimeout(() => {
            wx.navigateBack()
          }, 1500)
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

  // 取消编辑
  cancelEdit() {
    wx.navigateBack()
  }
})
