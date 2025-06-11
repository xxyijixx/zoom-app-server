// 运行时配置类型定义
export interface AppConfig {
  baseUrl: string;
  apiBaseUrl: string;
  appTitle: string;
  env: string;
  timestamp: string;
}

// 扩展Window接口以包含配置
declare global {
  interface Window {
    __APP_CONFIG__?: AppConfig;
  }
}

export {};