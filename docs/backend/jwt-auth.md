# JWT 认证实现

JWT (JSON Web Token) 是无状态的认证方案，适合分布式系统和 API 认证。

## JWT 结构

```
Header.Payload.Signature

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4ifQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### Header

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### Payload

```json
{
  "sub": "1234567890",    // Subject (用户ID)
  "name": "John Doe",
  "iat": 1516239022,      // Issued At
  "exp": 1516242622       // Expiration
}
```

### Signature

```javascript
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

## Node.js 实现

### 安装

```bash
npm install jsonwebtoken bcrypt
```

### 生成和验证 Token

```javascript
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';

// 生成 Access Token
function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES }
  );
}

// 生成 Refresh Token
function generateRefreshToken(user) {
  return jwt.sign(
    { userId: user.id },
    SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES }
  );
}

// 验证 Token
function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
}
```

### 用户注册

```javascript
const bcrypt = require('bcrypt');

async function register(req, res) {
  const { email, password, name } = req.body;
  
  // 检查用户是否存在
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ error: 'Email already exists' });
  }
  
  // 加密密码
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // 创建用户
  const user = await User.create({
    email,
    password: hashedPassword,
    name,
  });
  
  // 生成 Token
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  // 存储 Refresh Token
  await RefreshToken.create({
    token: refreshToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  
  res.status(201).json({
    user: { id: user.id, email: user.email, name: user.name },
    accessToken,
    refreshToken,
  });
}
```

### 用户登录

```javascript
async function login(req, res) {
  const { email, password } = req.body;
  
  // 查找用户
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // 验证密码
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // 生成 Token
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  // 存储 Refresh Token
  await RefreshToken.create({
    token: refreshToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  
  res.json({
    user: { id: user.id, email: user.email, name: user.name },
    accessToken,
    refreshToken,
  });
}
```

### 刷新 Token

```javascript
async function refresh(req, res) {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }
  
  // 验证 Refresh Token
  const payload = verifyToken(refreshToken);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
  
  // 检查 Token 是否在数据库中
  const storedToken = await RefreshToken.findOne({
    token: refreshToken,
    userId: payload.userId,
  });
  
  if (!storedToken) {
    return res.status(401).json({ error: 'Refresh token not found' });
  }
  
  // 检查是否过期
  if (storedToken.expiresAt < new Date()) {
    await RefreshToken.deleteOne({ _id: storedToken._id });
    return res.status(401).json({ error: 'Refresh token expired' });
  }
  
  // 获取用户
  const user = await User.findById(payload.userId);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  
  // 生成新的 Token
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);
  
  // 更新 Refresh Token
  await RefreshToken.findByIdAndUpdate(storedToken._id, {
    token: newRefreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  
  res.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
}
```

### 登出

```javascript
async function logout(req, res) {
  const { refreshToken } = req.body;
  
  if (refreshToken) {
    await RefreshToken.deleteOne({ token: refreshToken });
  }
  
  res.json({ message: 'Logged out successfully' });
}

// 登出所有设备
async function logoutAll(req, res) {
  await RefreshToken.deleteMany({ userId: req.user.userId });
  res.json({ message: 'Logged out from all devices' });
}
```

## 中间件

### 认证中间件

```javascript
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  req.user = payload;
  next();
}

// 使用
app.get('/api/profile', authenticate, (req, res) => {
  res.json({ userId: req.user.userId });
});
```

### 权限中间件

```javascript
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}

// 使用
app.delete('/api/users/:id', authenticate, authorize('admin'), deleteUser);
app.put('/api/posts/:id', authenticate, authorize('admin', 'editor'), updatePost);
```

### 可选认证

```javascript
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }
  
  next();
}

// 使用 - 已登录用户看到更多内容
app.get('/api/posts', optionalAuth, (req, res) => {
  if (req.user) {
    // 返回完整内容
  } else {
    // 返回公开内容
  }
});
```

## 前端存储

### 存储方式对比

| 存储方式 | XSS 风险 | CSRF 风险 | 建议 |
|----------|----------|-----------|------|
| localStorage | 高 | 无 | 不推荐 |
| sessionStorage | 高 | 无 | 不推荐 |
| HttpOnly Cookie | 无 | 有 | 推荐 |
| 内存 | 低 | 无 | 短期存储 |

### HttpOnly Cookie 方案

```javascript
// 服务端 - 设置 Cookie
res.cookie('accessToken', accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000,  // 15分钟
});

res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api/auth/refresh',  // 只在刷新接口发送
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7天
});

// 中间件 - 从 Cookie 读取
function authenticate(req, res, next) {
  const token = req.cookies.accessToken;
  
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }
  
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  req.user = payload;
  next();
}
```

### 前端 Axios 拦截器

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,  // 发送 Cookie
});

// 响应拦截器 - 自动刷新 Token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await api.post('/auth/refresh');
        return api(originalRequest);
      } catch (refreshError) {
        // 刷新失败，跳转登录
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

## 安全最佳实践

### 1. 使用短期 Access Token

```javascript
const ACCESS_TOKEN_EXPIRES = '15m';  // 15分钟
const REFRESH_TOKEN_EXPIRES = '7d';  // 7天
```

### 2. 使用安全的 Secret

```javascript
// 生成安全密钥
const crypto = require('crypto');
const secret = crypto.randomBytes(64).toString('hex');

// 环境变量
JWT_SECRET=your-256-bit-secret
```

### 3. 验证 Token 内容

```javascript
function verifyToken(token) {
  try {
    const payload = jwt.verify(token, SECRET, {
      algorithms: ['HS256'],  // 限制算法
      issuer: 'your-app',     // 验证签发者
      audience: 'your-app',   // 验证受众
    });
    return payload;
  } catch (err) {
    return null;
  }
}
```

### 4. Token 黑名单

```javascript
// 登出时将 Token 加入黑名单
const blacklist = new Set();

async function logout(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    blacklist.add(token);
    // 或存入 Redis
    await redis.setex(`blacklist:${token}`, 3600, '1');
  }
  res.json({ message: 'Logged out' });
}

// 验证时检查黑名单
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (blacklist.has(token)) {
    return res.status(401).json({ error: 'Token revoked' });
  }
  
  // 验证 Token...
}
```

### 5. Refresh Token 轮换

每次刷新时生成新的 Refresh Token，旧的立即失效。

## 完整路由

```javascript
const express = require('express');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.post('/logout-all', authenticate, logoutAll);
router.get('/me', authenticate, getProfile);

module.exports = router;
```

## 总结

| 功能 | 实现 |
|------|------|
| 生成 Token | `jwt.sign()` |
| 验证 Token | `jwt.verify()` |
| 密码加密 | `bcrypt.hash()` |
| 密码验证 | `bcrypt.compare()` |
| Token 刷新 | Refresh Token 机制 |
| 安全存储 | HttpOnly Cookie |
| 权限控制 | 中间件检查 role |
