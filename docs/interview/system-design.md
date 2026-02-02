# 系统设计入门

系统设计面试考察架构能力，本文介绍常见设计思路和模式。

## 设计流程

### 4 步框架

1. **需求澄清** (3-5 分钟)
   - 功能需求
   - 非功能需求 (性能、可用性)
   - 规模估算

2. **高层设计** (10-15 分钟)
   - 核心组件
   - 数据流
   - API 设计

3. **详细设计** (10-15 分钟)
   - 数据库设计
   - 核心算法
   - 关键组件深入

4. **扩展讨论** (5-10 分钟)
   - 瓶颈分析
   - 扩展方案
   - 权衡取舍

## 核心概念

### 可用性

```
可用性 = 正常运行时间 / 总时间

99.9% (三个9) = 每年 8.76 小时宕机
99.99% (四个9) = 每年 52.6 分钟宕机
```

### CAP 定理

分布式系统只能同时满足其中两个:

- **C (Consistency)**: 一致性
- **A (Availability)**: 可用性
- **P (Partition Tolerance)**: 分区容错性

### 扩展方式

| 方式 | 说明 | 优缺点 |
|------|------|--------|
| 垂直扩展 | 增加单机配置 | 简单但有上限 |
| 水平扩展 | 增加机器数量 | 复杂但无上限 |

## 常见组件

### 负载均衡

```
客户端
    ↓
负载均衡器 (Nginx / AWS ELB)
    ↓
┌───┼───┐
服务器1  服务器2  服务器3
```

**算法**:
- 轮询 (Round Robin)
- 加权轮询
- 最少连接
- IP Hash

### 缓存

**缓存策略**:
- Cache Aside: 先查缓存，未命中查数据库
- Write Through: 写入同时更新缓存和数据库
- Write Behind: 先写缓存，异步写数据库

**缓存问题**:
- 缓存穿透: 查询不存在的数据 → 布隆过滤器
- 缓存雪崩: 大量缓存同时过期 → 随机过期时间
- 缓存击穿: 热点 key 过期 → 互斥锁

### 数据库

**SQL vs NoSQL**:

| 特性 | SQL | NoSQL |
|------|-----|-------|
| 结构 | 固定 Schema | 灵活 |
| 事务 | ACID | 通常 BASE |
| 扩展 | 垂直为主 | 水平扩展 |
| 适用 | 复杂查询 | 大规模数据 |

**分库分表**:
- 垂直拆分: 按业务拆分表
- 水平拆分: 按数据范围/hash 拆分

### 消息队列

**作用**:
- 异步处理
- 服务解耦
- 削峰填谷

**常见选型**:
- RabbitMQ: 功能丰富
- Kafka: 高吞吐
- Redis: 简单场景

### CDN

**用途**: 静态资源分发，就近访问

**工作流程**:
1. 用户请求 → DNS 解析到最近节点
2. 节点有缓存 → 直接返回
3. 节点无缓存 → 回源获取

## 经典设计题

### 短链服务

**需求**:
- 长链接转短链接
- 短链接重定向到原地址
- 统计点击次数

**设计**:

```
┌─────────┐     ┌─────────┐     ┌─────────┐
│ 用户    │────→│ API     │────→│ Redis   │
└─────────┘     │ Server  │     │ 缓存    │
                └────┬────┘     └─────────┘
                     │
                ┌────┴────┐
                │ MySQL   │
                │ 数据库  │
                └─────────┘
```

**短码生成**:
```javascript
// 方案1: 自增 ID + Base62
const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function encode(num) {
  let result = '';
  while (num > 0) {
    result = chars[num % 62] + result;
    num = Math.floor(num / 62);
  }
  return result;
}

// 方案2: Hash + 冲突处理
function generateShortUrl(longUrl) {
  const hash = md5(longUrl).slice(0, 6);
  // 检查冲突，冲突则加盐重试
}
```

**数据库**:
```sql
CREATE TABLE urls (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  short_code VARCHAR(10) UNIQUE,
  long_url VARCHAR(2048),
  created_at TIMESTAMP,
  click_count BIGINT DEFAULT 0
);
```

