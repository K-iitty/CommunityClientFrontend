# 🏘️ 智慧社区微信小程序 - 前端项目

## 项目简介

**智慧社区**是一款功能完整的微信小程序，为城市社区提供现代化的数字化管理与服务平台。该项目采用双角色架构设计，分别面向**业主用户**和**物业管理人员**，提供涵盖通知、反馈、费用查询、房产管理等核心功能。

- **项目名称**: 智慧社区微信小程序
- **平台**: 微信小程序（基于微信官方框架）
- **开发语言**: JavaScript / WXML / WXSS
- **项目状态**: 🚀 活跃开发中
- **当前版本**: v1.1.0
- **最后更新**: 2025年11月2日

---

## 🎯 核心功能

### 业主端（Owner Module）

| 功能模块 | 描述 | 状态 |
|---------|------|------|
| **首页** | 快捷操作、最近反馈、通知公告预览 | ✅ |
| **公告通知** | 浏览社区通知、查看详情 | ✅ |
| **问题反馈** | 提交、查看、追踪问题反馈 | ✅ |
| **AI客服** | 智能客服对话、问题解答 | ✅ |
| **个人中心** | 用户信息、房产管理、车位、水电表、账单、物业联系 | ✅ |
| **房产管理** | 查看、编辑房产信息 | ✅ |
| **车位管理** | 添加、编辑、删除车位 | ✅ |
| **水电表** | 查看、提交水电表读数 | ✅ |
| **账单查询** | 查看相关费用账单 | ✅ |

### 物业端（Property/Staff Module）

| 功能模块 | 描述 | 状态 |
|---------|------|------|
| **首页** | 数据统计、快捷操作 | ✅ |
| **反馈管理** | 查看、处理、跟进反馈 | ✅ |
| **房产管理** | 添加、编辑、删除房产信息 | ✅ |
| **车位管理** | 添加、编辑、删除车位 | ✅ |
| **水电表** | 查看、添加表读数 | ✅ |
| **公告管理** | 发布、编辑、删除公告 | ✅ |
| **部门管理** | 管理部门及人员 | ✅ |
| **社区信息** | 查看社区详情 | ✅ |
| **个人中心** | 修改密码、编辑信息 | ✅ |

---

## 📂 项目结构

```
CommunityClient-Frontend/
├── CommunitySystemClient/               # 小程序主项目
│   ├── app.js                          # 应用入口 (全局配置、登录状态管理)
│   ├── app.json                        # 应用配置 (页面路由、窗口样式、底部导航)
│   ├── app.wxss                        # 全局样式 (主题色、基础样式、通用类)
│   ├── project.config.json             # 微信开发者工具配置
│   ├── sitemap.json                    # SEO配置
│   │
│   ├── pages/                          # 页面目录
│   │   ├── login/                      # 登录页面
│   │   │   ├── login.wxml
│   │   │   ├── login.js
│   │   │   ├── login.wxss
│   │   │   └── login.json
│   │   │
│   │   ├── owner/                      # 业主功能模块
│   │   │   ├── home/                   # 业主首页
│   │   │   ├── notice/                 # 公告模块
│   │   │   ├── feedback/               # 反馈模块
│   │   │   ├── profile/                # 个人中心
│   │   │   │   ├── house/              # 房产管理
│   │   │   │   ├── vehicle/            # 车位管理
│   │   │   │   ├── meter/              # 水电表
│   │   │   │   ├── parking/            # 停车位
│   │   │   │   ├── billing/            # 账单
│   │   │   │   └── property-contact/   # 物业联系
│   │   │   ├── ai-chat/                # AI客服
│   │   │   └── register/               # 注册页面
│   │   │
│   │   ├── property/                   # 物业功能模块
│   │   │   ├── home/                   # 物业首页
│   │   │   ├── feedback/               # 反馈处理
│   │   │   │   ├── list/
│   │   │   │   ├── detail/
│   │   │   │   └── follow-up/
│   │   │   ├── house/                  # 房产管理
│   │   │   │   ├── house-list/
│   │   │   │   ├── add-house/
│   │   │   │   ├── edit-house/
│   │   │   │   └── house-info/
│   │   │   ├── vehicle/                # 车位管理
│   │   │   ├── meter/                  # 水电表管理
│   │   │   ├── notice/                 # 公告管理
│   │   │   ├── community/              # 社区管理
│   │   │   ├── department/             # 部门管理
│   │   │   └── profile/                # 物业个人中心
│   │   │
│   │   └── logs/                       # 日志页面（调试用）
│   │
│   ├── utils/                          # 工具函数目录
│   │   ├── api.js                      # API请求封装 (HTTP通信、错误处理)
│   │   └── util.js                     # 通用工具函数 (格式化、校验等)
│   │
│   ├── img/                            # 图片资源
│   │   ├── home-pro/                   # 首页物业端图片
│   │   ├── img-ai/                     # AI客服图片
│   │   ├── img-home/                   # 首页业主端图片
│   │   └── img-owner/                  # 业主端其他图片
│   │
│   └── md/                             # 项目文档
│       ├── README.md                   # 开发指南
│       ├── START_HERE.md               # 新手入门
│       ├── QUICK_START.md              # 快速开始
│       ├── DEVELOPMENT_GUIDE.md        # 开发规范
│       ├── DEPLOYMENT.md               # 部署指南
│       └── ... (60+ 文档)
│
└── README.md                           # 项目总体说明（本文件）
```

---

## 🚀 快速开始

### 前置要求

- **微信开发者工具** (v1.06+)
- **Node.js** (可选，用于后端联调)
- **后端服务** (业主端: localhost:8081, 物业端: localhost:8082)

### 步骤1：环境配置

```bash
# 1. 克隆或打开项目
# 使用微信开发者工具打开 CommunitySystemClient 文件夹

# 2. 在微信开发者工具中编译项目
# Windows: Ctrl + B
# Mac: Cmd + B
```

### 步骤2：关闭域名验证

由于开发环境使用 localhost，需要关闭微信的域名校验：

```
微信开发者工具 > 详情 > 勾选 "不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"
```

### 步骤3：配置后端地址

编辑 `CommunitySystemClient/app.js`，确保后端地址配置正确：

```javascript
globalData: {
  baseUrl: 'http://localhost:8080',  // 默认地址
  // 实际会根据 role 自动切换到 8081 (owner) 或 8082 (staff)
}
```

### 步骤4：开始开发

```bash
# 使用微信开发者工具的模拟器进行测试
# 打开控制台查看日志输出
# 开始修改代码并实时预览
```

---

## 🔧 技术栈

| 技术 | 说明 | 版本 |
|-----|------|------|
| **小程序框架** | 微信官方框架 | v3.8.10+ |
| **语言** | JavaScript (ES6+) | 原生支持 |
| **模板引擎** | WXML | 原生支持 |
| **样式** | WXSS | 原生支持 |
| **HTTP客户端** | wx.request | 原生API |
| **本地存储** | wx.setStorageSync | 原生API |
| **图片处理** | wx.chooseImage | 原生API |

---

## 📋 API 交互说明

### 请求配置

项目通过 `utils/api.js` 统一管理所有API请求：

```javascript
// 基础URL配置
const OWNER_BASE_URL = 'http://localhost:8081'      // 业主模块
const STAFF_BASE_URL = 'http://localhost:8082'      // 物业模块

// 请求头自动添加
Authorization: `Bearer ${token}`      // JWT令牌
Content-Type: application/json        // 内容类型
```

### 常用API方法

```javascript
// 导入API工具
import api from '../../utils/api'

// 获取数据
api.get('/endpoint', moduleType).then(data => {
  console.log(data)
}).catch(err => {
  console.error(err)
})

// 提交数据
api.post('/endpoint', { key: value }, moduleType)
  .then(data => console.log(data))

// 上传文件
api.uploadFile('/upload', filePath, moduleType)
```

### 错误处理

项目统一处理API错误：

- **401**: Token过期，自动跳转登录页
- **其他错误**: 显示错误提示toast

---

## 🎨 设计规范

### 色彩系统

```
主色调    #35b6f4  (蓝色)
深蓝      #357ABD
成功      #67C23A  (绿色)
警告      #E6A23C  (橙色)
错误      #F56C6C  (红色)
中性      #999999  (灰色)
```

### 间距规范

