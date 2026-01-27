---
slug: vscode-setup
title: VSCode 高效开发配置指南
authors: mason
tags: [VSCode, 工具, 效率]
---

工欲善其事，必先利其器。本文分享我的 VSCode 配置，帮助你打造高效的开发环境。

<!--truncate-->

## 🎨 主题与外观

### 推荐主题

| 主题 | 特点 |
|------|------|
| **One Dark Pro** | 经典暗色主题 |
| **GitHub Theme** | GitHub 风格 |
| **Dracula** | 高对比度暗色 |
| **Catppuccin** | 柔和的暗色系 |

### 推荐图标

- **Material Icon Theme** - 丰富的文件图标
- **vscode-icons** - 另一个优秀选择

### 字体推荐

```json
{
  "editor.fontFamily": "JetBrains Mono, Fira Code, Consolas",
  "editor.fontLigatures": true,
  "editor.fontSize": 14,
  "editor.lineHeight": 1.6
}
```

---

## 🔌 必装插件

### 通用开发

| 插件 | 功能 |
|------|------|
| **ESLint** | JavaScript/TypeScript 代码检查 |
| **Prettier** | 代码格式化 |
| **GitLens** | Git 增强，查看代码历史 |
| **Error Lens** | 行内显示错误信息 |
| **Path Intellisense** | 路径自动补全 |
| **Auto Rename Tag** | 自动重命名配对标签 |

### 前端开发

| 插件 | 功能 |
|------|------|
| **ES7+ React Snippets** | React 代码片段 |
| **Tailwind CSS IntelliSense** | Tailwind 智能提示 |
| **CSS Peek** | CSS 定义跳转 |
| **Import Cost** | 显示导入包大小 |
| **Console Ninja** | 控制台日志增强 |

### 效率提升

| 插件 | 功能 |
|------|------|
| **GitHub Copilot** | AI 代码补全 |
| **Code Spell Checker** | 拼写检查 |
| **Todo Tree** | TODO 注释管理 |
| **Bookmarks** | 代码书签 |
| **Project Manager** | 项目快速切换 |

---

## ⚙️ 核心配置

### settings.json

```json
{
  // 编辑器
  "editor.fontSize": 14,
  "editor.tabSize": 2,
  "editor.wordWrap": "on",
  "editor.minimap.enabled": false,
  "editor.cursorBlinking": "smooth",
  "editor.cursorSmoothCaretAnimation": "on",
  "editor.smoothScrolling": true,
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": "active",
  "editor.stickyScroll.enabled": true,
  
  // 保存时格式化
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  
  // 文件
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  
  // 终端
  "terminal.integrated.fontSize": 13,
  "terminal.integrated.cursorStyle": "line",
  
  // 搜索
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true
  },
  
  // Git
  "git.autofetch": true,
  "git.confirmSync": false,
  "git.enableSmartCommit": true
}
```

### 语言特定配置

```json
{
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[markdown]": {
    "editor.wordWrap": "on",
    "editor.quickSuggestions": false
  }
}
```

---

## ⌨️ 常用快捷键

### 基础操作

| 快捷键 | 功能 |
|--------|------|
| `Cmd/Ctrl + P` | 快速打开文件 |
| `Cmd/Ctrl + Shift + P` | 命令面板 |
| `Cmd/Ctrl + B` | 切换侧边栏 |
| `Cmd/Ctrl + J` | 切换终端 |
| `Cmd/Ctrl + \`` | 新建终端 |

### 编辑操作

| 快捷键 | 功能 |
|--------|------|
| `Cmd/Ctrl + D` | 选中下一个相同词 |
| `Cmd/Ctrl + Shift + L` | 选中所有相同词 |
| `Alt + ↑/↓` | 移动当前行 |
| `Alt + Shift + ↑/↓` | 复制当前行 |
| `Cmd/Ctrl + Shift + K` | 删除当前行 |
| `Cmd/Ctrl + /` | 切换注释 |
| `Cmd/Ctrl + Shift + [/]` | 折叠/展开代码块 |