### 限流器

**需求**:
- 限制 API 请求频率
- 支持分布式

**算法**:

1. **令牌桶**:
```javascript
class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillRate; // tokens/second
    this.lastRefill = Date.now();
  }
  
  allow() {
    this.refill();
    if (this.tokens > 0) {
      this.tokens--;
      return true;
    }
    return false;
  }
  
  refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
}
```

2. **滑动窗口**:
```javascript
// Redis 实现
async function slidingWindowRateLimit(userId, limit, window) {
  const key = `ratelimit:${userId}`;
  const now = Date.now();
  
  await redis.zremrangebyscore(key, 0, now - window * 1000);
  const count = await redis.zcard(key);
  
  if (count < limit) {
    await redis.zadd(key, now, now);
    await redis.expire(key, window);
    return true;
  }
  return false;
}
```

### Feed 流

**需求**:
- 用户发布动态
- 关注者看到 Feed
- 按时间排序

**方案对比**:

| 方案 | 说明 | 优缺点 |
|------|------|--------|
| Push | 发布时推送给所有粉丝 | 写放大，读简单 |
| Pull | 读时拉取关注者动态 | 写简单，读慢 |
| 混合 | 大 V 用 Pull，普通用户 Push | 平衡 |

**设计**:
```
发布动态:
用户 → API → 动态表 → 消息队列 → Fan-out 服务 → 粉丝 Feed

读取 Feed:
用户 → API → 缓存 (Redis Sorted Set) → 返回
```

**数据结构**:
```javascript
// Redis Sorted Set
// Key: feed:{userId}
// Score: timestamp
// Member: postId

ZADD feed:123 1705312345 "post:456"
ZREVRANGE feed:123 0 19 WITHSCORES
```

### 秒杀系统

**挑战**:
- 高并发
- 超卖
- 恶意请求

**设计**:
```
用户 → CDN (静态资源)
    → 网关 (限流、验证)
    → 秒杀服务
    → Redis (库存、预扣减)
    → 消息队列
    → 订单服务
```

**关键技术**:

1. **库存预扣减**:
```lua
-- Redis Lua 脚本保证原子性
local stock = tonumber(redis.call('GET', KEYS[1]))
if stock > 0 then
  redis.call('DECR', KEYS[1])
  return 1
end
return 0
```

2. **请求削峰**:
```javascript
// 随机排队
if (Math.random() > 0.1) {
  return '系统繁忙';
}
// 进入队列处理
```

3. **防刷策略**:
- 验证码
- 限制购买数量
- IP 限流
- 用户行为分析

## 估算技巧

### 常用数据

| 指标 | 数量级 |
|------|--------|
| QPS 单机 | 1K-10K |
| Redis QPS | 100K |
| MySQL QPS | 1K-5K |
| 网络带宽 | 1Gbps |
| SSD 读取 | 100K IOPS |

### 估算示例

设计一个日活 1000 万的社交应用:

```
DAU: 10M
平均每人每天 10 次请求
日请求量: 100M
平均 QPS: 100M / 86400 ≈ 1200
峰值 QPS: 1200 * 3 ≈ 4000

需要服务器: 4000 / 2000 = 2 台 + 冗余
```

## 设计原则

### 高可用

- 冗余: 无单点故障
- 故障转移: 自动切换
- 限流降级: 保护核心功能
- 监控告警: 及时发现问题

### 高性能

- 缓存: 减少数据库压力
- 异步: 非关键路径异步化
- 并行: 利用多核
- 就近: CDN、边缘计算

### 可扩展

- 无状态: 服务可水平扩展
- 分层: 关注点分离
- 解耦: 消息队列
- 分片: 数据库、缓存

## 总结

### 面试技巧

1. **主动沟通** - 不要闷头设计
2. **权衡取舍** - 解释 trade-off
3. **由粗到细** - 先整体后细节
4. **数据驱动** - 给出估算数据

### 常见设计题

- URL 短链服务
- 限流器
- Feed 流
- 秒杀系统
- 分布式缓存
- 消息队列
- 搜索系统
- 聊天系统
- 视频流服务
- 分布式文件存储
