import { useEffect } from 'react';
import { useError } from '../contexts/ErrorContext';
import { setGlobalErrorHandler } from '../utils/api';

/**
 * 初始化全局API错误处理器的Hook
 * 应该在应用的根组件中调用
 */
export const useApiErrorHandler = () => {
  const { showError } = useError();

  useEffect(() => {
    // 设置全局错误处理器
    setGlobalErrorHandler((error) => {
      showError({
        title: error.title,
        message: error.message,
        statusCode: error.statusCode
      });
    });

    // 清理函数
    return () => {
      setGlobalErrorHandler(() => {});
    };
  }, [showError]);
};