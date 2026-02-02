# 日志与监控体系

完善的日志和监控体系是保障系统稳定运行的基础。

## 日志体系

### 日志级别

| 级别 | 用途 | 场景 |
|------|------|------|
| ERROR | 错误 | 需要立即处理的问题 |
| WARN | 警告 | 潜在问题，不影响运行 |
| INFO | 信息 | 重要业务流程 |
| DEBUG | 调试 | 开发调试信息 |
| TRACE | 追踪 | 详细调试信息 |

### Node.js 日志库

```bash
npm install pino pino-pretty
```

```javascript
const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: process.env.NODE_ENV !== 'production',
    },
  },
});

// 使用
logger.info('Server started');
logger.error({ err: error }, 'Request failed');
logger.info({ userId: user.id, action: 'login' }, 'User logged in');
```

### 结构化日志

```javascript
// 请求日志中间件
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info({
      type: 'request',
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('user-agent'),
      ip: req.ip,
      userId: req.user?.id,
    });
  });
  
  next();
};

// 错误日志
logger.error({
  type: 'error',
  error: {
    message: error.message,
    stack: error.stack,
    code: error.code,
  },
  context: {
    userId: req.user?.id,
    path: req.path,
    body: req.body,
  },
});
```

### 日志聚合

#### ELK Stack

```yaml
# docker-compose.yml
version: '3.8'

services:
  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - es_data:/usr/share/elasticsearch/data

  logstash:
    image: logstash:8.11.0
    ports:
      - "5044:5044"
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch

  kibana:
    image: kibana:8.11.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

volumes:
  es_data:
```

#### 发送日志到 ELK

```javascript
const pino = require('pino');

const transport = pino.transport({
  targets: [
    // 控制台
    {
      target: 'pino-pretty',
      level: 'info',
    },
    // Logstash
    {
      target: 'pino-socket',
      level: 'info',
      options: {
        address: 'localhost',
        port: 5044,
        mode: 'tcp',
      },
    },
  ],
});

const logger = pino(transport);
```

## 监控体系

### 监控指标类型

| 类型 | 说明 | 示例 |
|------|------|------|
| Counter | 累计值 | 请求总数 |
| Gauge | 当前值 | 内存使用 |
| Histogram | 分布 | 响应时间 |
| Summary | 百分位 | P99 延迟 |

### Prometheus + Grafana

```yaml
# docker-compose.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus

volumes:
  prometheus_data:
  grafana_data:
```

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'node-app'
    static_configs:
      - targets: ['host.docker.internal:3000']
    metrics_path: /metrics
```

### Node.js 指标暴露

```bash
npm install prom-client
```

```javascript
const client = require('prom-client');

// 启用默认指标
client.collectDefaultMetrics();

// 自定义指标
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 1, 3, 5, 10],
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// 中间件
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const labels = {
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode,
    };
    
    httpRequestDuration.observe(labels, duration);
    httpRequestTotal.inc(labels);
  });
  
  next();
};

// 暴露指标端点
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});
```

### 业务指标

```javascript
// 用户注册数
const userRegistrations = new client.Counter({
  name: 'user_registrations_total',
  help: 'Total user registrations',
});

// 订单金额
const orderAmount = new client.Histogram({
  name: 'order_amount',
  help: 'Order amount distribution',
  buckets: [10, 50, 100, 500, 1000, 5000],
});

// 在线用户数
const onlineUsers = new client.Gauge({
  name: 'online_users',
  help: 'Current online users',
});

// 使用
userRegistrations.inc();
orderAmount.observe(order.total);
onlineUsers.set(connections.size);
```

## 告警

### Alertmanager 配置

```yaml
# alertmanager.yml
global:
  smtp_smarthost: 'smtp.example.com:587'
  smtp_from: 'alerts@example.com'
  smtp_auth_username: 'alerts@example.com'
  smtp_auth_password: 'password'

route:
  receiver: 'default'
  group_by: ['alertname']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h

receivers:
  - name: 'default'
    email_configs:
      - to: 'team@example.com'
    webhook_configs:
      - url: 'https://hooks.slack.com/services/xxx'
```

### 告警规则

```yaml
# alerts.yml
groups:
  - name: app
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate"
          description: "Error rate is {{ $value | humanizePercentage }}"
      
      - alert: HighLatency
        expr: histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency"
          description: "P99 latency is {{ $value }}s"
      
      - alert: HighMemoryUsage
        expr: process_resident_memory_bytes / 1024 / 1024 > 500
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value }}MB"
```

## 健康检查

```javascript
// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 详细健康检查
app.get('/health/detailed', async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    external_api: await checkExternalApi(),
  };
  
  const allHealthy = Object.values(checks).every(c => c.status === 'ok');
  
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ok' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
  });
});

async function checkDatabase() {
  try {
    await db.query('SELECT 1');
    return { status: 'ok' };
  } catch (err) {
    return { status: 'error', message: err.message };
  }
}

async function checkRedis() {
  try {
    await redis.ping();
    return { status: 'ok' };
  } catch (err) {
    return { status: 'error', message: err.message };
  }
}
```

## 分布式追踪

### OpenTelemetry

```bash
npm install @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node
```

```javascript
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

const sdk = new NodeSDK({
  traceExporter: new JaegerExporter({
    endpoint: 'http://localhost:14268/api/traces',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

## 监控仪表板

### 关键指标

| 分类 | 指标 | 告警阈值 |
|------|------|----------|
| 可用性 | 服务存活 | 1分钟无响应 |
| 延迟 | P99 响应时间 | > 1s |
| 错误率 | 5xx 比例 | > 1% |
| 饱和度 | CPU/内存使用 | > 80% |
| 流量 | QPS | 异常波动 |

### Grafana 面板

- **Overview**: 总览，核心指标
- **Requests**: 请求量、延迟分布、错误率
- **Resources**: CPU、内存、磁盘、网络
- **Business**: 业务指标（订单、用户等）
- **Errors**: 错误详情、堆栈

## 最佳实践

1. **结构化日志** - JSON 格式，便于解析
2. **合理的日志级别** - 生产环境 INFO 及以上
3. **请求 ID** - 贯穿整个请求链路
4. **监控覆盖** - RED 方法（Rate, Errors, Duration）
5. **告警分级** - 区分紧急和警告
6. **定期巡检** - 主动发现问题

## 总结

| 组件 | 工具 | 用途 |
|------|------|------|
| 日志 | Pino + ELK | 日志采集和分析 |
| 指标 | Prometheus + Grafana | 监控和可视化 |
| 告警 | Alertmanager | 告警通知 |
| 追踪 | Jaeger / Zipkin | 分布式追踪 |
| 健康检查 | 自定义端点 | 服务状态 |
