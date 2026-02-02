# 微服务架构入门

微服务是将应用拆分为小型、独立服务的架构风格。

## 单体 vs 微服务

| 特性 | 单体架构 | 微服务架构 |
|------|----------|------------|
| 部署 | 整体部署 | 独立部署 |
| 扩展 | 整体扩展 | 按需扩展 |
| 技术栈 | 统一 | 可以不同 |
| 团队 | 大团队协作 | 小团队独立 |
| 复杂度 | 代码复杂 | 运维复杂 |

## 核心概念

### 服务拆分原则

1. **单一职责** - 每个服务只做一件事
2. **业务边界** - 按业务领域拆分
3. **数据独立** - 每个服务有自己的数据库
4. **松耦合** - 服务间通过 API 通信

### 典型拆分

```
电商系统
├── 用户服务 (User Service)
├── 商品服务 (Product Service)
├── 订单服务 (Order Service)
├── 支付服务 (Payment Service)
├── 库存服务 (Inventory Service)
├── 通知服务 (Notification Service)
└── 网关服务 (API Gateway)
```

## 服务通信

### 同步通信 - REST

```javascript
// 用户服务调用订单服务
const axios = require('axios');

async function getUserOrders(userId) {
  const response = await axios.get(
    `http://order-service:3000/api/orders?userId=${userId}`
  );
  return response.data;
}
```

### 同步通信 - gRPC

```protobuf
// order.proto
syntax = "proto3";

service OrderService {
  rpc GetOrder (OrderRequest) returns (Order);
  rpc CreateOrder (CreateOrderRequest) returns (Order);
}

message OrderRequest {
  string id = 1;
}

message Order {
  string id = 1;
  string userId = 2;
  repeated OrderItem items = 3;
  double total = 4;
}
```

```javascript
// 客户端
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('order.proto');
const orderProto = grpc.loadPackageDefinition(packageDefinition);

const client = new orderProto.OrderService(
  'order-service:50051',
  grpc.credentials.createInsecure()
);

client.GetOrder({ id: '123' }, (err, response) => {
  console.log(response);
});
```

### 异步通信 - 消息队列

```javascript
// 发布者（订单服务）
const amqp = require('amqplib');

async function publishOrderCreated(order) {
  const connection = await amqp.connect('amqp://rabbitmq:5672');
  const channel = await connection.createChannel();
  
  await channel.assertExchange('events', 'topic');
  
  channel.publish(
    'events',
    'order.created',
    Buffer.from(JSON.stringify(order))
  );
  
  await channel.close();
  await connection.close();
}

// 订阅者（库存服务）
async function subscribeOrderCreated() {
  const connection = await amqp.connect('amqp://rabbitmq:5672');
  const channel = await connection.createChannel();
  
  await channel.assertExchange('events', 'topic');
  const queue = await channel.assertQueue('inventory-order-created');
  await channel.bindQueue(queue.queue, 'events', 'order.created');
  
  channel.consume(queue.queue, (msg) => {
    const order = JSON.parse(msg.content.toString());
    // 扣减库存
    deductInventory(order.items);
    channel.ack(msg);
  });
}
```

## API 网关

### 功能

- 路由转发
- 认证授权
- 限流
- 负载均衡
- 请求/响应转换

### Express 实现

```javascript
const express = require('express');
const httpProxy = require('http-proxy-middleware');

const app = express();

// 认证中间件
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // 验证 token
  next();
};

// 路由配置
const services = {
  '/api/users': 'http://user-service:3000',
  '/api/products': 'http://product-service:3000',
  '/api/orders': 'http://order-service:3000',
};

// 代理设置
Object.entries(services).forEach(([path, target]) => {
  app.use(
    path,
    authenticate,
    httpProxy.createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: { [`^${path}`]: '' },
    })
  );
});

app.listen(8080);
```

## 服务发现

### Consul

```yaml
# docker-compose.yml
services:
  consul:
    image: consul:latest
    ports:
      - "8500:8500"
    command: agent -server -ui -bootstrap-expect=1 -client=0.0.0.0