### 导航

| 快捷键 | 功能 |
|--------|------|
| `Cmd/Ctrl + G` | 跳转到指定行 |
| `Cmd/Ctrl + Shift + O` | 跳转到符号 |
| `F12` | 跳转到定义 |
| `Shift + F12` | 查看引用 |
| `Cmd/Ctrl + -` | 返回上一个位置 |

### 多光标

| 快捷键 | 功能 |
|--------|------|
| `Alt + Click` | 添加光标 |
| `Cmd/Ctrl + Alt + ↑/↓` | 上下添加光标 |
| `Cmd/Ctrl + Shift + L` | 所有匹配项添加光标 |

---

## 📝 代码片段

### 自定义 Snippets

```json
// .vscode/snippets.code-snippets
{
  "React Functional Component": {
    "prefix": "rfc",
    "body": [
      "interface ${1:$TM_FILENAME_BASE}Props {",
      "  $2",
      "}",
      "",
      "export default function ${1:$TM_FILENAME_BASE}({ $3 }: ${1:$TM_FILENAME_BASE}Props) {",
      "  return (",
      "    <div>",
      "      $0",
      "    </div>",
      "  );",
      "}"
    ]
  },
  "Console Log": {
    "prefix": "cl",
    "body": "console.log('$1:', $1);$0"
  },
  "useState Hook": {
    "prefix": "us",
    "body": "const [$1, set${1/(.*)/${1:/capitalize}/}] = useState($2);$0"
  },
  "useEffect Hook": {
    "prefix": "ue",
    "body": [
      "useEffect(() => {",
      "  $1",
      "}, [$0]);"
    ]
  }
}
```

---

## 🔧 工作区配置

### .vscode/settings.json

针对项目的配置：

```json
{
  "editor.tabSize": 2,
  "editor.formatOnSave": true,
  "typescript.preferences.importModuleSpecifier": "relative",
  "files.exclude": {
    "**/.git": true,
    "**/node_modules": true
  }
}
```

### .vscode/extensions.json

推荐团队安装的插件：

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss"
  ]
}
```

### .vscode/launch.json

调试配置：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Chrome",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src"
    },
    {
      "name": "Debug Node",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/index.js"
    }
  ]
}
```

---

## 💡 效率技巧

### 1. 命令面板万能键

`Cmd/Ctrl + Shift + P` 可以执行几乎所有操作：

- `>Reload Window` - 重载窗口
- `>Format Document` - 格式化文档
- `>Transform to Uppercase` - 转大写
- `>Sort Lines Ascending` - 行排序

### 2. Emmet 快速编写 HTML

```
div.container>ul>li*3>a[href="#"]
```

生成：

```html
<div class="container">
  <ul>
    <li><a href="#"></a></li>
    <li><a href="#"></a></li>
    <li><a href="#"></a></li>
  </ul>
</div>
```

### 3. 多文件搜索替换

1. `Cmd/Ctrl + Shift + H` 打开搜索替换
2. 输入搜索内容和替换内容
3. 可以使用正则表达式
4. 预览后批量替换

### 4. 文件对比

```bash
# 命令行打开对比
code --diff file1.js file2.js
```

或在 VSCode 中：
1. 选中两个文件
2. 右键选择 "Compare Selected"

### 5. 终端分屏

- `Cmd/Ctrl + \` 在终端中新建分屏
- 可以同时运行多个命令

---

## 📋 配置同步

### 使用内置同步

1. 登录 GitHub/Microsoft 账号
2. 打开 Settings Sync
3. 选择要同步的内容

### 手动导出配置

```bash
# 导出插件列表
code --list-extensions > extensions.txt

# 批量安装
cat extensions.txt | xargs -L 1 code --install-extension
```

---

好的工具配置能大幅提升开发效率。花一点时间优化你的开发环境，长期来看是非常值得的投资。

你有什么独特的 VSCode 配置技巧吗？欢迎在评论区分享！
