---
slug: websocket-guide
title: WebSocket 实时通信指南
authors: mason
tags: [WebSocket, 实时通信, 后端]
---

WebSocket 实现了浏览器与服务器之间的全双工通信。本文介绍 WebSocket 的原理和实践。

<!--truncate-->

## 🎯 WebSocket 简介

### vs HTTP

| 特性 | HTTP | WebSocket |
|------|------|-----------|
| 连接 | 短连接 | 长连接 |
| 通信方式 | 请求-响应 | 全双工 |
| 开销 | 每次请求都有头部 | 一次握手，后续开销小 |
| 实时性 | 轮询 | 实时推送 |

### 适用场景

```markdown
- 即时聊天
- 在线游戏
- 实时协作（文档、白板）
- 股票行情
- 消息推送
- 实时监控
```

---

## 🔌 客户端 API

### 基本使用

```javascript
// 创建连接
const ws = new WebSocket('wss://example.com/socket');

// 连接成功
ws.onopen = () => {
  console.log('连接成功');
  ws.send('Hello Server!');
};

// 接收消息
ws.onmessage = (event) => {
  console.log('收到消息:', event.data);
};

// 连接关闭
ws.onclose = (event) => {
  console.log('连接关闭:', event.code, event.reason);
};

// 错误处理
ws.onerror = (error) => {
  console.error('WebSocket 错误:', error);
};

// 发送消息
ws.send('Hello');
ws.send(JSON.stringify({ type: 'message', data: 'Hello' }));

// 关闭连接
ws.close();
```

### 连接状态

```javascript
// WebSocket.readyState
WebSocket.CONNECTING  // 0 - 连接中
WebSocket.OPEN        // 1 - 已连接
WebSocket.CLOSING     // 2 - 关闭中
WebSocket.CLOSED      // 3 - 已关闭

// 检查状态
if (ws.readyState === WebSocket.OPEN) {
  ws.send(message);
}
```

---

## 🛠️ 封装 WebSocket

### 带重连的 WebSocket

```typescript
class ReconnectingWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private listeners: Map<string, Function[]> = new Map();

  constructor(url: string) {
    this.url = url;
    this.connect();
  }

  private connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('WebSocket 连接成功');
      this.reconnectAttempts = 0;
      this.emit('open');
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.emit('message', data);
    };

    this.ws.onclose = () => {
      console.log('WebSocket 连接关闭');
      this.emit('close');
      this.reconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket 错误:', error);
      this.emit('error', error);
    };
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('达到最大重连次数');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`${delay}ms 后尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => this.connect(), delay);
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket 未连接');
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  private emit(event: string, data?: any) {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }

  close() {
    this.maxReconnectAttempts = 0; // 禁止重连
    this.ws?.close();
  }
}

// 使用
const ws = new ReconnectingWebSocket('wss://example.com/socket');

ws.on('message', (data) => {
  console.log('收到:', data);
});

ws.send({ type: 'subscribe', channel: 'updates' });
```

---

## 🖥️ 服务端实现

### Node.js (ws 库)

```javascript
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

// 存储所有连接
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('新连接');
  clients.add(ws);

  // 接收消息
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    console.log('收到:', data);

    // 广播给所有客户端
    broadcast(data);
  });

  // 连接关闭
  ws.on('close', () => {
    console.log('连接关闭');
    clients.delete(ws);
  });

  // 发送欢迎消息
  ws.send(JSON.stringify({ type: 'welcome', message: 'Hello!' }));
});

function broadcast(data) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

console.log('WebSocket 服务器运行在 ws://localhost:8080');
```

### 带认证的连接

```javascript
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws, req) => {
  // 从 URL 获取 token
  const url = new URL(req.url, 'http://localhost');
  const token = url.searchParams.get('token');

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    ws.user = user;
    console.log(`用户 ${user.name} 已连接`);
  } catch (err) {
    ws.close(1008, 'Invalid token');
    return;
  }

  ws.on('message', (message) => {
    // 处理消息...
  });
});
```

---

## 💬 聊天室示例

### 服务端

```javascript
const rooms = new Map(); // roomId -> Set<WebSocket>

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case 'join':
        joinRoom(ws, data.room);
        break;
      case 'leave':
        leaveRoom(ws, data.room);
        break;
      case 'message':
        broadcastToRoom(data.room, {
          type: 'message',
          user: ws.user,
          content: data.content,
          timestamp: Date.now()
        });
        break;
    }
  });

  ws.on('close', () => {
    // 离开所有房间
    rooms.forEach((clients, roomId) => {
      clients.delete(ws);
    });
  });
});

function joinRoom(ws, roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  rooms.get(roomId).add(ws);
  ws.rooms = ws.rooms || new Set();
  ws.rooms.add(roomId);
}

function leaveRoom(ws, roomId) {
  rooms.get(roomId)?.delete(ws);
  ws.rooms?.delete(roomId);
}

function broadcastToRoom(roomId, data) {
  rooms.get(roomId)?.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}
```

### 客户端

```javascript
const ws = new WebSocket('wss://example.com/chat?token=xxx');

// 加入房间
ws.send(JSON.stringify({ type: 'join', room: 'general' }));

// 发送消息
function sendMessage(content) {
  ws.send(JSON.stringify({
    type: 'message',
    room: 'general',
    content
  }));
}

// 接收消息
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'message') {
    displayMessage(data);
  }
};
```

---

## ❤️ 心跳检测

### 客户端

```javascript
class WebSocketWithHeartbeat {
  private heartbeatInterval: number = 30000;
  private heartbeatTimer?: NodeJS.Timer;

  connect() {
    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => {
      this.startHeartbeat();
    };

    this.ws.onclose = () => {
      this.stopHeartbeat();
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'pong') {
        // 收到心跳响应
        return;
      }
      // 处理其他消息...
    };
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.heartbeatInterval);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
  }
}
```

### 服务端

```javascript
wss.on('connection', (ws) => {
  ws.isAlive = true;

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'ping') {
      ws.send(JSON.stringify({ type: 'pong' }));
      return;
    }
    // 处理其他消息...
  });

  ws.on('pong', () => {
    ws.isAlive = true;
  });
});

// 定期检查连接
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) {
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);
```

---

## 🔧 React Hook

```typescript
import { useEffect, useRef, useState, useCallback } from 'react';

interface UseWebSocketOptions {
  onMessage?: (data: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnect?: boolean;
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      setIsConnected(true);
      options.onOpen?.();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      options.onMessage?.(data);
    };

    ws.onclose = () => {
      setIsConnected(false);
      options.onClose?.();
      if (options.reconnect) {
        setTimeout(connect, 3000);
      }
    };

    ws.onerror = (error) => {
      options.onError?.(error);
    };

    wsRef.current = ws;
  }, [url, options]);

  useEffect(() => {
    connect();
    return () => wsRef.current?.close();
  }, [connect]);

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { isConnected, send };
}

// 使用
function Chat() {
  const [messages, setMessages] = useState([]);
  
  const { isConnected, send } = useWebSocket('wss://example.com/chat', {
    onMessage: (data) => {
      setMessages(prev => [...prev, data]);
    },
    reconnect: true
  });

  return (
    <div>
      <div>状态: {isConnected ? '已连接' : '未连接'}</div>
      <button onClick={() => send({ type: 'message', content: 'Hello' })}>
        发送
      </button>
    </div>
  );
}
```

---

## 📋 最佳实践

```markdown
1. 使用 wss:// (加密)
2. 实现重连机制
3. 添加心跳检测
4. 消息使用 JSON 格式
5. 处理连接状态
6. 考虑离线消息队列
7. 服务端实现限流
```

---

WebSocket 是实时应用的基础。理解其原理，合理封装，能够构建流畅的实时体验。
