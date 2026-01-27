---
sidebar_position: 3
slug: frontend-engineering
title: 前端工程化配置
description: ESLint、Prettier、Husky 一站式配置指南
---

# 前端工程化配置

本文介绍如何配置 ESLint、Prettier 和 Husky，实现代码规范自动化。

## 🎯 目标

- ✅ 统一代码风格
- ✅ 自动修复格式问题
- ✅ 提交前自动检查
- ✅ 团队协作规范化

---

## 1. ESLint 配置

### 安装

```bash
npm install -D eslint @eslint/js typescript-eslint
```

### 配置文件 `eslint.config.js`

```javascript
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // 自定义规则
      'no-console': 'warn',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
    ignores: ['node_modules', 'dist', 'build'],
  }
);
```

### React 项目配置

```bash
npm install -D eslint-plugin-react eslint-plugin-react-hooks
```

```javascript
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  // ... 其他配置
  {
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
```

### 常用命令

```json
{
  "scripts": {
    "lint": "eslint src",
    "lint:fix": "eslint src --fix"
  }
}
```

---

## 2. Prettier 配置

### 安装

```bash
npm install -D prettier
```

### 配置文件 `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### 忽略文件 `.prettierignore`

```
node_modules
dist
build
*.min.js
package-lock.json
yarn.lock
```

### 常用命令

```json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,css,json}\"",
    "format:check": "prettier --check \"src/**/*.{js,jsx,ts,tsx,css,json}\""
  }
}
```

---

## 3. ESLint + Prettier 整合

### 安装

```bash
npm install -D eslint-config-prettier eslint-plugin-prettier
```

### 配置

```javascript
// eslint.config.js
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  // ... 其他配置
  prettierConfig,  // 关闭与 Prettier 冲突的规则
  {
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',  // Prettier 问题作为 ESLint 错误
    },
  },
];
```

---

## 4. Husky + lint-staged

### 安装

```bash
npm install -D husky lint-staged
npx husky init
```

### 配置 `.husky/pre-commit`

```bash
npx lint-staged
```

### 配置 `package.json`

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss,json,md}": [
      "prettier --write"
    ]
  }
}
```

### 添加 commit-msg 检查（可选）

```bash
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
npm install -D @commitlint/cli @commitlint/config-conventional
```

```javascript
// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
};
```

---

## 5. VS Code 配置

### `.vscode/settings.json`

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### `.vscode/extensions.json`

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

---

## 6. EditorConfig

### `.editorconfig`

```ini
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

---

## 📦 一键初始化脚本

```bash
#!/bin/bash

# 安装依赖
npm install -D eslint @eslint/js typescript-eslint \
  prettier eslint-config-prettier eslint-plugin-prettier \
  husky lint-staged

# 初始化 Husky
npx husky init
echo 'npx lint-staged' > .husky/pre-commit

# 创建配置文件
cat > .prettierrc << 'EOF'
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
EOF

echo "✅ 工程化配置完成！"
```

---

## 🔧 常见问题

### Q: ESLint 和 Prettier 冲突怎么办？

使用 `eslint-config-prettier` 关闭冲突的规则。

### Q: 保存时不自动格式化？

1. 检查 VS Code 是否安装了 Prettier 插件
2. 检查 `settings.json` 中 `editor.formatOnSave` 是否为 `true`
3. 检查是否有 `.prettierignore` 忽略了该文件

### Q: Husky 钩子不生效？

```bash
# 重新安装钩子
rm -rf .husky
npx husky init
echo 'npx lint-staged' > .husky/pre-commit
chmod +x .husky/pre-commit
```

---

## 📚 推荐资源

- [ESLint 官方文档](https://eslint.org/)
- [Prettier 官方文档](https://prettier.io/)
- [Husky 官方文档](https://typicode.github.io/husky/)
