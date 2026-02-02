# Redis 缓存实践

Redis 是高性能的内存数据库，常用于缓存、会话管理、消息队列等场景。

## 核心特点

- **内存存储** - 读写速度极快
- **数据持久化** - RDB 快照 / AOF 日志
- **丰富数据结构** - String、List、Hash、Set、Sorted Set
- **原子操作** - 支持事务和 Lua 脚本

## 安装与连接

### Docker 安装

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7-alpine \
  redis-server --requirepass yourpassword
```

### Node.js 连接

```bash
npm install ioredis
```

```javascript
const Redis = require('ioredis');

const redis = new Redis({
  host: 'localhost',
  port: 6379,
  password: 'yourpassword',
  db: 0,
});

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err));
```

## 数据类型

### String

```javascript
// 设置
await redis.set('name', 'Tom');
await redis.set('count', 0);

// 设置过期时间
await redis.set('token', 'abc123', 'EX', 3600);  // 1小时
await redis.setex('token', 3600, 'abc123');      // 等价写法

// 只在不存在时设置
await redis.setnx('lock', '1');

// 获取
const name = await redis.get('name');

// 数值操作
await redis.incr('count');      // +1
await redis.incrby('count', 5); // +5
await redis.decr('count');      // -1

// 批量操作
await redis.mset('a', '1', 'b', '2', 'c', '3');
const values = await redis.mget('a', 'b', 'c');
```

### Hash

```javascript
// 设置
await redis.hset('user:1', 'name', 'Tom');
await redis.hset('user:1', 'age', 25);
// 或
await redis.hset('user:1', { name: 'Tom', age: 25, email: 'tom@example.com' });

// 获取
const name = await redis.hget('user:1', 'name');
const user = await redis.hgetall('user:1');

// 判断存在
const exists = await redis.hexists('user:1', 'name');

// 删除字段
await redis.hdel('user:1', 'age');

// 数值操作
await redis.hincrby('user:1', 'age', 1);
```

### List

```javascript
// 添加元素
await redis.lpush('queue', 'task1', 'task2');  // 左边添加
await redis.rpush('queue', 'task3');           // 右边添加

// 获取元素
const first = await redis.lpop('queue');  // 左边弹出
const last = await redis.rpop('queue');   // 右边弹出
const all = await redis.lrange('queue', 0, -1);  // 获取范围

// 阻塞弹出（消息队列）
const [key, value] = await redis.blpop('queue', 5);  // 等待5秒

// 长度
const len = await redis.llen('queue');

// 修剪
await redis.ltrim('queue', 0, 99);  // 只保留前100个
```

### Set

```javascript
// 添加
await redis.sadd('tags', 'javascript', 'nodejs', 'redis');

// 获取所有
const tags = await redis.smembers('tags');

// 判断存在
const exists = await redis.sismember('tags', 'javascript');

// 删除
await redis.srem('tags', 'redis');

// 集合运算
await redis.sinter('tags1', 'tags2');  // 交集
await redis.sunion('tags1', 'tags2');  // 并集
await redis.sdiff('tags1', 'tags2');   // 差集

// 随机获取
const random = await redis.srandmember('tags', 2);

// 数量
const count = await redis.scard('tags');
```

### Sorted Set

```javascript
// 添加（带分数）
await redis.zadd('ranking', 100, 'user1', 90, 'user2', 80, 'user3');

// 获取排名（升序）
const rank = await redis.zrank('ranking', 'user1');

// 获取排名（降序）
const rank = await redis.zrevrank('ranking', 'user1');

// 按排名获取
const top10 = await redis.zrevrange('ranking', 0, 9, 'WITHSCORES');

// 按分数获取
const users = await redis.zrangebyscore('ranking', 80, 100);

// 增加分数
await redis.zincrby('ranking', 10, 'user1');

// 删除
await redis.zrem('ranking', 'user3');

// 数量
const count = await redis.zcard('ranking');
```

## 常用场景

### 缓存

```javascript
async function getUser(userId) {
  const cacheKey = `user:${userId}`;
  
  // 尝试从缓存获取
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // 从数据库获取
  const user = await db.findUser(userId);
  
  // 存入缓存
  await redis.setex(cacheKey, 3600, JSON.stringify(user));
  
  return user;
}

// 缓存失效
async function updateUser(userId, data) {
  await db.updateUser(userId, data);
  await redis.del(`user:${userId}`);  // 删除缓存
}
```

### 分布式锁

```javascript
async function acquireLock(lockKey, ttl = 10) {
  const lockValue = Date.now().toString();
  const result = await redis.set(lockKey, lockValue, 'EX', ttl, 'NX');
  return result === 'OK' ? lockValue : null;
}