```
页面内边距       20rpx
元素间距         16rpx
卡片内边距       24rpx
按钮高度         88rpx
圆角（卡片）     16rpx
圆角（按钮）     50rpx
圆角（输入框）   12rpx
```

### 字体规范

```
H1  28rpx  bold
H2  24rpx  bold
H3  20rpx  bold
正文 16rpx  normal
小字 12rpx  normal
```

### 设计原则

- ✅ 遵循蓝色主题配色
- ✅ 采用卡片化设计
- ✅ 提供加载状态反馈
- ✅ 完善的错误提示
- ❌ 禁止使用emoji
- ❌ 禁止中文class/id名
- ❌ 禁止混用颜色

---

## 🔐 用户认证系统

### 登录流程

```
1. 用户输入用户名/密码
   ↓
2. 提交到后端验证
   ↓
3. 后端返回 token + role + userInfo
   ↓
4. 前端保存到 localStorage (wx.setStorageSync)
   ↓
5. 根据 role 切换到对应首页
```

### 全局状态管理

通过 `app.js` 中的 `globalData` 管理全局状态：

```javascript
globalData: {
  userInfo: null,      // 用户信息 { id, name, email, ... }
  token: null,         // JWT令牌，用于API请求认证
  role: 'owner',       // 用户角色: 'owner' 或 'staff'
  baseUrl: '...',      // 根据角色自动切换的API基址
  hasLogin: false      // 是否已登录
}

// 获取应用实例
const app = getApp()

// 获取token
const token = app.getToken()

// 获取角色
const role = app.getRole()

// 保存登录信息
app.saveLoginInfo(token, role, userInfo)

// 清除登录信息
app.clearLoginInfo()
```

### Token管理

- Token以JWT格式存储
- API请求头自动添加: `Authorization: Bearer ${token}`
- Token过期时自动清除，跳转登录页

---

## 📱 页面路由

### 业主端路由

```
/pages/login/login
├── /pages/owner/home/home (首页)
├── /pages/owner/notice/notice (公告)
│   └── /pages/owner/notice/detail/detail
├── /pages/owner/feedback/feedback (反馈)
│   ├── /pages/owner/feedback/submit/submit
│   └── /pages/owner/feedback/detail/detail
├── /pages/owner/ai-chat/ai-chat (AI客服)
└── /pages/owner/profile/profile (个人中心)
    ├── /pages/owner/profile/edit/edit
    ├── /pages/owner/profile/house/house
    │   └── /pages/owner/profile/house/detail/detail
    ├── /pages/owner/profile/vehicle/vehicle
    │   └── /pages/owner/profile/vehicle/detail/detail
    ├── /pages/owner/profile/parking/parking
    ├── /pages/owner/profile/meter/meter
    │   └── /pages/owner/profile/meter/detail/detail
    ├── /pages/owner/profile/billing/billing
    └── /pages/owner/profile/property-contact/property-contact
```

### 物业端路由

```
/pages/login/login
├── /pages/property/home/home (首页)
├── /pages/property/feedback/list/list (反馈)
│   ├── /pages/property/feedback/detail/detail
│   └── /pages/property/feedback/follow-up/follow-up
├── /pages/property/house/house-list/house-list (房产)
│   ├── /pages/property/house/add-house/add-house
│   ├── /pages/property/house/edit-house/edit-house
│   └── /pages/property/house/house-info/house-info
├── /pages/property/vehicle/vehicle-list/vehicle-list (车位)
│   └── /pages/property/vehicle/vehicle-detail/vehicle-detail
├── /pages/property/meter/... (水电表)
├── /pages/property/notice/... (公告)
├── /pages/property/community/community (社区)
├── /pages/property/department/department (部门)
└── /pages/property/profile/profile (个人中心)
    ├── /pages/property/profile/edit/edit
    └── /pages/property/profile/change-password/change-password
```

---

## 💡 开发指南

### 创建新页面

1. **创建文件结构**
```
pages/your-module/your-page/
├── your-page.wxml    (模板)
├── your-page.wxss    (样式)
├── your-page.js      (逻辑)
└── your-page.json    (配置)
```

2. **在 app.json 中注册**
```json
{
  "pages": [
    "pages/your-module/your-page/your-page"
  ]
}
```

3. **编写页面文件**

