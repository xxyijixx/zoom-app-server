import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import ErrorModal from '../components/ErrorModal';

interface ErrorInfo {
  title?: string;
  message: string;
  statusCode?: number;
}

interface ErrorContextType {
  showError: (error: ErrorInfo) => void;
  hideError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showError = (errorInfo: ErrorInfo) => {
    setError(errorInfo);
    setIsVisible(true);
  };

  const hideError = () => {
    setIsVisible(false);
    // 延迟清除错误信息，等待动画完成
    setTimeout(() => setError(null), 300);
  };

  return (
    <ErrorContext.Provider value={{ showError, hideError }}>
      {children}
      {error && (
        <ErrorModal
          isOpen={isVisible}
          onClose={hideError}
          title={error.title}
          message={error.message}
          statusCode={error.statusCode}
        />
      )}
    </ErrorContext.Provider>
  );
};

export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};