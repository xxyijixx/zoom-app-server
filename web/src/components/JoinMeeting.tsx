import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const JoinMeeting: React.FC = () => {
  const navigate = useNavigate();
  const [meetingNumber, setMeetingNumber] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [passWord, setPassWord] = useState('');
  const [zoomLink, setZoomLink] = useState('');
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' 或 'link'

  // 页面加载时自动检测 localStorage
  useEffect(() => {
    const info = localStorage.getItem('zoom_meeting_info');
    if (info) {
      const data = JSON.parse(info);
      if (data.meetingNumber && data.userName && data.userEmail && data.passWord) {
        // 如果有会议信息，直接跳转到会议页面
        navigate('/meeting');
      }
    }
  }, [navigate]);

  const parseZoomLink = (link: string) => {
    try {
      const url = new URL(link);
      const meetingNumber = url.pathname.split('/').pop();
      const pwd = url.searchParams.get('pwd');
      
      if (meetingNumber && pwd) {
        setMeetingNumber(meetingNumber);
        setPassWord(pwd);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const handleJoinMeeting = () => {
    if (meetingNumber && userName && userEmail && passWord) {
      // 保存会议信息到 localStorage
      const meetingInfo = {
        meetingNumber,
        userName,
        userEmail,
        passWord,
        apiKey: 'Wk3vFblYScG8pGoxfVLWhw'
      };
      localStorage.setItem('zoom_meeting_info', JSON.stringify(meetingInfo));
      
      // 跳转到会议页面
      navigate('/meeting');
    } else {
      alert('请填写所有必要信息');
    }
  };

  const handleLinkSubmit = () => {
    if (parseZoomLink(zoomLink)) {
      // 链接解析成功，等待用户填写其他信息
    } else {
      alert('无效的 Zoom 链接');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900 dark:to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 relative">
          {/* 右上角按钮组 */}
          <div className="absolute top-4 right-4 flex items-center space-x-4">
            {/* 主题切换按钮 */}
            <ThemeToggle />
            
            {/* 创建会议按钮 */}
            <button
              onClick={() => navigate('/create')}
              className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
            >
              <span>创建会议</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-100 mb-8">加入 Zoom 会议</h2>
            
            {/* Tab 栏 */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`flex-1 py-2 text-sm font-medium ${
                  activeTab === 'manual'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('manual')}
              >
                手动输入
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium ${
                  activeTab === 'link'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('link')}
              >
                链接加入
              </button>
            </div>

            {activeTab === 'manual' ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    会议号
                  </label>
                  <input
                    type="text"
                    value={meetingNumber}
                    onChange={(e) => setMeetingNumber(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                    placeholder="请输入会议号"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    会议密码
                  </label>
                  <input
                    type="password"
                    value={passWord}
                    onChange={(e) => setPassWord(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                    placeholder="请输入会议密码"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Zoom 链接
                  </label>
                  <input
                    type="text"
                    value={zoomLink}
                    onChange={(e) => setZoomLink(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                    placeholder="请输入 Zoom 会议链接"
                  />
                </div>
                <button
                  onClick={handleLinkSubmit}
                  className="w-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 font-medium py-3 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-200"
                >
                  解析链接
                </button>
              </div>
            )}

            {/* 通用信息输入区域 */}
            <div className="space-y-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  用户名
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                  placeholder="请输入您的用户名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  邮箱
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                  placeholder="请输入您的邮箱"
                />
              </div>
              <button
                onClick={handleJoinMeeting}
                className="w-full bg-green-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200"
              >
                加入会议
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinMeeting;