---
slug: git-workflow
title: Git 工作流最佳实践
authors: mason
tags: [Git, 团队协作, 工作流]
---

一个好的 Git 工作流能让团队协作更加顺畅。本文分享我在团队中实践的 Git 工作流和规范。

<!--truncate-->

## 🌿 分支策略

### 推荐：GitHub Flow（简化版）

适合持续部署的项目，简单高效：

```
main ─────●─────●─────●─────●─────●────→
           \         /     \     /
feature-A   ●───●───●       \   /
                             \ /
feature-B           ●─────●───●
```

**核心规则**：
1. `main` 分支始终可部署
2. 新功能从 `main` 创建分支
3. 通过 Pull Request 合并
4. 合并后立即部署

### 分支命名规范

```bash
# 功能开发
feature/user-login
feature/shopping-cart

# Bug 修复
fix/login-error
fix/payment-timeout

# 热修复
hotfix/security-patch

# 重构
refactor/api-layer

# 文档
docs/api-documentation
```

---

## 📝 Commit 规范

### Conventional Commits

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 常用 Type

| Type | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | feat: 添加用户登录功能 |
| `fix` | Bug 修复 | fix: 修复登录按钮点击无响应 |
| `docs` | 文档更新 | docs: 更新 API 文档 |
| `style` | 代码格式 | style: 格式化代码 |
| `refactor` | 重构 | refactor: 重构用户模块 |
| `perf` | 性能优化 | perf: 优化列表渲染性能 |
| `test` | 测试相关 | test: 添加登录单元测试 |
| `chore` | 构建/工具 | chore: 升级依赖版本 |

### 好的 Commit Message

```bash
# ✅ 好的示例
feat(auth): 实现 JWT 登录认证

- 添加 login/logout API
- 集成 JWT token 验证
- 添加登录状态持久化

Closes #123

# ❌ 不好的示例
fix bug
update code
WIP
asdfgh
```

### 配置 Commitlint

```bash
npm install -D @commitlint/cli @commitlint/config-conventional
```

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [0],  // 允许中文
  },
};
```

---

## 🔄 工作流程

### 1. 开始新功能

```bash
# 确保 main 是最新的
git checkout main
git pull origin main

# 创建功能分支
git checkout -b feature/new-feature
```

### 2. 开发过程

```bash
# 小步提交
git add .
git commit -m "feat: 完成用户表单验证"

# 定期同步 main
git fetch origin
git rebase origin/main
```

### 3. 准备合并

```bash
# 整理提交历史（可选）
git rebase -i HEAD~3

# 推送分支
git push origin feature/new-feature -u
```

### 4. 创建 Pull Request

- 填写清晰的描述
- 关联相关 Issue
- 请求 Code Review
- 确保 CI 通过

### 5. 合并后清理

```bash
# 删除本地分支
git branch -d feature/new-feature

# 删除远程分支（如果需要）
git push origin --delete feature/new-feature
```

---

## 🔍 Code Review 实践

### 作为提交者

1. **自我 Review** - 提交前先自己检查一遍
2. **小而专注** - 每个 PR 只做一件事
3. **清晰描述** - 说明改了什么、为什么改
4. **测试覆盖** - 确保有测试或手动测试过

### 作为审查者

1. **及时响应** - 24 小时内完成 Review
2. **建设性反馈** - 指出问题并给出建议
3. **区分优先级** - 必须改 vs 建议改
4. **认可好代码** - 看到好的设计要表扬

### Review 评论模板

```markdown
# 必须修改
🔴 **必须**: 这里有空指针风险，需要添加判空

# 建议修改
🟡 **建议**: 这个函数可以抽取成独立方法

# 疑问
🔵 **疑问**: 这里为什么用 forEach 而不是 map？

# 认可
✅ **Nice**: 这个封装很优雅！
```

---

## 🛠 常用 Git 命令

### 日常操作

```bash
# 查看状态
git status
git log --oneline -10

# 暂存更改
git stash
git stash pop
git stash list

# 撤销更改
git checkout -- <file>      # 撤销工作区修改
git reset HEAD <file>       # 取消暂存
git reset --soft HEAD~1     # 撤销最近一次提交（保留更改）
git reset --hard HEAD~1     # 撤销最近一次提交（丢弃更改）
```

### 分支操作

```bash
# 查看分支
git branch -a

# 切换分支
git checkout <branch>
git switch <branch>         # Git 2.23+

# 创建并切换
git checkout -b <branch>
git switch -c <branch>

# 删除分支
git branch -d <branch>      # 安全删除
git branch -D <branch>      # 强制删除
```

### 合并操作

```bash
# 合并分支
git merge <branch>

# 变基
git rebase <branch>
git rebase -i HEAD~3        # 交互式变基

# 解决冲突后
git add .
git rebase --continue
# 或
git merge --continue
```

### 远程操作

```bash
# 查看远程
git remote -v

# 拉取更新
git fetch origin
git pull origin main

# 推送
git push origin <branch>
git push -u origin <branch>  # 设置上游
git push --force-with-lease  # 安全强制推送
```

---

## ⚠️ 常见问题处理

### 1. 不小心提交到了错误分支

```bash
# 方法1：cherry-pick
git checkout correct-branch
git cherry-pick <commit-hash>
git checkout wrong-branch
git reset --hard HEAD~1

# 方法2：创建新分支保存更改
git branch new-branch
git reset --hard HEAD~1
```

### 2. 需要修改最近的 commit message

```bash
git commit --amend -m "新的提交信息"
```

### 3. 合并冲突

```bash
# 1. 查看冲突文件
git status

# 2. 手动解决冲突（编辑文件）

# 3. 标记为已解决
git add <resolved-files>

# 4. 继续操作
git merge --continue
# 或
git rebase --continue
```

### 4. 恢复删除的分支

```bash
# 查看历史
git reflog

# 恢复分支
git checkout -b <branch-name> <commit-hash>
```

---

## 📋 团队规范检查清单

| 规范项 | 说明 |
|--------|------|
| ✅ 统一分支命名 | feature/、fix/、hotfix/ |
| ✅ Commit 规范 | Conventional Commits |
| ✅ PR 模板 | 标准化的描述格式 |
| ✅ Code Review | 必须至少 1 人审核 |
| ✅ CI 检查 | 自动运行测试和 lint |
| ✅ 保护主分支 | 禁止直接 push 到 main |

---

好的 Git 工作流不是一成不变的，需要根据团队规模和项目特点来调整。最重要的是团队达成共识并坚持执行。

你们团队使用什么 Git 工作流？欢迎分享你的经验！
