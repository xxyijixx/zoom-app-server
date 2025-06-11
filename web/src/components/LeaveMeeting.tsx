import React from 'react';
import { useNavigate } from 'react-router-dom';

const LeaveMeeting: React.FC = () => {
  const navigate = useNavigate();

  const handleJoinAgain = () => {
    // 清空之前的会议信息
    localStorage.removeItem('zoom_meeting_info');
    // 跳转到加入会议页面
    navigate('/join');
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* 离开会议图标 */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-green-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
          </div>

          {/* 主要信息 */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            已离开会议
          </h2>
          
          <p className="text-gray-600 mb-8">
            您已成功离开 Zoom 会议。感谢您的参与！
          </p>

          {/* 操作按钮 */}
          <div className="space-y-4">
            <button
              onClick={handleJoinAgain}
              className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
            >
              加入新会议
            </button>
            
            <button
              onClick={() => window.close()}
              className="w-full bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-200"
            >
              关闭窗口
            </button>
          </div>

          {/* 额外信息 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              如需技术支持，请联系管理员
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveMeeting;