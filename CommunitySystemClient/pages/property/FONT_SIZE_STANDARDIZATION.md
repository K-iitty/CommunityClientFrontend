# 物业微信小程序 字体大小标准化规范

## 📏 字体大小体系

### 基础字体大小
- **12px** - **标准正文字体** ✅（全应用标准）
- **11px** - 小字体（标签、时间、辅助信息）
- **13px** - 略大字体（副标题、描述）
- **14px** - 中等字体（卡片标题）
- **16px** - 大字体（页面标题）
- **32px** - 特大字体（用户名等强调）

---

## 📋 应用场景

### 12px - 标准正文字体 ✅
```css
/* 所有普通文本内容 */
.info-text { font-size: 12px; }        /* 信息文本 */
.description { font-size: 12px; }      /* 描述文本 */
.notice-time { font-size: 12px; }      /* 时间戳 */
.label { font-size: 12px; }            /* 标签 */
```

### 11px - 小字体
```css
.issue-status { font-size: 11px; }     /* 状态标签 */
.notice-type { font-size: 11px; }      /* 类型标签 */
.issue-time { font-size: 11px; }       /* 辅助时间 */
```

### 13px - 副标题
```css
.action-text { font-size: 13px; }      /* 按钮文本 */
.notice-content { font-size: 13px; }   /* 公告内容 */
```

### 14px - 卡片标题
```css
/* 暂未使用，保留 */
```

### 16px - 页面标题
```css
.issue-title { font-size: 16px; }      /* 问题标题 */
.section-title { font-size: 16px; }    /* 页面分区标题 */
.notice-title { font-size: 16px; }     /* 公告标题 */
```

### 32px - 特大字体
```css
.username { font-size: 32px; }         /* 用户名 */
```

---

## ✅ 已更新文件列表

### Home 页面
- ✅ `pages/property/home/home.wxss` - 12px 标准字体已设置

### 其他页面（待逐个更新）
- 📋 `pages/property/feedback/list/list.wxss`
- 📋 `pages/property/house/house-list/house-list.wxss`
- 📋 `pages/property/vehicle/vehicle-list/vehicle-list.wxss`
- 📋 `pages/property/meter/owner-list/owner-list.wxss`
- 📋 `pages/property/notice/list/list.wxss`
- 📋 `pages/property/profile/profile.wxss`
- 📋 `pages/property/department/department.wxss`
- 📋 `pages/property/house/add-house/add-house.wxss`
- 📋 `pages/property/feedback/detail/detail.wxss`
- 📋 `pages/property/feedback/process/process.wxss`

---

## 🎯 字体权重规范

```css
/* 字体粗细标准 */
.light-text      { font-weight: 400; }  /* 常规 */
.normal-text     { font-weight: 500; }  /* 中等 */
.semi-bold-text  { font-weight: 600; }  /* 半粗体 */
.bold-text       { font-weight: 700; }  /* 粗体 */
.extra-bold-text { font-weight: 800; }  /* 特粗 */
```

---

## 📝 迁移注意事项

1. **优先级**：使用 `!important` 确保全局应用
2. **统一性**：所有 `.wxss` 文件应遵循此标准
3. **响应式**：使用 `rpx` 处理响应式单位，对应 12px 约为 12rpx
4. **行高**：配合适当行高（通常 1.4-1.6），保持可读性

---

## 🚀 快速参考

| 场景 | 大小 | 权重 | 示例 |
|------|------|------|------|
| 标准正文 | 12px | 500 | 用户名、描述 |
| 辅助文字 | 11px | 600 | 时间、状态 |
| 副标题 | 13px | 600 | 按钮、内容 |
| 标题 | 16px | 700 | 页面分区、卡片标题 |
| 强调 | 32px | 700 | 用户名大号 |