**your-page.wxml** (模板)
```xml
<view class="container">
  <view class="header">
    <text>页面标题</text>
  </view>
  <view class="content">
    <!-- 页面内容 -->
  </view>
</view>
```

**your-page.js** (逻辑)
```javascript
Page({
  data: {
    // 页面数据
  },
  
  onLoad(options) {
    // 页面加载
  },
  
  onShow() {
    // 页面显示
  }
})
```

**your-page.json** (配置)
```json
{
  "navigationBarTitleText": "页面标题",
  "navigationBarBackgroundColor": "#35b6f4"
}
```

**your-page.wxss** (样式)
```wxss
.container {
  padding: 20rpx;
}
```

### API调用示例

```javascript
// 引入API模块
import { getNotices, submitFeedback } from '../../utils/api'

Page({
  async onLoad() {
    try {
      // 调用GET请求
      const notices = await api.get('/notices', 'owner')
      this.setData({ notices })
    } catch (err) {
      console.error('获取公告失败:', err)
    }
  },
  
  async submitFeedback(content) {
    try {
      // 调用POST请求
      const result = await api.post('/feedback', {
        content,
        category: 'bug'
      }, 'owner')
      
      wx.showToast({
        title: '反馈提交成功',
        icon: 'success'
      })
    } catch (err) {
      console.error('提交反馈失败:', err)
    }
  },
  
  async uploadImage() {
    try {
      // 选择图片
      const { tempFilePaths } = await wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })
      
      // 上传图片
      const result = await api.uploadFile(
        '/upload',
        tempFilePaths[0],
        'owner'
      )
      
      console.log('上传成功:', result)
    } catch (err) {
      console.error('上传失败:', err)
    }
  }
})
```

### 常用工具函数

```javascript
// 在页面中使用工具函数
import { formatDate, formatTime, validateEmail } from '../../utils/util'

// 日期格式化
formatDate(timestamp)         // "2025-11-02"
formatTime(timestamp)         // "14:30:45"

// 表单验证
validateEmail(email)          // true/false
validatePhone(phone)          // true/false
```

---

## 🐛 常见问题与解决方案

### Q1: 编译失败，提示"编译错误"

**原因**: 通常是由于WXML语法错误或JS语法错误

**解决方案**:
1. 检查WXML文件中的括号匹配
2. 确保所有变量都在data或方法中声明
3. 检查JS语法，特别是异步操作

```javascript
// ❌ 错误
this.data.value = 'test'  // 应该使用 setData

// ✅ 正确
this.setData({ value: 'test' })
```

### Q2: 页面无法加载或显示空白

**原因**: 可能是路由配置错误或API请求失败

**解决方案**:
1. 检查app.json中的页面路由配置
2. 在控制台查看错误日志
3. 确保后端服务正常运行

```javascript
// 在 onLoad 中添加调试
Page({
  onLoad() {
    console.log('页面加载开始')
    // 你的代码
    console.log('页面加载完成')
  }
})
```

### Q3: API请求返回401，需要重新登录

**原因**: Token已过期或无效

**解决方案**: 系统会自动处理，自动跳转登录页。无需手动处理。

```javascript
// API错误会自动显示提示
// 系统自动清除token并跳转登录页
```

### Q4: 图片无法上传

**原因**: 可能是API配置错误或权限问题

**解决方案**:
1. 确保后端上传接口正确
2. 检查CORS配置
3. 在微信开发者工具中关闭域名验证

### Q5: 本地存储数据丢失

**原因**: 小程序清理缓存或数据超限

**解决方案**: 
1. 关键数据应该由后端存储
2. 使用 wx.setStorageSync 存储重要数据
3. 在onShow时重新验证数据有效性

```javascript
Page({
  onShow() {
    // 验证token有效性
    const token = wx.getStorageSync('token')
    if (!token) {
      wx.reLaunch({ url: '/pages/login/login' })
    }
  }
})
```

### Q6: 样式不生效

**原因**: WXSS限制或选择器错误

**解决方案**:
1. WXSS不支持后代选择器，只支持class和id
2. 确保class名使用英文
3. 检查样式优先级

```wxss
/* ❌ 不支持 */
.parent .child { }

/* ✅ 正确 */
.child { }
.parent-child { }
```

---

## 📊 项目统计

