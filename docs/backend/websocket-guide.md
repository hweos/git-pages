# WebSocket 实战

WebSocket 提供全双工通信，适用于实时应用如聊天、游戏、协作编辑等。

## WebSocket vs HTTP

| 特性 | HTTP | WebSocket |
|------|------|-----------|
| 通信模式 | 请求-响应 | 全双工 |
| 连接 | 短连接 | 长连接 |
| 开销 | 每次请求带头部 | 一次握手后低开销 |
| 适用场景 | 普通请求 | 实时通信 |

## 原生 WebSocket

### 客户端

```javascript
// 创建连接
const ws = new WebSocket('ws://localhost:3000');

// 连接成功
ws.onopen = () => {
  console.log('Connected');
  ws.send('Hello Server!');
};

// 收到消息
ws.onmessage = (event) => {
  console.log('Received:', event.data);
  
  // 如果是 JSON
  const data = JSON.parse(event.data);
};

// 连接关闭
ws.onclose = (event) => {
  console.log('Disconnected:', event.code, event.reason);
};

// 错误处理
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

// 发送消息
ws.send('Hello');
ws.send(JSON.stringify({ type: 'message', content: 'Hello' }));

// 关闭连接
ws.close();
ws.close(1000, 'Normal closure');
```

### 服务端 (Node.js)

```bash
npm install ws
```

```javascript
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', (ws, req) => {
  console.log('Client connected from:', req.socket.remoteAddress);
  
  // 收到消息
  ws.on('message', (message) => {
    console.log('Received:', message.toString());
    
    // 回复
    ws.send('Echo: ' + message);
    
    // 广播给所有客户端
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });
  
  // 连接关闭
  ws.on('close', (code, reason) => {
    console.log('Client disconnected:', code, reason.toString());
  });
  
  // 错误处理
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
  
  // 发送欢迎消息
  ws.send('Welcome!');
});

console.log('WebSocket server running on port 3000');
```

## 与 Express 集成

```javascript
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Express 路由
app.get('/', (req, res) => {
  res.send('Hello World');
});

// WebSocket 处理
wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log('Received:', message.toString());
  });
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## 自动重连

```javascript
class ReconnectingWebSocket {
  constructor(url, options = {}) {
    this.url = url;
    this.options = {
      reconnectInterval: 1000,
      maxReconnectInterval: 30000,
      reconnectDecay: 1.5,
      maxReconnectAttempts: 10,
      ...options,
    };
    
    this.ws = null;
    this.reconnectAttempts = 0;
    this.listeners = { open: [], close: [], message: [], error: [] };
    
    this.connect();
  }
  
  connect() {
    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = (event) => {
      console.log('Connected');
      this.reconnectAttempts = 0;
      this.emit('open', event);
    };
    
    this.ws.onclose = (event) => {
      this.emit('close', event);
      
      if (this.reconnectAttempts < this.options.maxReconnectAttempts) {
        const delay = Math.min(
          this.options.reconnectInterval * Math.pow(this.options.reconnectDecay, this.reconnectAttempts),
          this.options.maxReconnectInterval
        );
        
        console.log(`Reconnecting in ${delay}ms...`);
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect();
        }, delay);
      }
    };
    
    this.ws.onmessage = (event) => this.emit('message', event);
    this.ws.onerror = (event) => this.emit('error', event);
  }
  
  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    }
  }
  
  on(event, callback) {
    this.listeners[event].push(callback);
  }
  
  emit(event, data) {
    this.listeners[event].forEach(cb => cb(data));
  }
  
  close() {
    this.options.maxReconnectAttempts = 0;
    this.ws.close();
  }
}

// 使用
const ws = new ReconnectingWebSocket('ws://localhost:3000');
ws.on('message', (event) => console.log(event.data));
```

## 心跳检测

### 客户端

```javascript
class HeartbeatWebSocket {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.heartbeatTimer = null;
    this.heartbeatInterval = 30000;  // 30秒
    this.connect();
  }
  
  connect() {
    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => {
      console.log('Connected');
      this.startHeartbeat();
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'pong') {
        console.log('Heartbeat received');
        return;
      }
      // 处理其他消息
    };
    
    this.ws.onclose = () => {
      this.stopHeartbeat();
      // 重连逻辑...
    };
  }
  
  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.heartbeatInterval);
  }
  
  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
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
    // 处理其他消息
  });
  
  ws.on('pong', () => {
    ws.isAlive = true;
  });
});

// 服务端主动检测
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) {
      return ws.terminate();
    }
    
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => {
  clearInterval(interval);
});
```

## 聊天室示例

### 服务端

```javascript
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000 });

const rooms = new Map();

