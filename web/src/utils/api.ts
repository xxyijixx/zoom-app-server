import type { ApiResponse } from '../types/api';
import { ApiError } from '../types/api';
import { props } from '@dootask/tools';

// 全局错误处理函数
let globalErrorHandler: ((error: { title?: string; message: string; statusCode?: number }) => void) | null = null;

// 设置全局错误处理器
export const setGlobalErrorHandler = (handler: (error: { title?: string; message: string; statusCode?: number }) => void) => {
  globalErrorHandler = handler;
};

// 获取HTTP状态码对应的错误信息
const getErrorMessage = (status: number): string => {
  switch (status) {
    case 400:
      return '请求参数错误，请检查输入信息';
    case 401:
      return '身份验证失败';
    case 403:
      return '没有权限访问此资源';
    case 404:
      return '请求的资源不存在';
    case 408:
      return '请求超时，请重试';
    case 409:
      return '请求冲突，资源已存在';
    case 422:
      return '请求数据格式错误';
    case 429:
      return '请求过于频繁，请稍后再试';
    case 500:
      return '服务器内部错误，请稍后重试';
    case 502:
      return '网关错误，服务暂时不可用';
    case 503:
      return '服务暂时不可用，请稍后重试';
    case 504:
      return '网关超时，请重试';
    default:
      return `请求失败 (HTTP ${status})`;
  }
};

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
      const errorMessage = getErrorMessage(response.status);
      
      // 显示错误弹窗
      if (globalErrorHandler) {
        globalErrorHandler({
          title: '请求失败',
          message: errorMessage,
          statusCode: response.status
        });
      }
      
      throw new ApiError(response.status, errorMessage);
    }

    const result: ApiResponse<T> = await response.json();
    
    // 检查业务逻辑是否成功
    if (!result.success) {
      // 业务逻辑错误也显示弹窗
      if (globalErrorHandler) {
        globalErrorHandler({
          title: '操作失败',
          message: result.message || '操作失败，请重试',
          statusCode: result.code
        });
      }
      
      throw new ApiError(result.code, result.message, result.data);
    }

    return result.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // 处理网络错误或其他错误
    const errorMessage = error instanceof Error ? error.message : '网络连接失败，请检查网络设置';
    
    // 网络错误也显示弹窗
    if (globalErrorHandler) {
      globalErrorHandler({
        title: '网络错误',
        message: errorMessage
      });
    }
    
    throw new ApiError(500, errorMessage);
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