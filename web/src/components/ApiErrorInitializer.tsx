import React from 'react';
import { useApiErrorHandler } from '../hooks/useApiErrorHandler';

/**
 * API错误处理初始化组件
 * 用于在应用启动时设置全局API错误处理器
 */
const ApiErrorInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useApiErrorHandler();
  return <>{children}</>;
};

export default ApiErrorInitializer;