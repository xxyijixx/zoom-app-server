// API通用响应结构
export interface ApiResponse<T = any> {
  code: number;     // 状态码：200成功，其他为错误码
  message: string;  // 响应消息
  data: T;         // 响应数据
  success: boolean; // 是否成功
}

// Zoom签名请求
export interface ZoomSignatureRequest {
  meetingNumber: string;
  role: number;
}

// Zoom签名响应数据
export interface ZoomSignatureResponse {
  signature: string;
}

// 配置响应数据
export interface ConfigResponse {
  disable_join_meeting: boolean;
  zoom_api_key: string
}

// 创建会议请求
export interface CreateMeetingRequest {
  topic: string;
  type: number;
  start_time?: string;
  duration?: number;
  timezone?: string;
  password?: string;
  agenda?: string;
  settings?: MeetingSettings;
}

// 会议设置
export interface MeetingSettings {
  host_video?: boolean;
  participant_video?: boolean;
  join_before_host?: boolean;
  mute_upon_entry?: boolean;
  waiting_room?: boolean;
}

// 创建会议响应数据
export interface CreateMeetingResponse {
  uuid: string;
  id: number;
  host_id: string;
  host_email: string;
  topic: string;
  type: number;
  status: string;
  start_time: string;
  duration: number;
  timezone: string;
  created_at: string;
  join_url: string;
  password: string;
  h323_password: string;
  pstn_password: string;
  encrypted_password: string;
  settings?: MeetingSettings;
}

// API错误类型
export class ApiError extends Error {
  public code: number;
  public data?: any;

  constructor(code: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.data = data;
  }
}