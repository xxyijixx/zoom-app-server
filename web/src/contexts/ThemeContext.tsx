import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react'
import { props } from '@dootask/tools';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // 根据props.themeName初始化暗黑模式状态
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    props.themeName === 'dark'
  );

  // 切换主题函数
  const toggleTheme = () => {
    const newTheme = !isDarkMode ? 'dark' : 'light';
    // 如果@dootask/tools支持设置themeName，可以在这里设置
    // 例如：props.setThemeName?.(newTheme);
    
    setIsDarkMode(!isDarkMode);
  };

  // 监听props.themeName的变化
  useEffect(() => {
    const handleThemeChange = () => {
      setIsDarkMode(props.themeName === 'dark');
    };

    // 初始设置
    handleThemeChange();

    // 如果@dootask/tools提供了主题变化的事件监听，可以在这里添加
    // 例如：props.onThemeChange?.(handleThemeChange);

    return () => {
      // 清理事件监听
      // 例如：props.offThemeChange?.(handleThemeChange);
    };
  }, []);

  // 根据isDarkMode状态添加或移除dark类
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};