| 指标 | 数值 |
|-----|------|
| 总页面数 | 47+ |
| 业主端页面 | 20+ |
| 物业端页面 | 27+ |
| API接口 | 100+ |
| 编译错误 | 0 |
| 代码行数 | 20,000+ |
| 文档数 | 70+ |

---

## 🔄 版本历史

| 版本 | 日期 | 说明 |
|-----|------|------|
| v1.0.0 | 2025-10-15 | 基础框架完成，完成第一阶段 |
| v1.0.1 | 2025-10-18 | 修复可选链操作符兼容性问题 |
| v1.1.0 | 2025-10-21 | 移除所有emoji，统一蓝色主题 |
| v1.2.0 | 进行中 | 第二阶段：完整功能开发 |
| v2.0.0 | 规划中 | 第三阶段：深色模式、国际化 |

---

## 📝 开发规范

### 代码风格

- **缩进**: 使用2个空格
- **变量命名**: 驼峰式 (camelCase)
- **常量命名**: 大写下划线 (SNAKE_CASE)
- **类命名**: 帕斯卡式 (PascalCase)
- **注释**: 每个函数需要中文注释说明

```javascript
// ✅ 正确
const MAX_LENGTH = 100
const userName = 'test'
function handleUserLogin() {}

// ❌ 错误
const maxLength = 100
const user_name = 'test'
function handle_user_login() {}
```

### 提交规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 代码重构
perf: 性能优化
test: 测试代码
chore: 其他更改

示例: feat: 添加用户登录功能
```

### 审查清单

在提交代码前检查以下项目：

- [ ] 没有编译错误和警告
- [ ] 没有使用emoji
- [ ] class/id全为英文
- [ ] 颜色使用蓝色主题
- [ ] 间距符合规范
- [ ] API调用正确
- [ ] 错误处理完善
- [ ] 代码注释清晰
- [ ] 页面在各分辨率下正常显示

---

## 🔗 相关链接

### 官方文档
- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/)
- [WXML语法参考](https://developers.weixin.qq.com/miniprogram/dev/reference/wxml/)
- [WXSS样式参考](https://developers.weixin.qq.com/miniprogram/dev/reference/wxss/)
- [API参考](https://developers.weixin.qq.com/miniprogram/dev/api/)

### 项目文档
- [快速开始指南](./CommunitySystemClient/md/START_HERE.md)
- [开发指南](./CommunitySystemClient/md/DEVELOPMENT_GUIDE.md)
- [部署指南](./CommunitySystemClient/md/DEPLOYMENT.md)
- [优化指南](./CommunitySystemClient/md/OPTIMIZATION_QUICK_GUIDE.md)

### 开发工具
- [微信开发者工具下载](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- [VSCode编辑器](https://code.visualstudio.com/)
- [Git版本控制](https://git-scm.com/)

---

## 📞 获取帮助

### 查看文档
项目包含70+份详细文档，覆盖开发的各个方面：
- 快速入门: `START_HERE.md`
- 开发规范: `DEVELOPMENT_GUIDE.md`
- 优化方案: `OPTIMIZATION_QUICK_GUIDE.md`
- 问题解决: `DEVELOPMENT_SUMMARY.md`

### 查看项目路线图
- 完整开发路线图: `FULL_DEVELOPMENT_ROADMAP.md`
- 当前进度: `PHASE_2_PROGRESS.md`
- 实现计划: `PHASE_2_IMPLEMENTATION.md`

### 社区支持
- 微信小程序社区: https://developers.weixin.qq.com/community
- Stack Overflow: WeChat Mini Program标签

---

## 📄 许可证

本项目由西安社区数字化项目开发团队开发和维护。

---

## 👥 贡献者

感谢以下开发者对项目做出的贡献：

- **项目负责人**: AI开发助手
- **首席开发**: 团队全体成员
- **设计**: UI/UX团队
- **测试**: QA团队

---

## 📈 项目改进建议

我们欢迎任何改进建议！请通过以下方式反馈：

1. **提交Issue**: 描述问题或功能建议
2. **提交PR**: 提交代码改进
3. **反馈意见**: 在项目文档中留言

---

**项目最后更新**: 2025年11月2日  
**维护者**: AI开发助手  
**祝你开发愉快！** 🎉
