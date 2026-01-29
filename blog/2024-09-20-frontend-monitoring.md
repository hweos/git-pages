---
slug: frontend-monitoring
title: 前端监控与埋点实践
authors: mason
tags: [监控, 埋点, 性能, 前端]
---

前端监控帮助我们了解用户行为和应用健康状况。本文介绍前端监控的核心概念和实现方法。

<!--truncate-->

## 🎯 监控类型

| 类型 | 内容 | 作用 |
|------|------|------|
| **性能监控** | 加载时间、渲染性能 | 优化用户体验 |
| **错误监控** | JS 错误、资源错误 | 快速定位问题 |
| **行为监控** | 点击、页面访问 | 产品分析 |
| **用户体验** | 卡顿、白屏 | 体验优化 |

---

## 📊 性能监控

### Performance API

```javascript
// 导航时间
const timing = performance.getEntriesByType('navigation')[0];

const metrics = {
  // DNS 查询
  dns: timing.domainLookupEnd - timing.domainLookupStart,
  // TCP 连接
  tcp: timing.connectEnd - timing.connectStart,
  // 首字节时间 (TTFB)
  ttfb: timing.responseStart - timing.requestStart,
  // 下载时间
  download: timing.responseEnd - timing.responseStart,
  // DOM 解析
  domParse: timing.domInteractive - timing.responseEnd,
  // DOM 完成
  domComplete: timing.domComplete - timing.domInteractive,
  // 页面完全加载
  loadComplete: timing.loadEventEnd - timing.navigationStart,
};

console.log(metrics);
```

### Core Web Vitals

```javascript
import { onLCP, onFID, onCLS, onINP, onFCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
    id: metric.id,
    navigationType: metric.navigationType,
  });

  // 使用 sendBeacon 确保数据发送
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/analytics', body);
  } else {
    fetch('/analytics', { body, method: 'POST', keepalive: true });
  }
}

onLCP(sendToAnalytics);
onFID(sendToAnalytics);
onCLS(sendToAnalytics);
onINP(sendToAnalytics);
onFCP(sendToAnalytics);
onTTFB(sendToAnalytics);
```

### 资源加载监控

```javascript
// 监控所有资源加载
const resources = performance.getEntriesByType('resource');

resources.forEach(resource => {
  console.log({
    name: resource.name,
    type: resource.initiatorType, // script, css, img, fetch...
    duration: resource.duration,
    size: resource.transferSize,
  });
});

// 监控慢资源
const slowResources = resources.filter(r => r.duration > 1000);
```

---

## ⚠️ 错误监控

### 全局错误捕获

```javascript
// JS 运行时错误
window.onerror = function(message, source, lineno, colno, error) {
  reportError({
    type: 'js_error',
    message,
    source,
    lineno,
    colno,
    stack: error?.stack,
  });
  return false; // 继续默认处理
};

// Promise 未捕获错误
window.addEventListener('unhandledrejection', (event) => {
  reportError({
    type: 'promise_error',
    message: event.reason?.message || String(event.reason),
    stack: event.reason?.stack,
  });
});

// 资源加载错误
window.addEventListener('error', (event) => {
  if (event.target && (event.target.src || event.target.href)) {
    reportError({
      type: 'resource_error',
      tagName: event.target.tagName,
      url: event.target.src || event.target.href,
    });
  }
}, true); // 捕获阶段
```

### React 错误边界

```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    reportError({
      type: 'react_error',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong</div>;
    }
    return this.props.children;
  }
}
```

### 接口错误监控

```javascript
// 拦截 fetch
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const startTime = Date.now();
  
  try {
    const response = await originalFetch.apply(this, args);
    
    // 记录请求
    reportApi({
      url: args[0],
      method: args[1]?.method || 'GET',
      status: response.status,
      duration: Date.now() - startTime,
      success: response.ok,
    });

    return response;
  } catch (error) {
    reportApi({
      url: args[0],
      method: args[1]?.method || 'GET',
      status: 0,
      duration: Date.now() - startTime,
      success: false,
      error: error.message,
    });
    throw error;
  }
};
```

---

## 📈 行为监控

### 页面访问 (PV/UV)

```javascript
// 页面访问
function trackPageView() {
  report({
    type: 'pageview',
    url: location.href,
    referrer: document.referrer,
    title: document.title,
    timestamp: Date.now(),
  });
}

// SPA 路由变化
window.addEventListener('popstate', trackPageView);

// 如果使用 React Router
useEffect(() => {
  trackPageView();
}, [location.pathname]);
```

