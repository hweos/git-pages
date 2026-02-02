# Kubernetes 入门

Kubernetes (K8s) 是容器编排平台，用于自动化部署、扩展和管理容器化应用。

## 核心概念

| 概念 | 说明 |
|------|------|
| Pod | 最小部署单元，包含一个或多个容器 |
| Deployment | 管理 Pod 的副本和更新 |
| Service | 暴露 Pod，提供稳定访问入口 |
| Ingress | HTTP 路由，域名映射 |
| ConfigMap | 配置信息 |
| Secret | 敏感信息 |
| Namespace | 资源隔离 |
| Node | 工作节点 |

## 本地环境

### 安装 minikube

```bash
# macOS
brew install minikube

# 启动集群
minikube start

# 查看状态
minikube status

# 打开仪表板
minikube dashboard
```

### kubectl 常用命令

```bash
# 集群信息
kubectl cluster-info
kubectl get nodes

# 资源操作
kubectl get pods
kubectl get deployments
kubectl get services
kubectl get all

# 详细信息
kubectl describe pod <pod-name>
kubectl logs <pod-name>
kubectl logs -f <pod-name>  # 实时日志

# 进入容器
kubectl exec -it <pod-name> -- /bin/sh

# 应用配置
kubectl apply -f deployment.yaml
kubectl delete -f deployment.yaml

# 端口转发
kubectl port-forward <pod-name> 8080:80
```

## Pod

### 基础 Pod

```yaml
# pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-app
  labels:
    app: my-app
spec:
  containers:
    - name: my-app
      image: nginx:alpine
      ports:
        - containerPort: 80
      resources:
        requests:
          memory: "64Mi"
          cpu: "250m"
        limits:
          memory: "128Mi"
          cpu: "500m"
```

```bash
kubectl apply -f pod.yaml
kubectl get pods
kubectl describe pod my-app
kubectl delete pod my-app
```

## Deployment

### 基础 Deployment

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: my-app
          image: my-app:1.0.0
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: "production"
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

### 常用操作

```bash
# 部署
kubectl apply -f deployment.yaml

# 查看状态
kubectl get deployments
kubectl rollout status deployment/my-app

# 扩缩容
kubectl scale deployment my-app --replicas=5

# 更新镜像
kubectl set image deployment/my-app my-app=my-app:2.0.0

# 回滚
kubectl rollout undo deployment/my-app
kubectl rollout history deployment/my-app

# 重启
kubectl rollout restart deployment/my-app
```

## Service

### ClusterIP (内部访问)

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app
spec:
  type: ClusterIP
  selector:
    app: my-app
  ports:
    - port: 80
      targetPort: 3000
```

### NodePort (外部访问)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app
spec:
  type: NodePort
  selector:
    app: my-app
  ports:
    - port: 80
      targetPort: 3000
      nodePort: 30080  # 30000-32767
```

### LoadBalancer (云平台)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app
spec:
  type: LoadBalancer
  selector:
    app: my-app
  ports:
    - port: 80
      targetPort: 3000
```

## Ingress

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: my-app
                port:
                  number: 80
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-service
                port:
                  number: 80
  tls:
    - hosts:
        - app.example.com
      secretName: app-tls
```

## ConfigMap 和 Secret

### ConfigMap

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  APP_ENV: "production"
  LOG_LEVEL: "info"
  config.json: |
    {
      "database": "mongodb://db:27017",
      "cache": "redis://redis:6379"
    }
```

```yaml
# 在 Deployment 中使用
spec:
  containers:
    - name: my-app
      envFrom:
        - configMapRef:
            name: app-config
      # 或单个环境变量
      env:
        - name: APP_ENV
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: APP_ENV
      # 挂载为文件
      volumeMounts:
        - name: config
          mountPath: /app/config
  volumes:
    - name: config
      configMap:
        name: app-config
```

### Secret

```bash
# 创建 Secret
kubectl create secret generic db-secret \
  --from-literal=username=admin \
  --from-literal=password=secret123
```

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
data:
  username: YWRtaW4=  # base64 编码
  password: c2VjcmV0MTIz
```

```yaml
# 使用 Secret
spec:
  containers:
    - name: my-app
      env:
        - name: DB_USERNAME
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: username
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: password
```

## 完整示例

### Node.js 应用部署

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: my-app

---
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: my-app
data:
  NODE_ENV: "production"
  PORT: "3000"

---
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: my-registry/my-app:latest
          ports:
            - containerPort: 3000
          envFrom:
            - configMapRef:
                name: app-config
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5

---
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: api
  namespace: my-app
spec:
  selector:
    app: api
  ports:
    - port: 80
      targetPort: 3000

---
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  namespace: my-app
spec:
  ingressClassName: nginx
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api
                port:
                  number: 80
```

```bash
# 部署
kubectl apply -f namespace.yaml
kubectl apply -f .

# 查看
kubectl get all -n my-app
```

## Helm

Helm 是 Kubernetes 的包管理器。

```bash
# 安装 Helm
brew install helm

# 添加仓库
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# 安装应用
helm install my-redis bitnami/redis

# 查看
helm list
helm status my-redis

# 卸载
helm uninstall my-redis

# 创建 Chart
helm create my-chart
```

## 调试技巧

```bash
# 查看 Pod 日志
kubectl logs <pod-name>
kubectl logs -f <pod-name>
kubectl logs <pod-name> -c <container-name>

# 进入容器
kubectl exec -it <pod-name> -- /bin/sh

# 查看事件
kubectl get events --sort-by=.metadata.creationTimestamp

# 描述资源
kubectl describe pod <pod-name>
kubectl describe deployment <deployment-name>

# 查看资源使用
kubectl top pods
kubectl top nodes
```

## 总结

| 资源 | 用途 |
|------|------|
| Pod | 运行容器 |
| Deployment | 管理 Pod 副本 |
| Service | 服务发现和负载均衡 |
| Ingress | HTTP 路由 |
| ConfigMap | 配置 |
| Secret | 敏感信息 |
| Namespace | 资源隔离 |
