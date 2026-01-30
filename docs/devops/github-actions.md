# GitHub Actions 入门

GitHub Actions 是 GitHub 提供的 CI/CD 平台，可以自动化构建、测试和部署。

## 核心概念

| 概念 | 说明 |
|------|------|
| Workflow | 自动化流程，定义在 `.github/workflows/*.yml` |
| Event | 触发 Workflow 的事件（push、PR、定时等） |
| Job | 一组步骤，运行在同一个 Runner 上 |
| Step | Job 中的单个任务 |
| Action | 可复用的操作单元 |
| Runner | 执行 Job 的服务器 |

## 快速开始

### 第一个 Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
```

## 触发器 (Events)

### 常用触发器

```yaml
on:
  # 推送时触发
  push:
    branches:
      - main
      - 'release/**'
    paths:
      - 'src/**'
      - 'package.json'
    paths-ignore:
      - '**.md'
      - 'docs/**'
  
  # PR 时触发
  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened]
  
  # 定时触发 (cron)
  schedule:
    - cron: '0 2 * * *'  # 每天 UTC 2:00
  
  # 手动触发
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deploy environment'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production
  
  # 发布时触发
  release:
    types: [published]
  
  # 其他 workflow 完成后触发
  workflow_run:
    workflows: [Build]
    types: [completed]
```

### 路径过滤

```yaml
on:
  push:
    paths:
      - 'src/**'
      - 'package.json'
    paths-ignore:
      - '**.md'
```

## Jobs 配置

### 基本配置

```yaml
jobs:
  build:
    name: Build Application
    runs-on: ubuntu-latest
    timeout-minutes: 10
    
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
```

### 矩阵策略

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: [18, 20, 22]
        exclude:
          - os: windows-latest
            node: 18
        include:
          - os: ubuntu-latest
            node: 20
            coverage: true
      fail-fast: false
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
      - run: npm test
      - if: matrix.coverage
        run: npm run coverage
```

### 条件执行

```yaml
jobs:
  deploy:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying..."
  
  notify:
    needs: deploy
    if: always() && needs.deploy.result == 'failure'
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploy failed, sending notification..."
```

### Job 依赖

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: npm run build
  
  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: npm test
  
  deploy:
    needs: [build, test]
    runs-on: ubuntu-latest
    steps:
      - run: npm run deploy
```

### Job 输出

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.value }}
    steps:
      - id: version
        run: echo "value=$(node -p "require('./package.json').version")" >> $GITHUB_OUTPUT
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying version ${{ needs.build.outputs.version }}"
```

## 常用 Actions

### Checkout

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0  # 获取完整历史
    token: ${{ secrets.PAT }}  # 使用 PAT 访问私有仓库
```

### Setup Node.js

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    node-version-file: '.nvmrc'  # 或从文件读取
    cache: 'npm'  # 或 'pnpm', 'yarn'
    registry-url: 'https://npm.pkg.github.com'
```

### 缓存

```yaml
- uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### 上传/下载制品

```yaml
# 上传
- uses: actions/upload-artifact@v4
  with:
    name: build-output
    path: dist/
    retention-days: 7

# 下载
- uses: actions/download-artifact@v4
  with:
    name: build-output
    path: dist/
```

## Secrets 管理

### 设置 Secrets

在仓库 Settings → Secrets and variables → Actions 中添加。

### 使用 Secrets

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        run: ./deploy.sh
        env:
          API_KEY: ${{ secrets.API_KEY }}
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

### 环境 Secrets

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # 使用 production 环境的 secrets
    steps:
      - run: echo "Deploying to ${{ vars.DEPLOY_URL }}"
```

## 实战示例

### 完整 CI 流程

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  e2e:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

### 自动部署到 Vercel

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Docker 构建并推送

```yaml
name: Docker

on:
  push:
    tags: ['v*']

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: myuser/myapp
          tags: |
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### SSH 部署

```yaml
name: Deploy via SSH

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/myapp
            git pull origin main
            npm ci
            npm run build
            pm2 restart myapp
```

### 发布 npm 包

```yaml
name: Publish

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      
      - run: npm ci
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 最佳实践

### 1. 使用固定版本

```yaml
# ✅ 使用具体版本
- uses: actions/checkout@v4
- uses: actions/setup-node@v4

# ❌ 避免
- uses: actions/checkout@main
```

### 2. 并行执行

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps: ...
  
  test:
    runs-on: ubuntu-latest
    steps: ...
  
  build:
    runs-on: ubuntu-latest
    steps: ...

  # lint, test, build 并行执行
  deploy:
    needs: [lint, test, build]
    steps: ...
```

### 3. 复用 Workflow

```yaml
# .github/workflows/reusable.yml
name: Reusable Build

on:
  workflow_call:
    inputs:
      node-version:
        required: false
        type: string
        default: '20'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
      - run: npm ci && npm run build
```

```yaml
# 调用可复用 workflow
jobs:
  build:
    uses: ./.github/workflows/reusable.yml
    with:
      node-version: '20'
```

### 4. 超时设置

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - run: npm test
        timeout-minutes: 5
```

## 调试技巧

### 启用调试日志

在 Secrets 中添加：
- `ACTIONS_STEP_DEBUG`: `true`
- `ACTIONS_RUNNER_DEBUG`: `true`

### 使用 tmate 调试

```yaml
- name: Setup tmate session
  if: failure()
  uses: mxschmitt/action-tmate@v3
  timeout-minutes: 15
```

## 总结

| 功能 | 配置 |
|------|------|
| 触发器 | `on: push/pull_request/schedule/workflow_dispatch` |
| 矩阵构建 | `strategy.matrix` |
| 条件执行 | `if: github.ref == 'refs/heads/main'` |
| 依赖关系 | `needs: [job1, job2]` |
| 缓存 | `actions/cache@v4` |
| Secrets | `${{ secrets.NAME }}` |
| 环境变量 | `env: KEY: value` |
| 制品 | `actions/upload-artifact@v4` |
