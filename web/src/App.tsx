import { useState, useEffect } from 'react'
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import JoinMeeting from './components/JoinMeeting'
import CreateMeeting from './components/CreateMeeting'
import ZoomMeeting from './components/ZoomMeeting'
import LeaveMeeting from './components/LeaveMeeting'
import { ErrorProvider } from './contexts/ErrorContext'
import ApiErrorInitializer from './components/ApiErrorInitializer'
import { ConfigProvider, useConfig } from './contexts/ConfigContext'

function App() {
  return (
    <ConfigProvider>
      <AppContent />
    </ConfigProvider>
  );
}

function AppContent() {
  const { config, isLoading } = useConfig();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  const shouldShowJoinMeeting = !config?.disable_join_meeting;
  const defaultRoute = shouldShowJoinMeeting ? "/join" : "/create";

  // 获取 base path 用于 Router 的 basename
  const basePath = import.meta.env.VITE_BASE_PATH || '/';
  // 确保 basename 不以 / 结尾（除非是根路径）
  const basename = basePath === '/' ? '' : basePath.replace(/\/$/, '');

  return (
    <ErrorProvider>
      <ApiErrorInitializer>
        <Router basename={basename}>
          <Routes>
            <Route path="/" element={<Navigate to={defaultRoute} replace />} />
            {shouldShowJoinMeeting && <Route path="/join" element={<JoinMeeting />} />}
            <Route path="/create" element={<CreateMeeting />} />
            <Route path="/meeting" element={<ZoomMeeting />} />
            <Route path="/leave" element={<LeaveMeeting />} />
          </Routes>
        </Router>
      </ApiErrorInitializer>
    </ErrorProvider>
  )
}

export default App
