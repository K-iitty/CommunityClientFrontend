// pages/owner/ai-chat/ai-chat.js
const { ownerAPI } = require('../../../utils/api.js')
const { showLoading, hideLoading, showToast } = require('../../../utils/util.js')

Page({
  data: {
    messages: [],
    inputValue: '',
    sending: false,
    sessionId: '',
    scrollTop: 9999,
    history: [],           // 对话历史（最多20条，用于发送给后端）
    displayHistory: [],    // 显示历史（用于UI展示）
    isConnected: false,
    keyboardHeight: 0,
    conversationCount: 0   // 记录总对话数
  },

  onLoad() {
    // 初始化会话
    const sessionId = `session_${Date.now()}`
    this.setData({ 
      sessionId: sessionId,
      messages: [
        {
          id: 'welcome_' + Date.now(),
          type: 'assistant',
          content: '👋 欢迎来到社区AI客服！我是您的智能助手。\n\n我可以记住我们的对话内容，为您提供更贴切的帮助。\n\n试试告诉我你的名字，然后问我你是谁吧！',
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' })
        }
      ]
    })
    
    // 尝试加载之前保存的会话历史
    this.loadSessionHistory()
  },

  onShow() {
    this.setData({ isConnected: true })
  },

  onHide() {
    this.setData({ isConnected: false })
  },

  onUnload() {
    this.setData({ isConnected: false })
    // 保存会话历史
    this.saveSessionHistory()
  },

  // 保存会话历史到本地存储
  saveSessionHistory() {
    try {
      const { sessionId, history } = this.data
      if (history.length > 0) {
        wx.setStorageSync(`chat_history_${sessionId}`, history)
      }
    } catch (err) {
      console.warn('保存会话历史失败:', err)
    }
  },

  // 加载之前保存的会话历史
  loadSessionHistory() {
    try {
      const { sessionId } = this.data
      const savedHistory = wx.getStorageSync(`chat_history_${sessionId}`)
      if (savedHistory && Array.isArray(savedHistory)) {
        this.setData({ 
          history: savedHistory,
          conversationCount: savedHistory.length
        })
        return true
      }
    } catch (err) {
      console.warn('加载会话历史失败:', err)
    }
    return false
  },

  onKeyboardHeightChange(e) {
    this.setData({
      keyboardHeight: e.detail.height
    })
    this.scrollToBottom()
  },

  onInput(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },

  async sendMessage() {
    const { inputValue, sending, messages, history, displayHistory } = this.data
    
    if (!inputValue.trim()) {
      showToast('请输入问题')
      return
    }

    if (sending) {
      showToast('正在等待回复...')
      return
    }

    try {
      // 1. 添加用户消息到UI和历史
      const userMessage = {
        id: 'msg_' + Date.now(),
        type: 'user',
        content: inputValue.trim(),
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' })
      }

      // 2. 创建AI消息占位符
      const aiMessageId = 'msg_' + (Date.now() + 1)
      const aiMessage = {
        id: aiMessageId,
        type: 'assistant',
        content: '',
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        loading: true
      }

      // 3. 更新UI
      this.setData({
        messages: [...messages, userMessage, aiMessage],
        inputValue: '',
        sending: true
      })

      this.scrollToBottom()

      // 4. 更新对话历史（保持最近20条）
      const newHistory = this.addToHistory(history, 'user', inputValue.trim(), 20)

      console.log('📤 发送给后端的历史记录:', newHistory)

      // 5. 调用真实的Spring AI后端
      const aiResponse = await this.callSpringAI(inputValue.trim(), newHistory, aiMessageId)

      // 6. 更新历史记录
      const updatedHistory = this.addToHistory(newHistory, 'assistant', aiResponse, 20)
      
      this.setData({
        history: updatedHistory,
        conversationCount: updatedHistory.length
      })

      // 7. 保存会话历史
      this.saveSessionHistory()

    } catch (err) {
      console.error('发送消息失败:', err)
      showToast('消息发送失败，请重试')
    } finally {
      this.setData({ sending: false })
    }
  },

  // 调用真实的Spring AI后端
  async callSpringAI(question, history, messageId) {
    return new Promise((resolve, reject) => {
      const token = wx.getStorageSync('token')
      if (!token) {
        console.error('未找到认证token')
        this.updateMessageContent(messageId, '错误：未登录，请重新登录。')
        reject(new Error('No auth token'))
        return
      }

      const baseUrl = 'http://localhost:8081'
      const requestBody = {
        question: question,
        sessionId: this.data.sessionId,
        history: history  // 直接传递对话历史
      }

      console.log('🚀 调用Spring AI接口...')
      console.log('请求体:', JSON.stringify(requestBody, null, 2))

      wx.request({
        url: `${baseUrl}/api/owner/smart-qa/chat-async`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: requestBody,
        timeout: 60000,
        responseType: 'text',
        success: (res) => {
          console.log('✅ 响应状态:', res.statusCode)
          console.log('✅ 响应数据:', JSON.stringify(res.data).substring(0, 200))
          
          if (res.statusCode === 200) {
            let fullContent = ''
            
            try {
              // 处理JSON响应
              if (typeof res.data === 'string') {
                // 如果是字符串，尝试解析JSON
                const parsed = JSON.parse(res.data)
                if (parsed.success && parsed.data && parsed.data.content) {
                  fullContent = parsed.data.content
                }
              } else if (res.data && res.data.success && res.data.data && res.data.data.content) {
                fullContent = res.data.data.content
              }
            } catch (parseErr) {
              console.warn('响应数据解析异常:', parseErr)
            }

            if (fullContent && fullContent.trim()) {
              // 使用打字机效果显示回复
              this.typeWriter(messageId, fullContent, 0, () => {
                resolve(fullContent)
              }, reject)
            } else {
              console.warn('响应数据为空')
              this.updateMessageContent(messageId, '无法获取回复，请稍后重试。')
              reject(new Error('Empty response'))
            }
          } else if (res.statusCode === 401) {
            console.error('认证失败')
            this.updateMessageContent(messageId, '错误：认证失败，请重新登录。')
            reject(new Error('Unauthorized'))
          } else {
            console.error('HTTP错误:', res.statusCode)
            this.updateMessageContent(messageId, `错误：请求失败（状态码${res.statusCode}）`)
            reject(new Error(`HTTP ${res.statusCode}`))
          }
        },
        fail: (err) => {
          console.error('请求失败:', err)
          
          // 检查是否是超时错误
          if (err.errMsg && err.errMsg.includes('timeout')) {
            this.updateMessageContent(messageId, '请求超时，请检查网络连接后重试。')
          } else if (err.errMsg && err.errMsg.includes('ERR_INCOMPLETE_CHUNKED_ENCODING')) {
            this.updateMessageContent(messageId, '连接异常，请稍后重试。')
          } else {
            this.updateMessageContent(messageId, '网络连接失败，请检查网络后重试。')
          }
          
          reject(err)
        }
      })
    })
  },

  // 添加对话到历史，保持最多指定条数
  addToHistory(currentHistory, role, content, maxItems = 20) {
    const newHistory = [...currentHistory, { role: role, content: content }]
    
    // 如果超过最大条数，从开头移除
    if (newHistory.length > maxItems) {
      return newHistory.slice(newHistory.length - maxItems)
    }
    
    return newHistory
  },

  // 打字机效果 - 逐字显示
  typeWriter(messageId, fullContent, index, resolve, reject) {
    const { messages } = this.data

    if (index >= fullContent.length) {
      // 完成
      const messageIndex = messages.findIndex(m => m.id === messageId)
      if (messageIndex !== -1) {
        messages[messageIndex].loading = false
      }
      this.setData({ messages })

      this.scrollToBottom()
      resolve()
      return
    }

    // 每次添加一个字符
    const character = fullContent.charAt(index)
    const messageIndex = messages.findIndex(m => m.id === messageId)
    
    if (messageIndex !== -1) {
      messages[messageIndex].content += character
    }

    this.setData({ messages })
    this.scrollToBottom()

    // 控制打字速度（30ms 一个字符）
    setTimeout(() => {
      this.typeWriter(messageId, fullContent, index + 1, resolve, reject)
    }, 30)
  },

  // 更新消息内容
  updateMessageContent(messageId, content) {
    const { messages } = this.data
    const messageIndex = messages.findIndex(m => m.id === messageId)
    
    if (messageIndex !== -1) {
      messages[messageIndex].content = content
      messages[messageIndex].loading = false
    }

    this.setData({ messages })
  },

  // 滚动到底部
  scrollToBottom() {
    wx.nextTick(() => {
      this.setData({
        scrollTop: 9999
      })
    })
  },

  // 清除对话
  clearMessages() {
    wx.showModal({
      title: '清除对话',
      content: `确定要清除所有对话记录吗？（当前有${this.data.conversationCount}条记录）`,
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储的会话历史
          try {
            wx.removeStorageSync(`chat_history_${this.data.sessionId}`)
          } catch (err) {
            console.warn('清除存储失败:', err)
          }

          this.setData({
            messages: [
              {
                id: 'welcome_' + Date.now(),
                type: 'assistant',
                content: '✨ 对话已清除。\n\n有什么我可以帮助您的吗？',
                timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' })
              }
            ],
            history: [],
            conversationCount: 0,
            sessionId: `session_${Date.now()}`  // 重新生成sessionId
          })
          this.scrollToBottom()
          showToast('对话已清除')
        }
      }
    })
  },

  // 复制消息
  copyMessage(e) {
    const { content } = e.currentTarget.dataset
    wx.setClipboardData({
      data: content,
      success: () => {
        showToast('已复制到剪贴板')
      }
    })
  }
})
