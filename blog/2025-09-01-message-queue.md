---
slug: message-queue-intro
title: 消息队列入门指南
authors: mason
tags: [消息队列, 后端, 架构]
---

消息队列是分布式系统中的重要组件。本文介绍消息队列的核心概念和常见使用场景。

<!--truncate-->

## 🎯 什么是消息队列

```markdown
消息队列 (MQ) = 生产者 → 队列 → 消费者

核心概念：
- Producer（生产者）：发送消息
- Consumer（消费者）：接收消息
- Queue（队列）：存储消息
- Broker（代理）：消息服务器
```

### 为什么需要消息队列

| 作用 | 说明 |
|------|------|
| 解耦 | 服务之间不直接依赖 |
| 异步 | 非核心流程异步处理 |
| 削峰 | 缓冲突发流量 |
| 可靠 | 消息持久化，不丢失 |

---

## 📊 常见消息队列

| 产品 | 特点 | 适用场景 |
|------|------|---------|
| **RabbitMQ** | 功能丰富，易用 | 中小规模 |
| **Kafka** | 高吞吐，持久化 | 日志、大数据 |
| **Redis** | 简单轻量 | 简单队列 |
| **RocketMQ** | 事务消息 | 电商 |

---

## 🐰 RabbitMQ

### 安装

```bash
# Docker
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:management
```

### Node.js 生产者

```javascript
const amqp = require('amqplib');

async function sendMessage() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  
  const queue = 'task_queue';
  const message = JSON.stringify({ task: 'process_order', orderId: 123 });

  // 声明队列
  await channel.assertQueue(queue, { durable: true });
  
  // 发送消息
  channel.sendToQueue(queue, Buffer.from(message), {
    persistent: true, // 消息持久化
  });

  console.log('Sent:', message);
  
  setTimeout(() => {
    connection.close();
  }, 500);
}

sendMessage();
```

### Node.js 消费者

```javascript
const amqp = require('amqplib');

async function consume() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  
  const queue = 'task_queue';

  await channel.assertQueue(queue, { durable: true });
  
  // 每次只处理一条消息
  channel.prefetch(1);

  console.log('Waiting for messages...');

  channel.consume(queue, async (msg) => {
    const content = JSON.parse(msg.content.toString());
    console.log('Received:', content);

    // 处理消息
    await processTask(content);

    // 确认消息已处理
    channel.ack(msg);
  });
}

consume();
```

### 发布/订阅模式

```javascript
// 发布者
async function publish() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  
  const exchange = 'logs';
  const message = 'Hello World!';

  // 声明交换机
  await channel.assertExchange(exchange, 'fanout', { durable: false });
  
  // 发布消息
  channel.publish(exchange, '', Buffer.from(message));
  console.log('Published:', message);
}

// 订阅者
async function subscribe() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  
  const exchange = 'logs';

  await channel.assertExchange(exchange, 'fanout', { durable: false });
  
  // 创建临时队列
  const { queue } = await channel.assertQueue('', { exclusive: true });
  
  // 绑定到交换机
  channel.bindQueue(queue, exchange, '');

  channel.consume(queue, (msg) => {
    console.log('Received:', msg.content.toString());
  }, { noAck: true });
}
```

---

## 📮 Redis 队列

### 简单队列

```javascript
const Redis = require('ioredis');
const redis = new Redis();

// 生产者
async function produce(message) {
  await redis.lpush('queue:tasks', JSON.stringify(message));
}

// 消费者
async function consume() {
  while (true) {
    // 阻塞式获取
    const [, message] = await redis.brpop('queue:tasks', 0);
    const data = JSON.parse(message);
    await processTask(data);
  }
}
```

### 可靠队列（带确认）

```javascript
// 生产者
async function produce(message) {
  const id = Date.now().toString();
  await redis.lpush('queue:pending', JSON.stringify({ id, ...message }));
}

// 消费者
async function consume() {
  while (true) {
    // 从 pending 移动到 processing
    const message = await redis.brpoplpush(
      'queue:pending',
      'queue:processing',
      0
    );
    
    const data = JSON.parse(message);
    
    try {
      await processTask(data);
      // 处理成功，从 processing 移除
      await redis.lrem('queue:processing', 1, message);
    } catch (error) {
      // 处理失败，移回 pending
      await redis.lrem('queue:processing', 1, message);
      await redis.lpush('queue:pending', message);
    }
  }
}
```

---

## 📊 Kafka

### 概念

```markdown
- Topic：消息主题
- Partition：分区，并行处理
- Consumer Group：消费者组
- Offset：消息偏移量
```

### Node.js 示例

```javascript
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092'],
});

// 生产者
const producer = kafka.producer();

async function sendMessage() {
  await producer.connect();
  
  await producer.send({
    topic: 'orders',
    messages: [
      { key: 'order-1', value: JSON.stringify({ id: 1, amount: 100 }) },
    ],
  });
  
  await producer.disconnect();
}

// 消费者
const consumer = kafka.consumer({ groupId: 'order-group' });

async function consume() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'orders', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        topic,
        partition,
        offset: message.offset,
        value: message.value.toString(),
      });
    },
  });
}
```

---

## 🎯 使用场景

### 1. 异步处理

```javascript
// 同步处理 - 用户等待时间长
async function createOrder(order) {
  await saveOrder(order);
  await sendEmail(order);      // 慢
  await updateInventory(order); // 慢
  await notifySupplier(order);  // 慢
  return order;
}

// 异步处理 - 核心流程快速返回
async function createOrder(order) {
  await saveOrder(order);
  
  // 非核心流程放入队列
  await queue.send('order.created', order);
  
  return order;
}

// 消费者处理
consumer.on('order.created', async (order) => {
  await sendEmail(order);
  await updateInventory(order);
  await notifySupplier(order);
});
```

### 2. 流量削峰

```javascript
// 秒杀场景
async function handleSeckill(userId, productId) {
  // 所有请求先入队
  await queue.send('seckill', { userId, productId });
  return { message: '正在排队处理' };
}

// 消费者控制处理速度
consumer.on('seckill', async (data) => {
  // 每秒处理 100 个
  await processOrder(data);
});
```

### 3. 应用解耦

```javascript
// 紧耦合
class OrderService {
  async createOrder(order) {
    await this.orderRepo.save(order);
    await this.emailService.send(order);    // 直接依赖
    await this.inventoryService.update(order); // 直接依赖
  }
}

// 松耦合
class OrderService {
  async createOrder(order) {
    await this.orderRepo.save(order);
    await this.eventBus.publish('order.created', order);
  }
}

// 其他服务独立订阅
emailService.subscribe('order.created', handleEmail);
inventoryService.subscribe('order.created', handleInventory);
```

---

## ⚠️ 注意事项

### 消息丢失

```markdown
- 生产者确认
- 消息持久化
- 消费者手动确认
```

### 重复消费

```markdown
- 消费者幂等设计
- 使用唯一 ID 去重
- 数据库唯一约束
```

### 消息顺序

```markdown
- 单队列单消费者
- 同一业务发送到同一分区
```

---

## 📋 选型建议

| 场景 | 推荐 |
|------|------|
| 简单队列 | Redis |
| 可靠消息 | RabbitMQ |
| 高吞吐 | Kafka |
| 事务消息 | RocketMQ |

---

消息队列是构建可扩展系统的利器，但也增加了复杂度。根据实际需求选择合适的方案。
