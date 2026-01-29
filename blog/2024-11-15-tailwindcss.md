---
slug: tailwindcss-practice
title: Tailwind CSS 实践技巧
authors: mason
tags: [CSS, Tailwind, 前端]
---

Tailwind CSS 是一个原子化的 CSS 框架，让你无需离开 HTML 就能构建现代界面。本文分享 Tailwind 的实用技巧。

<!--truncate-->

## 🎯 为什么选择 Tailwind

| 优势 | 说明 |
|------|------|
| 开发效率高 | 无需切换文件，快速编写样式 |
| 包体积小 | 只打包使用的样式 |
| 一致性好 | 预设的设计系统 |
| 可定制 | 完全可配置 |
| 响应式友好 | 内置断点前缀 |

---

## 🚀 快速开始

### 安装

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 配置

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### 引入样式

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 📝 基础用法

### 间距

```html
<!-- 内边距 -->
<div class="p-4">padding: 1rem</div>
<div class="px-4 py-2">x: 1rem, y: 0.5rem</div>
<div class="pt-4 pr-2 pb-4 pl-2">各方向</div>

<!-- 外边距 -->
<div class="m-4">margin: 1rem</div>
<div class="mx-auto">水平居中</div>
<div class="mt-4 mb-8">上下</div>

<!-- 间距单位：4 = 1rem = 16px -->
<!-- 1=0.25rem, 2=0.5rem, 4=1rem, 8=2rem -->
```

### 尺寸

```html
<!-- 宽度 -->
<div class="w-full">100%</div>
<div class="w-1/2">50%</div>
<div class="w-64">16rem</div>
<div class="w-screen">100vw</div>
<div class="max-w-md">max-width</div>

<!-- 高度 -->
<div class="h-screen">100vh</div>
<div class="h-full">100%</div>
<div class="min-h-screen">最小 100vh</div>
```

### 颜色

```html
<!-- 文字颜色 -->
<p class="text-gray-900">深色文字</p>
<p class="text-blue-500">蓝色文字</p>
<p class="text-red-600">红色文字</p>

<!-- 背景色 -->
<div class="bg-white">白色背景</div>
<div class="bg-gray-100">灰色背景</div>
<div class="bg-blue-500">蓝色背景</div>

<!-- 透明度 -->
<div class="bg-black/50">50% 透明黑</div>
<div class="text-white/80">80% 透明白</div>
```

### 排版

```html
<!-- 字体大小 -->
<p class="text-sm">小字</p>
<p class="text-base">正常</p>
<p class="text-lg">大字</p>
<p class="text-2xl">更大</p>

<!-- 字重 -->
<p class="font-normal">正常</p>
<p class="font-medium">中等</p>
<p class="font-bold">粗体</p>

<!-- 对齐 -->
<p class="text-left">左对齐</p>
<p class="text-center">居中</p>
<p class="text-right">右对齐</p>
```

---

## 📐 Flexbox 和 Grid

### Flexbox

```html
<!-- 基础 Flex -->
<div class="flex items-center justify-between">
  <span>Left</span>
  <span>Right</span>
</div>

<!-- 垂直居中 -->
<div class="flex items-center justify-center h-screen">
  <p>居中内容</p>
</div>

<!-- 间距 -->
<div class="flex gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- 换行 -->
<div class="flex flex-wrap gap-4">
  <!-- items -->
</div>
```

### Grid

```html
<!-- 基础 Grid -->
<div class="grid grid-cols-3 gap-4">
  <div>1</div>
  <div>2</div>
  <div>3</div>
</div>

<!-- 响应式列数 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <!-- items -->
</div>

<!-- 跨列 -->
<div class="grid grid-cols-4 gap-4">
  <div class="col-span-2">跨 2 列</div>
  <div>1 列</div>
  <div>1 列</div>
</div>
```

---

## 📱 响应式设计

### 断点

| 前缀 | 最小宽度 | CSS |
|------|---------|-----|
| `sm` | 640px | `@media (min-width: 640px)` |
| `md` | 768px | `@media (min-width: 768px)` |
| `lg` | 1024px | `@media (min-width: 1024px)` |
| `xl` | 1280px | `@media (min-width: 1280px)` |
| `2xl` | 1536px | `@media (min-width: 1536px)` |

### 使用示例

```html
<!-- 移动端优先 -->
<div class="
  w-full        /* 默认全宽 */
  md:w-1/2      /* 中屏一半 */
  lg:w-1/3      /* 大屏三分之一 */
">
  响应式宽度
</div>

<!-- 响应式隐藏 -->
<div class="hidden md:block">仅桌面显示</div>
<div class="md:hidden">仅移动端显示</div>

<!-- 响应式布局 -->
<div class="flex flex-col md:flex-row gap-4">
  <aside class="w-full md:w-64">侧边栏</aside>
  <main class="flex-1">主内容</main>
</div>
```

---

## 🎨 状态变体

### 悬停和焦点

```html
<button class="
  bg-blue-500 
  hover:bg-blue-600 
  focus:ring-2 
  focus:ring-blue-300
  active:bg-blue-700
">
  按钮
</button>

<input class="
  border 
  border-gray-300 
  focus:border-blue-500 
  focus:ring-1 
  focus:ring-blue-500
  focus:outline-none
" />
```

### 分组状态

```html
<div class="group">
  <img class="group-hover:scale-105 transition" />
  <p class="group-hover:text-blue-500">标题</p>
</div>
```

### 暗色模式

```html
<div class="bg-white dark:bg-gray-900">
  <p class="text-gray-900 dark:text-white">
    自动适应主题
  </p>
</div>
```

---

## 🧩 组件抽象

### @apply 提取

```css
/* globals.css */
@layer components {
  .btn {
    @apply px-4 py-2 rounded font-medium transition;
  }
  
  .btn-primary {
    @apply btn bg-blue-500 text-white hover:bg-blue-600;
  }
  
  .btn-secondary {
    @apply btn bg-gray-200 text-gray-800 hover:bg-gray-300;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
}
```

### React 组件

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

function Button({ variant = 'primary', children }: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded font-medium transition';
  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]}`}>
      {children}
    </button>
  );
}
```

### clsx / cn 工具

```tsx
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// 使用
<button className={cn(
  'px-4 py-2 rounded',
  isActive && 'bg-blue-500',
  disabled && 'opacity-50 cursor-not-allowed',
  className
)}>
  按钮
</button>
```

---

## ⚙️ 自定义配置

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

---

## 💡 实用技巧

### 1. 截断文本

```html
<p class="truncate">很长的文本...</p>
<p class="line-clamp-2">限制两行...</p>
```

### 2. 纵横比

```html
<div class="aspect-video">16:9</div>
<div class="aspect-square">1:1</div>
```

### 3. 滚动容器

```html
<div class="h-64 overflow-y-auto scrollbar-thin">
  <!-- 内容 -->
</div>
```

### 4. 渐变

```html
<div class="bg-gradient-to-r from-blue-500 to-purple-500">
  渐变背景
</div>
```

---

## 📋 推荐插件

| 插件 | 用途 |
|------|------|
| `@tailwindcss/forms` | 表单样式 |
| `@tailwindcss/typography` | 文章排版 |
| `@tailwindcss/aspect-ratio` | 纵横比 |
| `tailwind-merge` | 类名合并 |
| `clsx` | 条件类名 |

---

Tailwind 的核心理念是"约束即自由"。熟练掌握后，开发效率会大幅提升。
