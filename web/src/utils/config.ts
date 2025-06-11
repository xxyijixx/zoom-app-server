import type { AppConfig } from '../types/config';

// 默认配置
const defaultConfig: AppConfig = {
  baseUrl: '',
  apiBaseUrl: '/api',
  appTitle: 'Zoom App',
  env: 'development',
  timestamp: new Date().toISOString()
};

// 获取运行时配置
export function getConfig(): AppConfig {
  // 优先使用运行时注入的配置
  if (window.__APP_CONFIG__) {
    return {
      ...defaultConfig,
      ...window.__APP_CONFIG__
    };
  }
  
  // 开发环境下使用默认配置
  return defaultConfig;
}

// 获取完整的API URL
export function getApiUrl(path: string): string {
  const config = getConfig();
  const baseUrl = config.baseUrl.replace(/\/$/, ''); // 移除末尾斜杠
  const apiBaseUrl = config.apiBaseUrl.replace(/^\//g, ''); // 移除开头斜杠
  const cleanPath = path.replace(/^\//, ''); // 移除开头斜杠
  
  if (baseUrl) {
    return `${baseUrl}/${apiBaseUrl}/${cleanPath}`.replace(/\/+/g, '/').replace(/:\/([^/])/, '://$1');
  }
  
  return `/${apiBaseUrl}/${cleanPath}`.replace(/\/+/g, '/');
}

// 获取应用标题
export function getAppTitle(): string {
  return getConfig().appTitle;
}

// 检查是否为生产环境
export function isProduction(): boolean {
  return getConfig().env === 'production';
}