wss.on('connection', (ws) => {
  ws.userId = null;
  ws.roomId = null;
  
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    switch (data.type) {
      case 'join':
        handleJoin(ws, data);
        break;
      case 'leave':
        handleLeave(ws);
        break;
      case 'message':
        handleMessage(ws, data);
        break;
    }
  });
  
  ws.on('close', () => {
    handleLeave(ws);
  });
});

function handleJoin(ws, data) {
  const { roomId, userId } = data;
  
  ws.userId = userId;
  ws.roomId = roomId;
  
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  rooms.get(roomId).add(ws);
  
  broadcast(roomId, {
    type: 'system',
    content: `${userId} joined the room`,
  });
}

function handleLeave(ws) {
  const { roomId, userId } = ws;
  
  if (roomId && rooms.has(roomId)) {
    rooms.get(roomId).delete(ws);
    
    if (rooms.get(roomId).size === 0) {
      rooms.delete(roomId);
    } else {
      broadcast(roomId, {
        type: 'system',
        content: `${userId} left the room`,
      });
    }
  }
}

function handleMessage(ws, data) {
  const { roomId, userId } = ws;
  
  broadcast(roomId, {
    type: 'message',
    userId,
    content: data.content,
    timestamp: Date.now(),
  });
}

function broadcast(roomId, message) {
  const clients = rooms.get(roomId);
  if (!clients) return;
  
  const payload = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}
```

### 客户端

```javascript
const ws = new WebSocket('ws://localhost:3000');

// 加入房间
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'join',
    roomId: 'room-1',
    userId: 'user-123',
  }));
};

// 发送消息
function sendMessage(content) {
  ws.send(JSON.stringify({
    type: 'message',
    content,
  }));
}

// 接收消息
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'system':
      console.log('[System]', data.content);
      break;
    case 'message':
      console.log(`[${data.userId}]`, data.content);
      break;
  }
};

// 离开房间
function leaveRoom() {
  ws.send(JSON.stringify({ type: 'leave' }));
}
```

## React Hook

```tsx
import { useEffect, useRef, useState, useCallback } from 'react';

interface UseWebSocketOptions {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnect?: boolean;
}

function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING);
  const wsRef = useRef<WebSocket | null>(null);
  
  const connect = useCallback(() => {
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      setReadyState(WebSocket.OPEN);
      options.onOpen?.();
    };
    
    ws.onclose = () => {
      setReadyState(WebSocket.CLOSED);
      options.onClose?.();
      
      if (options.reconnect) {
        setTimeout(connect, 3000);
      }
    };
    
    ws.onmessage = (event) => {
      setLastMessage(event.data);
    };
    
    ws.onerror = (error) => {
      options.onError?.(error);
    };
    
    wsRef.current = ws;
  }, [url, options]);
  
  useEffect(() => {
    connect();
    
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);
  
  const sendMessage = useCallback((message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    }
  }, []);
  
  return { lastMessage, readyState, sendMessage };
}

// 使用
function Chat() {
  const { lastMessage, readyState, sendMessage } = useWebSocket('ws://localhost:3000', {
    reconnect: true,
  });
  
  const isConnected = readyState === WebSocket.OPEN;
  
  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <p>Last message: {lastMessage}</p>
      <button onClick={() => sendMessage('Hello')} disabled={!isConnected}>
        Send
      </button>
    </div>
  );
}
```

## 安全考虑

### 认证

```javascript
// 客户端 - 通过 URL 传递 token
const ws = new WebSocket('ws://localhost:3000?token=xxx');

// 或通过首条消息认证
ws.onopen = () => {
  ws.send(JSON.stringify({ type: 'auth', token: 'xxx' }));
};

// 服务端验证
wss.on('connection', (ws, req) => {
  const url = new URL(req.url, 'http://localhost');
  const token = url.searchParams.get('token');
  
  try {
    const user = verifyToken(token);
    ws.userId = user.id;
  } catch (err) {
    ws.close(4001, 'Unauthorized');
  }
});
```

### 消息验证

```javascript
ws.on('message', (message) => {
  try {
    const data = JSON.parse(message);
    
    // 验证消息格式
    if (!data.type || typeof data.type !== 'string') {
      return ws.send(JSON.stringify({ error: 'Invalid message format' }));
    }
    
    // 验证消息长度
    if (message.length > 10000) {
      return ws.send(JSON.stringify({ error: 'Message too long' }));
    }
    
    // 处理消息...
  } catch (err) {
    ws.send(JSON.stringify({ error: 'Invalid JSON' }));
  }
});
```

## 总结

| 功能 | 实现 |
|------|------|
| 基础连接 | `new WebSocket(url)` |
| 消息收发 | `send()` / `onmessage` |
| 心跳检测 | 定时 ping/pong |
| 自动重连 | 指数退避重试 |
| 房间管理 | Map 存储客户端 |
| 广播消息 | 遍历 clients |
| 认证 | URL token / 首消息 |
