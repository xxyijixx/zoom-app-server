# Zoom App Server API 文档

## 概述

本服务提供两个主要功能：
1. 生成 Zoom JWT 签名（用于客户端 SDK）
2. 创建 Zoom 会议（使用 Server-To-Server OAuth）

## 配置

### 环境变量

```bash
# JWT 签名配置（原有功能）
ZOOM_API_KEY=your_api_key
ZOOM_API_SECRET=your_api_secret

# Server-To-Server OAuth 配置（创建会议功能）
ZOOM_ACCOUNT_ID=your_account_id
ZOOM_CLIENT_ID=your_client_id
ZOOM_CLIENT_SECRET=your_client_secret

# 服务器配置
PORT=8001
```

## API 接口

### 1. 生成 JWT 签名

**接口**: `POST /api/signature`

**描述**: 为 Zoom 客户端 SDK 生成 JWT 签名

**请求体**:
```json
{
  "meetingNumber": "123456789",
  "role": 1
}
```

**参数说明**:
- `meetingNumber`: 会议号码
- `role`: 用户角色 (0=参与者, 1=主持人)

**响应**:
```json
{
  "signature": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. 创建会议

**接口**: `POST /api/meetings`

**描述**: 使用 Server-To-Server OAuth 创建 Zoom 会议

**请求体**:
```json
{
  "topic": "我的会议",
  "type": 2,
  "start_time": "2024-01-15T10:00:00Z",
  "duration": 60,
  "timezone": "Asia/Shanghai",
  "password": "123456",
  "agenda": "讨论项目进展",
  "settings": {
    "host_video": true,
    "participant_video": true,
    "join_before_host": false,
    "mute_upon_entry": true,
    "waiting_room": true
  }
}
```

**参数说明**:
- `topic`: 会议主题（必填）
- `type`: 会议类型 (1=即时会议, 2=预定会议, 3=定期会议, 8=定期会议无固定时间)
- `start_time`: 开始时间（ISO 8601 格式，预定会议必填）
- `duration`: 会议时长（分钟）
- `timezone`: 时区
- `password`: 会议密码
- `agenda`: 会议议程
- `settings`: 会议设置

**响应**:
```json
{
  "uuid": "4444AAAiAAAAAiAiAiiAii==",
  "id": 123456789,
  "host_id": "uePiAiiAiiAiiAiiAiiAiA",
  "host_email": "example@example.com",
  "topic": "我的会议",
  "type": 2,
  "status": "waiting",
  "start_time": "2024-01-15T10:00:00Z",
  "duration": 60,
  "timezone": "Asia/Shanghai",
  "created_at": "2024-01-15T08:00:00Z",
  "join_url": "https://zoom.us/j/123456789?pwd=xxx",
  "password": "123456",
  "h323_password": "123456",
  "pstn_password": "123456",
  "encrypted_password": "xxx",
  "settings": {
    "host_video": true,
    "participant_video": true,
    "join_before_host": false,
    "mute_upon_entry": true,
    "waiting_room": true
  }
}
```

## 使用示例

### 创建即时会议

```bash
curl -X POST http://localhost:8001/api/meetings \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "即时会议",
    "type": 1
  }'
```

### 创建预定会议

```bash
curl -X POST http://localhost:8001/api/meetings \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "项目讨论会",
    "type": 2,
    "start_time": "2024-01-15T14:00:00Z",
    "duration": 90,
    "timezone": "Asia/Shanghai",
    "password": "meeting123",
    "settings": {
      "host_video": true,
      "participant_video": false,
      "waiting_room": true
    }
  }'
```

### 生成签名

```bash
curl -X POST http://localhost:8001/api/signature \
  -H "Content-Type: application/json" \
  -d '{
    "meetingNumber": "123456789",
    "role": 1
  }'
```

## 错误处理

所有接口在出错时会返回相应的 HTTP 状态码和错误信息：

- `400 Bad Request`: 请求参数错误
- `500 Internal Server Error`: 服务器内部错误

错误响应格式：
```
HTTP/1.1 400 Bad Request
Content-Type: text/plain

Invalid request body
```

## 注意事项

1. 确保在 Zoom Marketplace 中正确配置了 Server-To-Server OAuth 应用
2. 获取正确的 Account ID、Client ID 和 Client Secret
3. 确保应用具有创建会议的权限范围（meeting:write）
4. 时间格式使用 ISO 8601 标准（如：2024-01-15T14:00:00Z）