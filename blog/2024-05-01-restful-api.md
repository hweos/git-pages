---
slug: restful-api-design
title: RESTful API 设计规范与最佳实践
authors: mason
tags: [API, 后端, 架构]
---

设计良好的 API 是后端开发的基础。本文总结 RESTful API 的设计规范和最佳实践。

<!--truncate-->

## 🎯 REST 核心原则

| 原则 | 说明 |
|------|------|
| 资源导向 | 以资源为中心，而非操作 |
| 统一接口 | 使用标准 HTTP 方法 |
| 无状态 | 每个请求包含所有必要信息 |
| 可缓存 | 合理使用 HTTP 缓存 |

---

## 📝 URL 设计规范

### 使用名词，不用动词

```bash
# ✅ 正确
GET /users
GET /users/123
POST /users
PUT /users/123
DELETE /users/123

# ❌ 错误
GET /getUsers
POST /createUser
POST /deleteUser
```

### 使用复数形式

```bash
# ✅ 正确
GET /users
GET /articles
GET /comments

# ❌ 错误
GET /user
GET /article
```

### 资源嵌套

```bash
# 获取用户的文章
GET /users/123/articles

# 获取文章的评论
GET /articles/456/comments

# 不超过 2 层嵌套
GET /users/123/articles/456/comments  # ❌ 太深
GET /articles/456/comments            # ✅ 更清晰
```

### URL 命名规范

```bash
# 使用小写字母
GET /user-profiles    # ✅ kebab-case
GET /userProfiles     # ❌ camelCase
GET /user_profiles    # ⚠️ snake_case (可接受)

# 不包含文件扩展名
GET /users            # ✅
GET /users.json       # ❌
```

---

## 🔧 HTTP 方法

| 方法 | 用途 | 幂等性 | 安全性 |
|------|------|--------|--------|
| GET | 获取资源 | ✅ | ✅ |
| POST | 创建资源 | ❌ | ❌ |
| PUT | 全量更新 | ✅ | ❌ |
| PATCH | 部分更新 | ❌ | ❌ |
| DELETE | 删除资源 | ✅ | ❌ |

### 示例

```bash
# 获取所有用户
GET /users

# 获取单个用户
GET /users/123

# 创建用户
POST /users
Body: { "name": "John", "email": "john@example.com" }

# 全量更新用户
PUT /users/123
Body: { "name": "John", "email": "john@new.com", "age": 30 }

# 部分更新用户
PATCH /users/123
Body: { "email": "john@updated.com" }

# 删除用户
DELETE /users/123
```

---

## 📊 状态码

### 成功响应

| 状态码 | 含义 | 使用场景 |
|--------|------|---------|
| 200 | OK | GET、PUT、PATCH 成功 |
| 201 | Created | POST 创建成功 |
| 204 | No Content | DELETE 成功 |

### 客户端错误

| 状态码 | 含义 | 使用场景 |
|--------|------|---------|
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证 |
| 403 | Forbidden | 无权限 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突 |
| 422 | Unprocessable | 验证失败 |
| 429 | Too Many Requests | 限流 |

### 服务端错误

| 状态码 | 含义 | 使用场景 |
|--------|------|---------|
| 500 | Internal Error | 服务器错误 |
| 502 | Bad Gateway | 网关错误 |
| 503 | Service Unavailable | 服务不可用 |

---

## 📦 响应格式

### 成功响应

```json
// 单个资源
{
  "data": {
    "id": 123,
    "name": "John",
    "email": "john@example.com"
  }
}

// 列表资源
{
  "data": [
    { "id": 1, "name": "John" },
    { "id": 2, "name": "Jane" }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "per_page": 20,
    "total_pages": 5
  }
}
```

### 错误响应

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

---

## 🔍 查询参数

### 分页

```bash
GET /users?page=2&per_page=20
GET /users?offset=20&limit=20
```

### 排序

```bash
GET /users?sort=created_at         # 升序
GET /users?sort=-created_at        # 降序
GET /users?sort=name,-created_at   # 多字段
```

### 过滤

```bash
GET /users?status=active
GET /users?role=admin&status=active
GET /users?created_at[gte]=2024-01-01
```

### 字段选择

```bash
GET /users?fields=id,name,email
```

### 搜索

```bash
GET /users?q=john
GET /users?search=john
```

---

## 🔐 认证与授权

### JWT Token

```bash
# 请求头
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### API Key

```bash
# 请求头
X-API-Key: your-api-key

# 查询参数 (不推荐)
GET /users?api_key=your-api-key
```

---

## 📌 版本控制

### URL 路径 (推荐)

```bash
GET /v1/users
GET /v2/users
```

### 请求头

```bash
Accept: application/vnd.api+json; version=1
X-API-Version: 1
```

### 查询参数

```bash
GET /users?version=1
```

---

## 🚦 限流

### 响应头

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

### 限流响应

```json
// HTTP 429 Too Many Requests
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "retry_after": 60
  }
}
```

---

## 📄 文档规范

### OpenAPI/Swagger

```yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0
paths:
  /users:
    get:
      summary: Get all users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: Success
```

### 推荐工具

| 工具 | 用途 |
|------|------|
| Swagger UI | API 文档展示 |
| Postman | API 测试 |
| Insomnia | API 测试 |
| Stoplight | API 设计 |

---

## ✅ 设计清单

- [ ] URL 使用名词复数
- [ ] 正确使用 HTTP 方法
- [ ] 返回合适的状态码
- [ ] 统一的响应格式
- [ ] 分页、排序、过滤
- [ ] 版本控制
- [ ] 错误处理规范
- [ ] 认证授权机制
- [ ] 限流保护
- [ ] 完善的文档

---

好的 API 设计能让前后端协作更顺畅，也能降低维护成本。多参考成熟的 API 设计，如 GitHub API、Stripe API。
