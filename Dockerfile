# 多阶段构建 Dockerfile
# 阶段1: 构建前端
FROM node:20-alpine AS frontend-builder

WORKDIR /app/web

# 复制前端package文件
# COPY web/package*.json ./
# 复制前端源码
COPY web/ ./

# 安装前端依赖
RUN npm ci

ENV VITE_BASE_PATH=/apps/zoom-app

# 构建前端
RUN npm run build

# 阶段2: 构建后端
FROM golang:1.24-alpine AS backend-builder

WORKDIR /app

# 安装git（go mod可能需要）
RUN apk add --no-cache git

# 复制go模块文件
COPY go.mod go.sum ./

# 下载依赖
RUN go mod download

# 复制后端源码
COPY . .

# 构建后端二进制文件
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o zoom-app-server .

# 阶段3: 最终运行镜像
FROM nginx:alpine

# 安装supervisor来管理多个进程
RUN apk add --no-cache supervisor

# 创建必要的目录
RUN mkdir -p /var/log/supervisor
RUN mkdir -p /app

# 复制构建好的后端二进制文件
COPY --from=backend-builder /app/zoom-app-server /app/

# 复制构建好的前端文件到nginx目录
COPY --from=frontend-builder /app/web/dist /usr/share/nginx/html

# 复制nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

# 复制supervisor配置
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# 暴露端口
EXPOSE 80

# 使用supervisor启动nginx和后端服务
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]