async function releaseLock(lockKey, lockValue) {
  const script = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;
  return redis.eval(script, 1, lockKey, lockValue);
}

// 使用
async function processOrder(orderId) {
  const lockKey = `lock:order:${orderId}`;
  const lockValue = await acquireLock(lockKey, 30);
  
  if (!lockValue) {
    throw new Error('Failed to acquire lock');
  }
  
  try {
    // 处理订单...
  } finally {
    await releaseLock(lockKey, lockValue);
  }
}
```

### 限流

```javascript
// 滑动窗口限流
async function rateLimit(userId, limit = 10, window = 60) {
  const key = `ratelimit:${userId}`;
  const now = Date.now();
  const windowStart = now - window * 1000;
  
  // 使用事务
  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(key, 0, windowStart);  // 删除过期记录
  pipeline.zadd(key, now, `${now}`);               // 添加当前请求
  pipeline.zcard(key);                              // 获取请求数
  pipeline.expire(key, window);                     // 设置过期
  
  const results = await pipeline.exec();
  const count = results[2][1];
  
  return count <= limit;
}

// 使用
app.use(async (req, res, next) => {
  const allowed = await rateLimit(req.ip);
  if (!allowed) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  next();
});
```

### 会话存储

```javascript
const session = require('express-session');
const RedisStore = require('connect-redis').default;

app.use(session({
  store: new RedisStore({ client: redis }),
  secret: 'your-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,  // 1天
    httpOnly: true,
  },
}));
```

### 排行榜

```javascript
// 更新分数
async function updateScore(userId, score) {
  await redis.zadd('leaderboard', score, userId);
}

// 增加分数
async function addScore(userId, delta) {
  return redis.zincrby('leaderboard', delta, userId);
}

// 获取排行榜
async function getLeaderboard(page = 1, pageSize = 10) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;
  
  const results = await redis.zrevrange('leaderboard', start, end, 'WITHSCORES');
  
  const leaderboard = [];
  for (let i = 0; i < results.length; i += 2) {
    leaderboard.push({
      userId: results[i],
      score: parseInt(results[i + 1]),
      rank: start + i / 2 + 1,
    });
  }
  
  return leaderboard;
}

// 获取用户排名
async function getUserRank(userId) {
  const rank = await redis.zrevrank('leaderboard', userId);
  const score = await redis.zscore('leaderboard', userId);
  return { rank: rank + 1, score: parseInt(score) };
}
```

### 发布订阅

```javascript
// 发布者
await redis.publish('notifications', JSON.stringify({
  type: 'new_message',
  data: { from: 'user1', content: 'Hello' },
}));

// 订阅者
const subscriber = redis.duplicate();

subscriber.subscribe('notifications', (err) => {
  if (err) console.error('Subscribe error:', err);
});

subscriber.on('message', (channel, message) => {
  const data = JSON.parse(message);
  console.log(`Received on ${channel}:`, data);
});
```

## 管道和事务

### 管道

```javascript
// 批量执行，减少网络往返
const pipeline = redis.pipeline();
pipeline.set('a', '1');
pipeline.set('b', '2');
pipeline.get('a');
pipeline.get('b');
const results = await pipeline.exec();
```

### 事务

```javascript
const multi = redis.multi();
multi.set('a', '1');
multi.incr('counter');
multi.get('a');
const results = await multi.exec();
```

## 过期策略

```javascript
// 设置过期时间
await redis.expire('key', 3600);        // 秒
await redis.pexpire('key', 3600000);    // 毫秒
await redis.expireat('key', timestamp); // 时间戳

// 查看剩余时间
const ttl = await redis.ttl('key');     // 秒
const pttl = await redis.pttl('key');   // 毫秒

// 移除过期
await redis.persist('key');
```

## 最佳实践

1. **设置过期时间** - 避免内存无限增长
2. **使用管道** - 批量操作减少网络开销
3. **合理的 Key 命名** - `业务:模块:id` 格式
4. **避免大 Key** - String 不超过 1MB，集合不超过 10000 元素
5. **使用连接池** - 复用连接
6. **监控内存** - 设置最大内存和淘汰策略

## 总结

| 场景 | 数据类型 | 示例 |
|------|----------|------|
| 缓存 | String/Hash | 用户信息、配置 |
| 计数器 | String | 访问量、点赞数 |
| 排行榜 | Sorted Set | 积分排行 |
| 消息队列 | List | 任务队列 |
| 去重 | Set | 用户签到 |
| 分布式锁 | String | 并发控制 |
| 限流 | Sorted Set | API 限流 |
