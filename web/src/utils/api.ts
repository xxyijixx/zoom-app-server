import type { ApiResponse } from '../types/api';
import { ApiError } from '../types/api';
import { props } from '@dootask/tools'

const basePath = import.meta.env.VITE_BASE_PATH

// API请求配置
interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

// 通用API请求函数
export async function apiRequest<T = any>(
  url: string,
  config: RequestConfig = {}
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body
  } = config;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers
  };

  if (props.userToken) {
    const token = props.userToken
    if (token) {
      requestHeaders['Token'] = `${token}`
    }
  }

  const requestConfig: RequestInit = {
    method,
    headers: requestHeaders
  };

  if (body && method !== 'GET') {
    requestConfig.body = JSON.stringify(body);
  }
  if (basePath && url.startsWith("/")) {
    url = basePath + url
  }
  try {
    const response = await fetch(url, requestConfig);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<T> = await response.json();
    
    // 检查业务逻辑是否成功
    if (!result.success) {
      throw new ApiError(result.code, result.message, result.data);
    }

    return result.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // 处理网络错误或其他错误
    throw new ApiError(500, error instanceof Error ? error.message : '请求失败');
  }
}

// GET请求
export function apiGet<T = any>(url: string, headers?: Record<string, string>): Promise<T> {
  return apiRequest<T>(url, { method: 'GET', headers });
}

// POST请求
export function apiPost<T = any>(
  url: string,
  body?: any,
  headers?: Record<string, string>
): Promise<T> {
  return apiRequest<T>(url, { method: 'POST', body, headers });
}

// PUT请求
export function apiPut<T = any>(
  url: string,
  body?: any,
  headers?: Record<string, string>
): Promise<T> {
  return apiRequest<T>(url, { method: 'PUT', body, headers });
}

// DELETE请求
export function apiDelete<T = any>(
  url: string,
  headers?: Record<string, string>
): Promise<T> {
  return apiRequest<T>(url, { method: 'DELETE', headers });
}