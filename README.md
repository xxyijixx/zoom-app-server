# Zoom 签名生成服务

这是一个用于生成 Zoom 会议签名的 Golang 服务端应用。

## 功能特点

- 生成 Zoom 会议签名
- RESTful API 接口
- 环境变量配置
- JWT 签名支持

## 安装

1. 克隆项目
2. 安装依赖：
```bash
go mod download
```

## 配置

1. 复制 `.env.example` 文件为 `.env`
2. 在 `.env` 文件中配置以下参数：
   - ZOOM_API_KEY：您的 Zoom API Key
   - ZOOM_API_SECRET：您的 Zoom API Secret
   - PORT：服务器端口（默认：8080）

## 运行

```bash
go run main.go
```

## API 使用

### 生成签名

**请求：**
```http
POST /api/signature
Content-Type: application/json

{
    "meetingNumber": "123456789",
    "role": 0
}
```

**响应：**
```json
{
    "signature": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 参数说明

- meetingNumber：Zoom 会议号码
- role：用户角色（0：参会者，1：主持人）

## 注意事项

- 请确保妥善保管您的 API Key 和 Secret
- 签名有效期为 24 小时
- 建议在生产环境中使用 HTTPS 