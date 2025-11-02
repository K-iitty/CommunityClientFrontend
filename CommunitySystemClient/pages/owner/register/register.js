// pages/owner/register/register.js
const app = getApp()
const { ownerAPI } = require('../../../utils/api.js')
const { showLoading, hideLoading, showToast } = require('../../../utils/util.js')

Page({
  data: {
    form: {
      username: '',
      password: '',
      confirmPassword: '',
      agreed: false
    },
    showPassword: false,
    showConfirmPassword: false,
    usernameStatus: '',
    passwordStatus: '',
    confirmPasswordStatus: '',
    agreementStatus: '',
    isFormValid: false,
    loading: false
  },

  onLoad() {
    // 页面加载
  },

  // 用户名输入
  onUsernameInput(e) {
    const username = e.detail.value
    this.setData({
      'form.username': username
    })
    this.validateUsername(username)
    this.checkFormValid()
  },

  // 验证用户名
  validateUsername(username) {
    if (!username) {
      this.setData({ usernameStatus: '请输入用户名' })
      return false
    }
    if (username.length < 3) {
      this.setData({ usernameStatus: '用户名至少3个字符' })
      return false
    }
    if (username.length > 20) {
      this.setData({ usernameStatus: '用户名不超过20个字符' })
      return false
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      this.setData({ usernameStatus: '只能包含字母、数字和下划线' })
      return false
    }
    this.setData({ usernameStatus: '✓ 用户名格式正确' })
    return true
  },

  // 密码输入
  onPasswordInput(e) {
    const password = e.detail.value
    this.setData({
      'form.password': password
    })
    this.validatePassword(password)
    this.checkFormValid()
  },

  // 验证密码
  validatePassword(password) {
    if (!password) {
      this.setData({ passwordStatus: '请输入密码' })
      return false
    }
    if (password.length < 8) {
      this.setData({ passwordStatus: '密码至少8个字符' })
      return false
    }
    if (!/[a-zA-Z]/.test(password)) {
      this.setData({ passwordStatus: '必须包含字母' })
      return false
    }
    if (!/[0-9]/.test(password)) {
      this.setData({ passwordStatus: '必须包含数字' })
      return false
    }
    this.setData({ passwordStatus: '✓ 密码强度符合要求' })
    return true
  },

  // 确认密码输入
  onConfirmPasswordInput(e) {
    const confirmPassword = e.detail.value
    this.setData({
      'form.confirmPassword': confirmPassword
    })
    this.validateConfirmPassword(confirmPassword)
    this.checkFormValid()
  },

  // 验证确认密码
  validateConfirmPassword(confirmPassword) {
    if (!confirmPassword) {
      this.setData({ confirmPasswordStatus: '请再次输入密码' })
      return false
    }
    if (confirmPassword !== this.data.form.password) {
      this.setData({ confirmPasswordStatus: '两次密码输入不一致' })
      return false
    }
    this.setData({ confirmPasswordStatus: '✓ 密码一致' })
    return true
  },

  // 切换密码显示
  togglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    })
  },

  // 切换确认密码显示
  toggleConfirmPassword() {
    this.setData({
      showConfirmPassword: !this.data.showConfirmPassword
    })
  },

  // 协议勾选
  onAgreementChange(e) {
    const agreed = e.detail.value.includes('agreed')
    this.setData({
      'form.agreed': agreed
    })
    this.checkFormValid()
  },

  // 检查表单是否有效
  checkFormValid() {
    const { form, usernameStatus, passwordStatus, confirmPasswordStatus } = this.data
    
    const isValid = 
      form.username &&
      form.password &&
      form.confirmPassword &&
      form.agreed &&
      usernameStatus.includes('✓') &&
      passwordStatus.includes('✓') &&
      confirmPasswordStatus.includes('✓')
    
    this.setData({ isFormValid: isValid })
  },

  // 注册
  async handleRegister() {
    if (!this.data.isFormValid) {
      const { usernameStatus, passwordStatus, confirmPasswordStatus, form } = this.data
      
      let errorMsg = '请完成所有必填项：'
      const errors = []
      
      if (!form.username) {
        errors.push('用户名未填写')
      } else if (!usernameStatus.includes('✓')) {
        errors.push(usernameStatus)
      }
      
      if (!form.password) {
        errors.push('密码未填写')
      } else if (!passwordStatus.includes('✓')) {
        errors.push(passwordStatus)
      }
      
      if (!form.confirmPassword) {
        errors.push('确认密码未填写')
      } else if (!confirmPasswordStatus.includes('✓')) {
        errors.push(confirmPasswordStatus)
      }
      
      if (!form.agreed) {
        errors.push('需要同意用户协议')
      }
      
      showToast(errors.length > 0 ? errors[0] : errorMsg)
      return
    }

    try {
      showLoading('注册中...')
      this.setData({ loading: true })

      const { username, password } = this.data.form
      
      console.log('🔐 === 开始注册请求 ===')
      console.log('📝 用户名:', username)
      console.log('🔒 密码长度:', password.length)
      
      // 调用后端注册API - 只发送username和password
      const res = await ownerAPI.register({
        username,
        password
      })

      hideLoading()
      this.setData({ loading: false })

      console.log('✅ 注册响应完整数据:', JSON.stringify(res, null, 2))
      console.log('🎯 res.token:', res.token)
      console.log('🎯 res.role:', res.role)
      console.log('🎯 res.message:', res.message)

      if (res && res.token) {
        console.log('🎉 注册成功，生成的Token:', res.token)
        showToast('注册成功，请登录', 'success')
        
        // 不保存登录信息，让用户跳转到登录页面手动登录
        // app.saveLoginInfo(res.token, 'owner', { username })
        
        // 延迟跳转到登录页面
        setTimeout(() => {
          wx.reLaunch({
            url: '/pages/login/login'
          })
        }, 1500)
      } else {
        console.log('❌ 注册失败，响应信息:', res.message || '未获取到token')
        showToast(res.message || '注册失败，请稍后重试')
      }
    } catch (err) {
      hideLoading()
      this.setData({ loading: false })
      console.error('❌ 注册异常:', err)
      showToast(err.message || '注册失败，请稍后重试')
    }
  },

  // 返回登录
  handleBack() {
    wx.navigateBack({
      delta: 1
    })
  }
})
