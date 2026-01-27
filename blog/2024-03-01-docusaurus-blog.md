---
slug: build-docusaurus-blog
title: 从 0 到 1 搭建 Docusaurus 博客
authors: mason
tags: [Docusaurus, 博客, 教程]
---

这篇文章记录了我搭建这个博客的完整过程，包括初始化、自定义主题、功能增强和部署上线。

<!--truncate-->

## 🎯 为什么选择 Docusaurus

在众多静态网站生成器中，我选择 Docusaurus 的原因：

| 特性 | 说明 |
|------|------|
| React 技术栈 | 熟悉的开发体验 |
| 文档 + 博客 | 一站式解决方案 |
| MDX 支持 | Markdown 中使用 React 组件 |
| 插件生态 | 丰富的官方和社区插件 |
| 版本管理 | 文档多版本支持 |
| i18n | 内置国际化方案 |

---

## 🚀 快速开始

### 1. 初始化项目

```bash
npx create-docusaurus@latest my-blog classic --typescript
cd my-blog
yarn start
```

### 2. 项目结构

```
my-blog/
├── blog/                 # 博客文章
├── docs/                 # 文档
├── src/
│   ├── components/       # 自定义组件
│   ├── css/              # 全局样式
│   └── pages/            # 自定义页面
├── static/               # 静态资源
├── docusaurus.config.ts  # 主配置文件
└── sidebars.ts           # 侧边栏配置
```

### 3. 基础配置

```typescript
// docusaurus.config.ts
const config: Config = {
  title: 'My Blog',
  tagline: '探索技术的无限可能',
  url: 'https://your-domain.com',
  baseUrl: '/',
  
  themeConfig: {
    navbar: {
      title: 'My Blog',
      logo: { src: 'img/logo.svg' },
      items: [
        { to: '/docs', label: 'Docs' },
        { to: '/blog', label: 'Blog' },
        { href: 'https://github.com/xxx', label: 'GitHub' },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()}`,
    },
  },
};
```

---

## 🎨 自定义主题

### 1. 自定义颜色

```css
/* src/css/custom.css */
:root {
  --ifm-color-primary: #00d4aa;
  --ifm-color-primary-dark: #00bf99;
  --ifm-color-primary-darker: #00b391;
  --ifm-color-primary-darkest: #009477;
  --ifm-color-primary-light: #00e9bb;
  --ifm-color-primary-lighter: #00f5c7;
  --ifm-color-primary-lightest: #19ffe0;
  
  --ifm-font-family-base: 'Inter', system-ui, sans-serif;
  --ifm-code-font-size: 95%;
}

[data-theme='dark'] {
  --ifm-color-primary: #00ffc8;
  --ifm-background-color: #0a0a0f;
}
```

### 2. 自定义首页

```tsx
// src/pages/index.tsx
export default function Home() {
  return (
    <Layout>
      <header className={styles.hero}>
        <h1>Welcome to My Blog</h1>
        <p>探索技术的无限可能</p>
        <Link to="/docs" className="button button--primary">
          开始阅读
        </Link>
      </header>
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
```

### 3. 自定义 Logo

创建 SVG Logo 放在 `static/img/logo.svg`，在配置中引用即可。

---

## ✨ 功能增强

### 1. 本地搜索

```bash
yarn add @easyops-cn/docusaurus-search-local
```

```typescript
// docusaurus.config.ts
themes: [
  [
    '@easyops-cn/docusaurus-search-local',
    {
      hashed: true,
      language: ['en', 'zh'],
      highlightSearchTermsOnTargetPage: true,
    },
  ],
],
```

### 2. 评论系统（Giscus）

```bash
yarn add @giscus/react
```

```tsx
// src/components/GiscusComments/index.tsx
import Giscus from '@giscus/react';
import { useColorMode } from '@docusaurus/theme-common';
import BrowserOnly from '@docusaurus/BrowserOnly';

export default function GiscusComments() {
  return (
    <BrowserOnly>
      {() => {
        const { colorMode } = useColorMode();
        return (
          <Giscus
            repo="your-username/your-repo"
            repoId="your-repo-id"
            category="Announcements"
            categoryId="your-category-id"
            mapping="pathname"
            theme={colorMode === 'dark' ? 'dark' : 'light'}
            lang="zh-CN"
          />
        );
      }}
    </BrowserOnly>
  );
}
```

### 3. 阅读进度条

```tsx
// src/components/ReadingProgress/index.tsx
import { useState, useEffect } from 'react';
import styles from './styles.module.css';

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };

    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return <div className={styles.progress} style={{ width: `${progress}%` }} />;
}
```

### 4. 返回顶部按钮

```tsx
// src/components/BackToTop/index.tsx
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisible = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', toggleVisible);
    return () => window.removeEventListener('scroll', toggleVisible);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button className={styles.backToTop} onClick={scrollToTop}>
      ↑
    </button>
  );
}
```

---

## 🚀 部署到 GitHub Pages

### 1. 配置 GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: yarn
          
      - name: Install dependencies
        run: yarn install --frozen-lockfile
        
      - name: Build
        run: yarn build
        
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build
```

### 2. 配置仓库

1. 进入仓库 Settings > Pages
2. Source 选择 `gh-pages` 分支
3. 保存后等待部署完成

### 3. 自定义域名（可选）

```
# static/CNAME
your-domain.com
```

---

## 📝 写作技巧

### 1. 博客文章格式

```markdown
---
slug: my-first-post
title: 我的第一篇博客
authors: mason
tags: [标签1, 标签2]
---

文章摘要，会显示在列表页。

<!--truncate-->

正文内容...
```

### 2. 使用 Admonitions

```markdown
:::tip 提示
这是一个提示信息
:::

:::warning 警告
这是一个警告信息
:::

:::danger 危险
这是一个危险警告
:::
```

### 3. 使用 MDX 组件

MDX 允许在 Markdown 中使用 React 组件：

```javascript
// 导入组件
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

// 在文档中使用 Tabs 组件实现多语言代码切换
```

常用 MDX 功能：
- **Tabs** - 多标签页切换
- **CodeBlock** - 自定义代码块
- **Details** - 可折叠内容
- **Admonitions** - 提示/警告框

---

## 🔧 常见问题

### 1. 构建失败：端口被占用

```bash
lsof -ti:3000 | xargs kill -9
yarn start
```

### 2. 图片无法显示

确保图片放在 `static` 目录下，使用绝对路径引用：

```markdown
![图片](/img/my-image.png)
```

### 3. 中文搜索不生效

确保搜索插件配置了中文语言：

```typescript
language: ['en', 'zh'],
```

---

## 📋 上线检查清单

| 检查项 | 状态 |
|--------|------|
| 基础配置完成 | ✅ |
| 自定义主题 | ✅ |
| 本地搜索 | ✅ |
| 评论系统 | ✅ |
| 阅读增强 | ✅ |
| GitHub Actions | ✅ |
| 自定义域名 | ⬜ |

---

希望这篇文章能帮助你搭建自己的技术博客。如果有任何问题，欢迎在评论区讨论！
