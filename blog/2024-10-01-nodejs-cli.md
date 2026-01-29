---
slug: nodejs-cli
title: Node.js 命令行工具开发指南
authors: mason
tags: [Node.js, CLI, 工具]
---

开发命令行工具能够自动化重复工作，提升效率。本文介绍如何使用 Node.js 开发 CLI 工具。

<!--truncate-->

## 🎯 快速开始

### 项目初始化

```bash
mkdir my-cli && cd my-cli
npm init -y
```

### 项目结构

```
my-cli/
├── package.json
├── bin/
│   └── cli.js          # 入口文件
├── src/
│   ├── commands/       # 命令实现
│   │   ├── init.js
│   │   └── build.js
│   ├── utils/          # 工具函数
│   │   └── logger.js
│   └── index.js
└── README.md
```

### package.json 配置

```json
{
  "name": "my-cli",
  "version": "1.0.0",
  "bin": {
    "mycli": "./bin/cli.js"
  },
  "type": "module",
  "scripts": {
    "dev": "node bin/cli.js"
  },
  "dependencies": {
    "commander": "^11.0.0",
    "chalk": "^5.3.0",
    "inquirer": "^9.2.0",
    "ora": "^7.0.0"
  }
}
```

### 入口文件

```javascript
#!/usr/bin/env node
// bin/cli.js

import { program } from 'commander';
import { init } from '../src/commands/init.js';
import { build } from '../src/commands/build.js';

program
  .name('mycli')
  .description('My awesome CLI tool')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize a new project')
  .option('-t, --template <template>', 'Template to use', 'default')
  .action(init);

program
  .command('build')
  .description('Build the project')
  .option('-w, --watch', 'Watch mode')
  .option('-o, --output <dir>', 'Output directory', 'dist')
  .action(build);

program.parse();
```

---

## 📦 常用库

| 库 | 用途 | 说明 |
|---|------|------|
| **commander** | 命令解析 | 定义命令和参数 |
| **inquirer** | 交互式问答 | 用户输入 |
| **chalk** | 彩色输出 | 美化终端显示 |
| **ora** | 加载动画 | 进度提示 |
| **fs-extra** | 文件操作 | 增强版 fs |
| **execa** | 执行命令 | 运行 shell 命令 |
| **glob** | 文件匹配 | 匹配文件模式 |

---

## 🎨 终端样式

### Chalk 彩色输出

```javascript
import chalk from 'chalk';

// 基础颜色
console.log(chalk.red('Error!'));
console.log(chalk.green('Success!'));
console.log(chalk.yellow('Warning!'));
console.log(chalk.blue('Info'));

// 样式
console.log(chalk.bold('Bold text'));
console.log(chalk.italic('Italic text'));
console.log(chalk.underline('Underlined'));

// 背景色
console.log(chalk.bgRed.white('Error'));
console.log(chalk.bgGreen.black('Success'));

// 组合
console.log(chalk.red.bold.underline('Important!'));

// 模板字符串
console.log(`
  ${chalk.green('✓')} Step 1 completed
  ${chalk.green('✓')} Step 2 completed
  ${chalk.yellow('○')} Step 3 in progress
`);
```

### Ora 加载动画

```javascript
import ora from 'ora';

const spinner = ora('Loading...').start();

// 更新文本
spinner.text = 'Installing dependencies...';

// 成功
spinner.succeed('Done!');

// 失败
spinner.fail('Error occurred');

// 警告
spinner.warn('Something might be wrong');

// 信息
spinner.info('Completed with notes');

// 停止
spinner.stop();

// 实际使用
async function installDeps() {
  const spinner = ora('Installing dependencies...').start();
  
  try {
    await runInstall();
    spinner.succeed('Dependencies installed');
  } catch (error) {
    spinner.fail('Failed to install dependencies');
    console.error(error);
  }
}
```

---

## 💬 交互式问答

### Inquirer 基本用法

```javascript
import inquirer from 'inquirer';

// 文本输入
const { name } = await inquirer.prompt([
  {
    type: 'input',
    name: 'name',
    message: 'Project name:',
    default: 'my-project',
    validate: (input) => input.length > 0 || 'Name is required',
  }
]);

// 单选
const { framework } = await inquirer.prompt([
  {
    type: 'list',
    name: 'framework',
    message: 'Select a framework:',
    choices: ['React', 'Vue', 'Angular', 'Svelte'],
  }
]);

// 多选
const { features } = await inquirer.prompt([
  {
    type: 'checkbox',
    name: 'features',
    message: 'Select features:',
    choices: [
      { name: 'TypeScript', value: 'ts', checked: true },
      { name: 'ESLint', value: 'eslint' },
      { name: 'Prettier', value: 'prettier' },
      { name: 'Testing', value: 'test' },
    ],
  }
]);

// 确认
const { confirmed } = await inquirer.prompt([
  {
    type: 'confirm',
    name: 'confirmed',
    message: 'Are you sure?',
    default: false,
  }
]);

// 密码
const { password } = await inquirer.prompt([
  {
    type: 'password',
    name: 'password',
    message: 'Enter password:',
    mask: '*',
  }
]);
```

### 条件问题

