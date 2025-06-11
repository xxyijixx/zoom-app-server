# 动态配置功能说明

本项目支持在容器启动时通过环境变量动态注入配置，无需重新构建前端代码。

## 功能特性

- ✅ 支持动态配置 BaseURL
- ✅ 支持动态配置 API 基础路径
- ✅ 支持动态配置应用标题
- ✅ 支持环境标识配置
- ✅ 前端构建后仍可通过环境变量修改配置
- ✅ 支持子路径部署
- ✅ 支持自定义域名部署

## 环境变量配置

| 环境变量 | 默认值 | 说明 | 示例 |
|---------|--------|------|------|
| `BASE_URL` | `""` | 应用基础URL，用于子路径或自定义域名部署 | `/zoom-app` 或 `https://zoom.example.com` |
| `API_BASE_URL` | `/api` | API基础路径 | `/api` 或 `/zoom-app/api` |
| `APP_TITLE` | `Zoom App` | 应用标题，显示在浏览器标签页 | `企业会议系统` |
| `ENV` | `production` | 环境标识 | `production`, `staging`, `development` |

## 使用方法

### 1. Docker 运行

```bash
# 基础部署
docker run -d \
  -p 8080:80 \
  -e BASE_URL="" \
  -e API_BASE_URL="/api" \
  -e APP_TITLE="我的会议应用" \
  -e ENV="production" \
  zoom-app

# 子路径部署
docker run -d \
  -p 8080:80 \
  -e BASE_URL="/zoom-app" \
  -e API_BASE_URL="/zoom-app/api" \
  -e APP_TITLE="Zoom会议" \
  zoom-app

# 自定义域名部署
docker run -d \
  -p 8080:80 \
  -e BASE_URL="https://meeting.company.com" \
  -e API_BASE_URL="https://meeting.company.com/api" \
  -e APP_TITLE="公司会议系统" \
  zoom-app
```

### 2. Docker Compose

参考 `docker-compose.example.yml` 文件：

```yaml
version: '3.8'

services:
  zoom-app:
    build: .
    ports:
      - "8080:80"
    environment:
      - BASE_URL=/meeting
      - API_BASE_URL=/meeting/api
      - APP_TITLE=企业会议系统
      - ENV=production
```

### 3. Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: zoom-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: zoom-app
  template:
    metadata:
      labels:
        app: zoom-app
    spec:
      containers:
      - name: zoom-app
        image: zoom-app:latest
        ports:
        - containerPort: 80
        env:
        - name: BASE_URL
          value: "/zoom"
        - name: API_BASE_URL
          value: "/zoom/api"
        - name: APP_TITLE
          value: "K8s会议应用"
        - name: ENV
          value: "production"
```

## 工作原理

1. **构建时**: 前端代码正常构建，不包含任何硬编码的配置
2. **启动时**: 容器启动脚本 (`entrypoint.sh`) 执行配置注入脚本 (`inject-config.sh`)
3. **配置注入**: 脚本根据环境变量生成 `config.js` 文件，并注入到 HTML 中
4. **运行时**: 前端代码通过 `window.__APP_CONFIG__` 获取配置

## 配置文件结构

生成的 `config.js` 文件结构：

```javascript
window.__APP_CONFIG__ = {
  baseUrl: '/zoom-app',
  apiBaseUrl: '/zoom-app/api',
  appTitle: '会议应用',
  env: 'production',
  timestamp: '2024-01-01T00:00:00Z'
};
```

## 前端使用配置

前端代码通过工具函数获取配置：

```typescript
import { getConfig, getApiUrl, getAppTitle } from './utils/config';

// 获取完整配置
const config = getConfig();

// 获取API URL
const apiUrl = getApiUrl('/users');

// 获取应用标题
const title = getAppTitle();
```

## 部署场景示例

### 场景1: 根路径部署
```bash
# 访问地址: http://localhost:8080/
BASE_URL=""
API_BASE_URL="/api"
```

### 场景2: 子路径部署
```bash
# 访问地址: http://localhost:8080/zoom-app/
BASE_URL="/zoom-app"
API_BASE_URL="/zoom-app/api"
```

### 场景3: 反向代理部署
```bash
# Nginx配置代理到 /meeting 路径
BASE_URL="/meeting"
API_BASE_URL="/meeting/api"
```

### 场景4: 独立域名部署
```bash
# 独立域名访问
BASE_URL="https://meeting.company.com"
API_BASE_URL="https://api.company.com/meeting"
```

## 注意事项

1. **路径格式**: `BASE_URL` 如果是相对路径，应以 `/` 开头，不以 `/` 结尾
2. **API路径**: `API_BASE_URL` 应与后端路由配置保持一致
3. **CORS配置**: 如果前后端域名不同，需要配置CORS
4. **缓存问题**: `config.js` 文件每次启动都会重新生成，包含时间戳避免缓存

## 故障排除

### 1. 配置未生效
- 检查环境变量是否正确设置
- 查看容器日志确认配置注入是否成功
- 检查浏览器开发者工具中的 `window.__APP_CONFIG__`

### 2. API请求失败
- 确认 `API_BASE_URL` 配置正确
- 检查网络请求的实际URL
- 验证后端服务是否正常运行

### 3. 页面无法访问
- 确认 `BASE_URL` 配置与实际访问路径匹配
- 检查Nginx配置是否正确
- 验证端口映射是否正确