### 点击事件

```javascript
// 自动采集点击
document.addEventListener('click', (event) => {
  const target = event.target;
  
  // 获取元素信息
  const elementInfo = {
    tagName: target.tagName,
    id: target.id,
    className: target.className,
    text: target.innerText?.slice(0, 50),
    path: getElementPath(target),
  };

  report({
    type: 'click',
    ...elementInfo,
    x: event.clientX,
    y: event.clientY,
    timestamp: Date.now(),
  });
}, true);

// 获取元素路径
function getElementPath(element) {
  const path = [];
  while (element && element !== document.body) {
    let selector = element.tagName.toLowerCase();
    if (element.id) {
      selector += `#${element.id}`;
    } else if (element.className) {
      selector += `.${element.className.split(' ').join('.')}`;
    }
    path.unshift(selector);
    element = element.parentElement;
  }
  return path.join(' > ');
}
```

### 手动埋点

```javascript
// 埋点 SDK
const tracker = {
  track(eventName, properties = {}) {
    report({
      type: 'event',
      event: eventName,
      properties,
      timestamp: Date.now(),
    });
  },

  // 预设事件
  trackButtonClick(buttonName) {
    this.track('button_click', { button: buttonName });
  },

  trackFormSubmit(formName, success) {
    this.track('form_submit', { form: formName, success });
  },

  trackSearch(keyword, resultCount) {
    this.track('search', { keyword, resultCount });
  },
};

// 使用
tracker.track('add_to_cart', { productId: '123', price: 99 });
tracker.trackButtonClick('checkout');
```

---

## 📤 数据上报

### 上报策略

```javascript
class Reporter {
  private queue: any[] = [];
  private maxBatchSize = 10;
  private flushInterval = 5000;
  private timer?: NodeJS.Timer;

  constructor() {
    this.startTimer();
    
    // 页面卸载前上报
    window.addEventListener('beforeunload', () => this.flush());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    });
  }

  private startTimer() {
    this.timer = setInterval(() => this.flush(), this.flushInterval);
  }

  report(data: any) {
    this.queue.push({
      ...data,
      timestamp: Date.now(),
      url: location.href,
      userAgent: navigator.userAgent,
    });

    if (this.queue.length >= this.maxBatchSize) {
      this.flush();
    }
  }

  private flush() {
    if (this.queue.length === 0) return;

    const data = this.queue.splice(0, this.maxBatchSize);
    this.send(data);
  }

  private send(data: any[]) {
    const body = JSON.stringify(data);

    // 优先使用 sendBeacon
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', body);
    } else {
      fetch('/api/track', {
        method: 'POST',
        body,
        keepalive: true,
      });
    }
  }
}

const reporter = new Reporter();
```

### 采样

```javascript
// 按比例采样
function shouldSample(sampleRate = 0.1) {
  return Math.random() < sampleRate;
}

// 使用
if (shouldSample(0.1)) { // 10% 采样
  reporter.report(data);
}
```

---

## 🛠️ 开源方案

| 方案 | 类型 | 特点 |
|------|------|------|
| **Sentry** | 错误监控 | 功能强大，生态丰富 |
| **LogRocket** | 全功能 | 会话回放 |
| **Mixpanel** | 行为分析 | 产品分析 |
| **Google Analytics** | 行为分析 | 免费，功能全 |
| **自建** | 全功能 | 可控，定制化 |

### Sentry 集成

```javascript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'your-dsn',
  environment: process.env.NODE_ENV,
  release: 'my-app@1.0.0',
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
});

// 手动上报
Sentry.captureException(error);
Sentry.captureMessage('Something happened');

// 添加上下文
Sentry.setUser({ id: user.id, email: user.email });
Sentry.setTag('page', 'checkout');
```

---

## 📋 监控清单

```markdown
性能监控：
- [ ] Core Web Vitals (LCP, INP, CLS)
- [ ] 首屏时间
- [ ] 资源加载时间
- [ ] 接口响应时间

错误监控：
- [ ] JS 运行时错误
- [ ] Promise 未捕获错误
- [ ] 资源加载失败
- [ ] 接口错误

行为监控：
- [ ] PV/UV
- [ ] 点击事件
- [ ] 关键操作埋点
- [ ] 用户路径
```

---

监控是了解用户和产品的眼睛。建立完善的监控体系，才能持续改进产品体验。
