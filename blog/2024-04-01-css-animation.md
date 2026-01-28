---
slug: css-animation
title: CSS 动画与过渡效果实战
authors: mason
tags: [CSS, 动画, 前端]
---

CSS 动画能让页面更加生动有趣。本文总结 Transition、Animation 的使用技巧和性能优化。

<!--truncate-->

## 🎬 Transition 过渡

### 基础语法

```css
.element {
  transition: property duration timing-function delay;
  
  /* 示例 */
  transition: all 0.3s ease;
  transition: transform 0.3s ease, opacity 0.2s ease;
}
```

### 常用属性

| 属性 | 说明 | 示例值 |
|------|------|--------|
| `property` | 过渡属性 | all, transform, opacity |
| `duration` | 持续时间 | 0.3s, 300ms |
| `timing-function` | 缓动函数 | ease, linear, ease-in-out |
| `delay` | 延迟时间 | 0s, 0.1s |

### 缓动函数

```css
/* 内置缓动 */
transition-timing-function: ease;        /* 默认，慢-快-慢 */
transition-timing-function: linear;      /* 匀速 */
transition-timing-function: ease-in;     /* 慢-快 */
transition-timing-function: ease-out;    /* 快-慢 */
transition-timing-function: ease-in-out; /* 慢-快-慢 */

/* 自定义贝塞尔曲线 */
transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### 实用示例

```css
/* 按钮悬浮效果 */
.button {
  background: #3b82f6;
  transform: translateY(0);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

/* 卡片展开效果 */
.card {
  max-height: 100px;
  overflow: hidden;
  transition: max-height 0.5s ease;
}

.card.expanded {
  max-height: 500px;
}
```

---

## 🎨 Animation 动画

### 基础语法

```css
@keyframes animationName {
  0% { /* 开始状态 */ }
  50% { /* 中间状态 */ }
  100% { /* 结束状态 */ }
}

.element {
  animation: name duration timing-function delay iteration-count direction fill-mode;
}
```

### 动画属性

| 属性 | 说明 | 示例值 |
|------|------|--------|
| `name` | 动画名称 | fadeIn, slideUp |
| `duration` | 持续时间 | 1s, 500ms |
| `timing-function` | 缓动函数 | ease, linear |
| `delay` | 延迟 | 0s, 0.5s |
| `iteration-count` | 播放次数 | 1, 3, infinite |
| `direction` | 播放方向 | normal, reverse, alternate |
| `fill-mode` | 填充模式 | forwards, backwards, both |
| `play-state` | 播放状态 | running, paused |

### 常用动画

```css
/* 淡入 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 淡入上移 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 缩放弹跳 */
@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* 旋转 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 脉冲 */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 摇晃 */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
```

### 使用示例

```css
/* 加载动画 */
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 入场动画 */
.card {
  animation: fadeInUp 0.6s ease forwards;
}

/* 延迟入场 */
.card:nth-child(1) { animation-delay: 0.1s; }
.card:nth-child(2) { animation-delay: 0.2s; }
.card:nth-child(3) { animation-delay: 0.3s; }
```

---

## ⚡ 性能优化

### 只动画这些属性

```css
/* ✅ 高性能 - 使用 GPU 加速 */
transform: translate(), scale(), rotate();
opacity: 0 ~ 1;

/* ❌ 低性能 - 触发重排 */
width, height, margin, padding, top, left, right, bottom
```

### 开启 GPU 加速

```css
.element {
  /* 触发硬件加速 */
  transform: translateZ(0);
  /* 或 */
  will-change: transform, opacity;
}
```

### will-change 使用注意

```css
/* ✅ 正确：悬浮时提前告知 */
.card:hover {
  will-change: transform;
}

/* ❌ 错误：不要滥用 */
* { will-change: all; }
```

### 减少重排

```css
/* ❌ 触发重排 */
.bad {
  animation: moveLeft 1s;
}
@keyframes moveLeft {
  to { left: 100px; }
}

/* ✅ 使用 transform */
.good {
  animation: moveLeft 1s;
}
@keyframes moveLeft {
  to { transform: translateX(100px); }
}
```

---

## 🎯 实战案例

### 1. 按钮涟漪效果

```css
.ripple-button {
  position: relative;
  overflow: hidden;
}

.ripple-button::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 60%);
  transform: scale(0);
  opacity: 0;
}

.ripple-button:active::after {
  transform: scale(2);
  opacity: 1;
  transition: transform 0.5s, opacity 0.3s;
}
```

### 2. 骨架屏加载

```css
.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 3. 打字机效果

```css
.typewriter {
  overflow: hidden;
  border-right: 2px solid;
  white-space: nowrap;
  animation: 
    typing 3s steps(20) forwards,
    blink 0.5s step-end infinite;
}

@keyframes typing {
  from { width: 0; }
  to { width: 100%; }
}

@keyframes blink {
  50% { border-color: transparent; }
}
```

---

## 📚 推荐资源

- [Animate.css](https://animate.style/) - 预设动画库
- [Cubic Bezier](https://cubic-bezier.com/) - 贝塞尔曲线可视化
- [CSS Triggers](https://csstriggers.com/) - 属性性能参考

---

动画能大幅提升用户体验，但要注意性能和适度使用。记住：**少即是多**。
