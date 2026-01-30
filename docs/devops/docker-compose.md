# Docker Compose 实践

Docker Compose 用于定义和运行多容器 Docker 应用程序。

## 快速开始

### 安装

Docker Desktop 已包含 Compose。Linux 单独安装：

```bash
# 下载
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 授权
sudo chmod +x /usr/local/bin/docker-compose

# 验证
docker-compose --version
```

### 基础示例

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - db
      - redis

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: secret
      MYSQL_DATABASE: myapp
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mysql_data:
```

### 常用命令

```bash
# 启动所有服务
docker-compose up

# 后台运行
docker-compose up -d

# 重新构建并启动
docker-compose up --build

# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f web

# 停止服务
docker-compose down

# 停止并删除卷
docker-compose down -v

# 查看运行状态
docker-compose ps

# 执行命令
docker-compose exec web sh
docker-compose exec db mysql -uroot -p

# 重启服务
docker-compose restart web
```

## 配置详解

### services 配置

```yaml
services:
  app:
    # 使用镜像
    image: node:20-alpine
    
    # 或从 Dockerfile 构建
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NODE_ENV: production
    
    # 容器名称
    container_name: my-app
    
    # 重启策略
    restart: unless-stopped
    # no | always | on-failure | unless-stopped
    
    # 端口映射
    ports:
      - "3000:3000"          # 主机:容器
      - "127.0.0.1:3001:3001"  # 只监听本地
    
    # 环境变量
    environment:
      NODE_ENV: production
      DB_HOST: db
    
    # 从文件加载环境变量
    env_file:
      - .env
      - .env.production
    
    # 卷挂载
    volumes:
      - ./src:/app/src        # 绑定挂载
      - node_modules:/app/node_modules  # 命名卷
      - /app/dist             # 匿名卷
    
    # 工作目录
    working_dir: /app
    
    # 启动命令
    command: npm run start
    
    # 入口点
    entrypoint: /entrypoint.sh
    
    # 依赖
    depends_on:
      - db
      - redis
    
    # 网络
    networks:
      - frontend
      - backend
    
    # 健康检查
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    
    # 资源限制
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### volumes 配置

```yaml
volumes:
  # 简单声明
  mysql_data:
  
  # 详细配置
  app_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /data/app
```

### networks 配置

```yaml
networks:
  # 默认网络
  default:
    driver: bridge
  
  # 自定义网络
  frontend:
    driver: bridge
  
  backend:
    driver: bridge
    internal: true  # 隔离网络，无法访问外网
  
  # 使用已存在的网络
  existing_network:
    external: true
```

## 实战场景

### Node.js + MySQL + Redis

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      DB_HOST: db
      DB_USER: root
      DB_PASSWORD: secret
      DB_NAME: myapp
      REDIS_HOST: redis
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    command: npm run dev

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: secret
      MYSQL_DATABASE: myapp
    volumes:
      - mysql_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "3306:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  adminer:
    image: adminer
    ports:
      - "8080:8080"
    depends_on:
      - db

volumes:
  mysql_data:
  redis_data:
```

### 前后端分离部署

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://user:password@db:5432/myapp
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Nginx 反向代理

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - web1
      - web2

  web1:
    build: .
    expose:
      - "3000"

  web2:
    build: .
    expose:
      - "3000"
```

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server web1:3000;
        server web2:3000;
    }

    server {
        listen 80;
        
        location / {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

## 多环境配置

### 基础配置 + 覆盖文件

```yaml
# docker-compose.yml (基础)
version: '3.8'

services:
  app:
    build: .
    environment:
      NODE_ENV: production

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
```

```yaml
# docker-compose.override.yml (开发环境，自动加载)
version: '3.8'

services:
  app:
    volumes:
      - .:/app
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
    command: npm run dev

  db:
    ports:
      - "3306:3306"
```

```yaml
# docker-compose.prod.yml (生产环境)
version: '3.8'

services:
  app:
    restart: always
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 512M
    
  db:
    restart: always
```

### 使用不同配置

```bash
# 开发环境（自动使用 override）
docker-compose up

# 生产环境
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 指定环境变量文件
docker-compose --env-file .env.production up
```

## 环境变量

### .env 文件

```bash
# .env
COMPOSE_PROJECT_NAME=myapp
DB_PASSWORD=secret
REDIS_PASSWORD=redis123
```

### 变量替换

```yaml
services:
  db:
    image: mysql:${MYSQL_VERSION:-8.0}
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD:?DB_PASSWORD is required}
```

| 语法 | 说明 |
|------|------|
| `${VAR}` | 使用变量 |
| `${VAR:-default}` | 变量为空时使用默认值 |
| `${VAR:?error}` | 变量为空时报错 |

## 常见问题

### 容器间通信

```yaml
services:
  app:
    environment:
      # 使用服务名作为主机名
      DB_HOST: db
      REDIS_HOST: redis
```

### 等待依赖就绪

```yaml
services:
  app:
    depends_on:
      db:
        condition: service_healthy
```

或使用 wait-for-it 脚本：

```dockerfile
# Dockerfile
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh
CMD ["/wait-for-it.sh", "db:3306", "--", "npm", "start"]
```

### 查看网络

```bash
# 列出网络
docker network ls

# 查看网络详情
docker network inspect myapp_default
```

### 清理资源

```bash
# 删除未使用的镜像
docker image prune

# 删除未使用的卷
docker volume prune

# 删除所有未使用资源
docker system prune -a
```

## 最佳实践

1. **使用 .env 管理敏感信息**
2. **生产环境使用具体版本号**，不要用 `latest`
3. **使用健康检查**确保服务就绪
4. **合理设置 restart 策略**
5. **使用命名卷**持久化数据
6. **分离配置**用于不同环境
7. **使用 networks 隔离服务**

## 总结

| 命令 | 说明 |
|------|------|
| `up -d` | 后台启动 |
| `down` | 停止并删除 |
| `logs -f` | 查看日志 |
| `exec` | 进入容器 |
| `ps` | 查看状态 |
| `build` | 重新构建 |
| `restart` | 重启服务 |
