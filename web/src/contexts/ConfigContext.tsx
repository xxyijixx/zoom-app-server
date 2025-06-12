import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ConfigResponse } from '../types/api';
import { apiGet } from '../utils/api';
import { ApiError } from '../types/api';

interface ConfigContextType {
  config: ConfigResponse | null;
  isLoading: boolean;
  error: string | null;
  refetchConfig: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<ConfigResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const configData = await apiGet<ConfigResponse>('/api/config');
      setConfig(configData);
    } catch (err) {
      console.error('Failed to fetch config:', err);
      if (err instanceof ApiError) {
        console.error('API Error:', err.code, err.message);
        setError(`获取配置失败: ${err.message}`);
      } else {
        setError('获取配置失败，请稍后重试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const value = {
    config,
    isLoading,
    error,
    refetchConfig: fetchConfig
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};