```

```javascript
const Consul = require('consul');

const consul = new Consul({ host: 'consul' });

// 注册服务
await consul.agent.service.register({
  name: 'order-service',
  address: 'order-service',
  port: 3000,
  check: {
    http: 'http://order-service:3000/health',
    interval: '10s',
  },
});

// 发现服务
const services = await consul.health.service({
  service: 'user-service',
  passing: true,
});

const userServiceUrl = `http://${services[0].Service.Address}:${services[0].Service.Port}`;
```

## 配置管理

### 集中式配置

```javascript
// 从配置中心获取
const axios = require('axios');

async function loadConfig() {
  const response = await axios.get(
    'http://config-service:8888/order-service/production'
  );
  return response.data;
}

// 监听配置变更
async function watchConfig(callback) {
  // 轮询或 WebSocket
  setInterval(async () => {
    const config = await loadConfig();
    callback(config);
  }, 30000);
}
```

## 容错处理

### 熔断器

```javascript
const CircuitBreaker = require('opossum');

const options = {
  timeout: 3000,           // 超时时间
  errorThresholdPercentage: 50,  // 错误率阈值
  resetTimeout: 30000,     // 熔断恢复时间
};

const breaker = new CircuitBreaker(callExternalService, options);

breaker.fallback(() => {
  // 降级逻辑
  return { data: 'fallback data' };
});

breaker.on('open', () => console.log('Circuit opened'));
breaker.on('close', () => console.log('Circuit closed'));

// 使用
const result = await breaker.fire(params);
```

### 重试

```javascript
const axios = require('axios');
const axiosRetry = require('axios-retry');

axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkError(error) || error.response?.status >= 500;
  },
});
```

### 超时

```javascript
const axios = require('axios');

const client = axios.create({
  timeout: 5000,
});

// 或使用 Promise.race
async function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), ms);
  });
  return Promise.race([promise, timeout]);
}
```

## 分布式事务

### Saga 模式

```javascript
// 订单创建 Saga
async function createOrderSaga(orderData) {
  const saga = [];
  
  try {
    // 1. 创建订单
    const order = await orderService.create(orderData);
    saga.push(() => orderService.cancel(order.id));
    
    // 2. 扣减库存
    await inventoryService.deduct(orderData.items);
    saga.push(() => inventoryService.restore(orderData.items));
    
    // 3. 扣减余额
    await paymentService.deduct(orderData.userId, orderData.total);
    saga.push(() => paymentService.refund(orderData.userId, orderData.total));
    
    // 4. 发送通知
    await notificationService.send(order);
    
    return order;
  } catch (error) {
    // 回滚 - 逆序执行补偿操作
    for (const compensate of saga.reverse()) {
      try {
        await compensate();
      } catch (e) {
        console.error('Compensation failed:', e);
      }
    }
    throw error;
  }
}
```

## 项目结构

```
microservices/
├── api-gateway/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── user-service/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── order-service/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── product-service/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── shared/
│   └── proto/           # gRPC 定义
├── docker-compose.yml
├── docker-compose.prod.yml
└── k8s/
    ├── namespace.yaml
    ├── user-service.yaml
    ├── order-service.yaml
    └── ingress.yaml
```

## 何时使用微服务

### 适合场景

- 大型复杂应用
- 需要独立扩展
- 多团队协作
- 技术栈多样化

### 不适合场景

- 小型应用
- 团队经验不足
- 快速原型验证
- 运维能力有限

## 总结

| 组件 | 工具 |
|------|------|
| API 网关 | Kong, Nginx, Express |
| 服务发现 | Consul, etcd, Nacos |
| 配置中心 | Apollo, Nacos, Consul |
| 消息队列 | RabbitMQ, Kafka, Redis |
| 熔断器 | opossum, Hystrix |
| 链路追踪 | Jaeger, Zipkin |
| 容器编排 | Kubernetes, Docker Swarm |
