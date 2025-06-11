# Docker 部署指南

本文档介绍如何使用 Docker 构建和部署 Zoom 应用。

## 项目结构

```
zoom-app-server/
├── Dockerfile              # 多阶段构建配置
├── docker-compose.yml      # Docker Compose 配置
├── nginx.conf              # Nginx 配置文件
├── supervisord.conf        # Supervisor 进程管理配置
├── .dockerignore           # Docker 构建忽略文件
├── web/                    # 前端 React 应用
└── ...                     # 后端 Go 应用文件
```

## 构建说明

### 多阶段构建流程

1. **前端构建阶段**: 使用 Node.js 18 Alpine 镜像构建 React 应用
2. **后端构建阶段**: 使用 Go 1.24 Alpine 镜像构建 Go 二进制文件
3. **运行阶段**: 使用 Nginx Alpine 镜像，集成前端静态文件和后端服务

### 服务架构

- **Nginx**: 作为反向代理，服务前端静态文件并代理 API 请求到后端
- **Go 后端**: 提供 Zoom API 服务，监听 8080 端口
- **Supervisor**: 管理 Nginx 和 Go 服务的启动和监控

## 环境变量配置

在项目根目录创建 `.env` 文件：

```bash
# Zoom API 配置（用于生成签名）
ZOOM_API_KEY=your_zoom_api_key
ZOOM_API_SECRET=your_zoom_api_secret

# Zoom OAuth 配置（用于创建会议）
ZOOM_ACCOUNT_ID=your_zoom_account_id
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret

# 功能开关
DISABLE_JOIN_MEETING=false
```

## 构建和运行

### 方法一：使用 Docker Compose（推荐）

```bash
# 构建并启动服务
docker-compose up --build

# 后台运行
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 方法二：使用 Docker 命令

```bash
# 构建镜像
docker build -t zoom-app .

# 运行容器
docker run -d \
  --name zoom-app-container \
  -p 80:80 \
  --env-file .env \
  zoom-app

# 查看日志
docker logs -f zoom-app-container

# 停止容器
docker stop zoom-app-container
docker rm zoom-app-container
```

## 访问应用

- **前端应用**: http://localhost
- **API 端点**: http://localhost/api/
- **健康检查**: http://localhost/health

## 日志管理

### 容器内日志位置

- Supervisor 日志: `/var/log/supervisor/`
- Nginx 访问日志: `/var/log/nginx/access.log`
- Nginx 错误日志: `/var/log/nginx/error.log`
- Go 应用日志: `/var/log/supervisor/zoom-app-server.out.log`

### 查看日志

```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker exec -it <container_name> tail -f /var/log/supervisor/supervisord.log

# 实时查看 Nginx 访问日志
docker exec -it <container_name> tail -f /var/log/nginx/access.log
```

## 生产环境部署

### 1. 环境变量安全

```bash
# 使用 Docker secrets 或环境变量而不是 .env 文件
docker run -d \
  --name zoom-app \
  -p 80:80 \
  -e ZOOM_API_KEY="$ZOOM_API_KEY" \
  -e ZOOM_API_SECRET="$ZOOM_API_SECRET" \
  zoom-app
```

### 2. 反向代理配置

如果在生产环境中使用外部反向代理（如 Nginx、Traefik），可以：

```bash
# 只暴露内部端口
docker run -d \
  --name zoom-app \
  -p 127.0.0.1:8081:80 \
  --env-file .env \
  zoom-app
```

### 3. 资源限制

```yaml
# docker-compose.yml 中添加资源限制
services:
  zoom-app:
    # ...
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## 故障排除

### 常见问题

1. **构建失败**
   ```bash
   # 清理 Docker 缓存
   docker system prune -a
   
   # 重新构建
   docker-compose build --no-cache
   ```

2. **服务无法启动**
   ```bash
   # 检查容器状态
   docker-compose ps
   
   # 查看详细日志
   docker-compose logs zoom-app
   ```

3. **API 请求失败**
   - 检查环境变量是否正确设置
   - 确认 Zoom API 凭据有效
   - 查看后端服务日志

### 健康检查

```bash
# 检查服务健康状态
curl http://localhost/health

# 检查 API 端点
curl http://localhost/api/config
```

## 镜像优化

当前镜像已经进行了以下优化：

- 使用 Alpine Linux 基础镜像减小体积
- 多阶段构建避免包含构建工具
- 静态文件 Gzip 压缩
- 合理的缓存策略
- 健康检查配置

最终镜像大小约为 50-80MB（不包含应用代码）。