```javascript
const answers = await inquirer.prompt([
  {
    type: 'confirm',
    name: 'useTypeScript',
    message: 'Use TypeScript?',
  },
  {
    type: 'confirm',
    name: 'strict',
    message: 'Enable strict mode?',
    when: (answers) => answers.useTypeScript, // 条件显示
  }
]);
```

---

## 📁 文件操作

### fs-extra

```javascript
import fs from 'fs-extra';

// 复制文件/目录
await fs.copy('src', 'dist');

// 确保目录存在
await fs.ensureDir('dist/assets');

// 写入 JSON
await fs.writeJson('config.json', { name: 'my-app' }, { spaces: 2 });

// 读取 JSON
const config = await fs.readJson('config.json');

// 移动
await fs.move('old-path', 'new-path');

// 删除
await fs.remove('dist');

// 检查存在
const exists = await fs.pathExists('file.txt');
```

### 模板文件处理

```javascript
import fs from 'fs-extra';
import path from 'path';

async function copyTemplate(templateDir, targetDir, variables) {
  const files = await fs.readdir(templateDir);

  for (const file of files) {
    const srcPath = path.join(templateDir, file);
    const destPath = path.join(targetDir, file);
    const stat = await fs.stat(srcPath);

    if (stat.isDirectory()) {
      await fs.ensureDir(destPath);
      await copyTemplate(srcPath, destPath, variables);
    } else {
      // 读取并替换变量
      let content = await fs.readFile(srcPath, 'utf-8');
      
      for (const [key, value] of Object.entries(variables)) {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }

      await fs.writeFile(destPath, content);
    }
  }
}
```

---

## 🔧 执行命令

### Execa

```javascript
import { execa, $ } from 'execa';

// 基本用法
const { stdout } = await execa('npm', ['--version']);
console.log('npm version:', stdout);

// 简写语法
const result = await $`npm install lodash`;

// 流式输出
await execa('npm', ['install'], { stdio: 'inherit' });

// 捕获错误
try {
  await execa('npm', ['run', 'build']);
} catch (error) {
  console.error('Build failed:', error.stderr);
  process.exit(1);
}

// 在特定目录执行
await execa('npm', ['install'], { cwd: './project' });

// 环境变量
await execa('npm', ['start'], {
  env: { NODE_ENV: 'production' }
});
```

---

## 🏗️ 完整示例

### init 命令

```javascript
// src/commands/init.js
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { execa } from 'execa';

export async function init(options) {
  console.log(chalk.blue('\n🚀 Create a new project\n'));

  // 1. 收集信息
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Project name:',
      default: 'my-project',
      validate: (input) => {
        if (!/^[a-z0-9-]+$/.test(input)) {
          return 'Name can only contain lowercase letters, numbers, and hyphens';
        }
        return true;
      },
    },
    {
      type: 'list',
      name: 'template',
      message: 'Select a template:',
      choices: ['react', 'vue', 'vanilla'],
      default: options.template,
    },
    {
      type: 'checkbox',
      name: 'features',
      message: 'Select features:',
      choices: [
        { name: 'TypeScript', value: 'typescript', checked: true },
        { name: 'ESLint', value: 'eslint' },
        { name: 'Prettier', value: 'prettier' },
      ],
    },
  ]);

  const projectDir = path.resolve(process.cwd(), answers.name);

  // 2. 检查目录
  if (await fs.pathExists(projectDir)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `Directory ${answers.name} already exists. Overwrite?`,
        default: false,
      },
    ]);

    if (!overwrite) {
      console.log(chalk.yellow('Cancelled'));
      return;
    }
    await fs.remove(projectDir);
  }

  // 3. 创建项目
  const spinner = ora('Creating project...').start();

  try {
    await fs.ensureDir(projectDir);

    // 复制模板
    const templateDir = path.join(__dirname, '..', 'templates', answers.template);
    await fs.copy(templateDir, projectDir);

    // 更新 package.json
    const pkgPath = path.join(projectDir, 'package.json');
    const pkg = await fs.readJson(pkgPath);
    pkg.name = answers.name;
    await fs.writeJson(pkgPath, pkg, { spaces: 2 });

    spinner.succeed('Project created');

    // 4. 安装依赖
    spinner.start('Installing dependencies...');
    await execa('npm', ['install'], { cwd: projectDir });
    spinner.succeed('Dependencies installed');

    // 5. 完成
    console.log(chalk.green('\n✨ Done! Now run:\n'));
    console.log(chalk.cyan(`  cd ${answers.name}`));
    console.log(chalk.cyan('  npm run dev\n'));
  } catch (error) {
    spinner.fail('Failed to create project');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}
```

---

## 📦 发布

### 本地测试

```bash
# 链接到全局
npm link

# 测试命令
mycli --help
mycli init

# 取消链接
npm unlink
```

### 发布到 npm

```bash
# 登录
npm login

# 发布
npm publish

# 发布 scoped 包
npm publish --access public
```

---

## 📋 最佳实践

```markdown
1. 提供 --help 和 --version
2. 使用彩色输出区分信息类型
3. 显示进度和加载状态
4. 处理错误并给出有用信息
5. 支持配置文件
6. 添加 --verbose 和 --quiet 选项
7. 编写清晰的文档
```

---

CLI 工具能够大幅提升工作效率。从简单的脚本开始，逐步完善功能。
