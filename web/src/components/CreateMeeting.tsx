import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
  CreateMeetingRequest,
  CreateMeetingResponse,
  ConfigResponse
} from '../types/api';
import { ApiError } from '../types/api';
import { apiGet, apiPost } from '../utils/api';

const CreateMeeting: React.FC = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [type, setType] = useState(1); // 1: 即时会议, 2: 预定会议
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [timezone, setTimezone] = useState('Asia/Shanghai');
  const [password, setPassword] = useState('');
  const [agenda, setAgenda] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdMeeting, setCreatedMeeting] = useState<CreateMeetingResponse | null>(null);
  const [config, setConfig] = useState<ConfigResponse | null>(null);

  // 获取服务器配置
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const configData = await apiGet<ConfigResponse>('/api/config');
        setConfig(configData);
      } catch (err) {
        console.error('Failed to fetch config:', err);
        if (err instanceof ApiError) {
          console.error('API Error:', err.code, err.message);
        }
      }
    };
    fetchConfig();
  }, []);

  // 检查是否应该显示加入会议功能
  const shouldShowJoinMeeting = !config?.disable_join_meeting;

  const handleCreateMeeting = async () => {
    if (!topic.trim()) {
      setError('请输入会议主题');
      return;
    }

    if (type === 2 && !startTime) {
      setError('预定会议请选择开始时间');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const requestData: CreateMeetingRequest = {
        topic: topic.trim(),
        type
      };

      // 如果是预定会议，添加时间相关参数
      if (type === 2) {
        requestData.start_time = new Date(startTime).toISOString();
        requestData.duration = duration;
        requestData.timezone = timezone;
      }

      // 添加可选参数
      if (password.trim()) {
        requestData.password = password.trim();
      }
      if (agenda.trim()) {
        requestData.agenda = agenda.trim();
      }

      const meetingData = await apiPost<CreateMeetingResponse>('/api/meetings', requestData);
      setCreatedMeeting(meetingData);
      
      // 可选：自动跳转到加入会议页面
      // navigate('/join');
      
    } catch (err) {
      console.error('创建会议错误:', err);
      if (err instanceof ApiError) {
        setError(`创建会议失败: ${err.message}`);
      } else {
        setError(err instanceof Error ? err.message : '创建会议失败，请重试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinCreatedMeeting = () => {
    if (createdMeeting) {
      // 如果禁用了加入会议功能，直接打开邀请链接
      if (!shouldShowJoinMeeting) {
        window.open(createdMeeting.join_url, '_blank');
        return;
      }
      
      // 解析会议链接获取会议号
      const url = new URL(createdMeeting.join_url);
      const meetingNumber = url.pathname.split('/').pop();
      
      if (meetingNumber) {
        // 保存会议信息到 localStorage
        const meetingInfo = {
          meetingNumber,
          userName: '会议主持人',
          userEmail: 'host@example.com',
          passWord: createdMeeting.password,
          apiKey: 'Wk3vFblYScG8pGoxfVLWhw'
        };
        localStorage.setItem('zoom_meeting_info', JSON.stringify(meetingInfo));
        
        // 跳转到会议页面
        navigate('/meeting');
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('已复制到剪贴板');
    }).catch(() => {
      alert('复制失败，请手动复制');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 relative">
          {/* 右上角跳转按钮 */}
          {shouldShowJoinMeeting && (
            <button
              onClick={() => navigate('/join')}
              className="absolute top-4 right-4 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
            >
              <span>加入会议</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
          
          <div>
            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-8">创建 Zoom 会议</h2>
            
            {!createdMeeting ? (
              <div className="space-y-6">
                <div>
                  <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                    会议主题 *
                  </label>
                  <input
                    type="text"
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="请输入会议主题"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                    会议类型
                  </label>
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => setType(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    disabled={isLoading}
                  >
                    <option value={1}>即时会议</option>
                    <option value={2}>预定会议</option>
                  </select>
                </div>

                {/* 预定会议的时间设置 */}
                {type === 2 && (
                  <>
                    <div>
                      <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                        开始时间 *
                      </label>
                      <input
                        type="datetime-local"
                        id="startTime"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                        持续时间（分钟）
                      </label>
                      <select
                        id="duration"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        disabled={isLoading}
                      >
                        <option value={30}>30分钟</option>
                        <option value={60}>1小时</option>
                        <option value={90}>1.5小时</option>
                        <option value={120}>2小时</option>
                        <option value={180}>3小时</option>
                        <option value={240}>4小时</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
                        时区
                      </label>
                      <select
                        id="timezone"
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        disabled={isLoading}
                      >
                        <option value="Asia/Shanghai">北京时间 (UTC+8)</option>
                        <option value="America/New_York">纽约时间 (UTC-5/-4)</option>
                        <option value="Europe/London">伦敦时间 (UTC+0/+1)</option>
                        <option value="Asia/Tokyo">东京时间 (UTC+9)</option>
                        <option value="Australia/Sydney">悉尼时间 (UTC+10/+11)</option>
                        <option value="UTC">协调世界时 (UTC)</option>
                      </select>
                    </div>
                  </>
                )}

                {/* 可选设置 */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    会议密码（可选）
                  </label>
                  <input
                    type="text"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="留空则自动生成"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="agenda" className="block text-sm font-medium text-gray-700 mb-2">
                    会议议程（可选）
                  </label>
                  <textarea
                    id="agenda"
                    value={agenda}
                    onChange={(e) => setAgenda(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="请输入会议议程"
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleCreateMeeting}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      创建中...
                    </>
                  ) : (
                    '创建会议'
                  )}
                </button>

                {shouldShowJoinMeeting && (
                  <div className="text-center">
                    <button
                      onClick={() => navigate('/join')}
                      className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors duration-200"
                    >
                      返回加入会议
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-green-800 mb-2">会议创建成功！</h3>
                  <p className="text-green-600 text-sm">您的会议已成功创建，可以开始邀请参与者了。</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">会议主题</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={createdMeeting.topic}
                        readOnly
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                      <button
                        onClick={() => copyToClipboard(createdMeeting.topic)}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                      >
                        复制
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">会议ID</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={createdMeeting.id.toString()}
                        readOnly
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                      <button
                        onClick={() => copyToClipboard(createdMeeting.id.toString())}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                      >
                        复制
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">会议密码</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={createdMeeting.password}
                        readOnly
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                      <button
                        onClick={() => copyToClipboard(createdMeeting.password)}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                      >
                        复制
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">加入链接</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={createdMeeting.join_url}
                        readOnly
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(createdMeeting.join_url)}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                      >
                        复制
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleJoinCreatedMeeting}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    立即加入会议
                  </button>
                  <button
                    onClick={() => {
                      setCreatedMeeting(null);
                      setTopic('');
                      setType(1);
                      setStartTime('');
                      setDuration(60);
                      setTimezone('Asia/Shanghai');
                      setPassword('');
                      setAgenda('');
                      setError(null);
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    创建新会议
                  </button>
                </div>

                {shouldShowJoinMeeting && (
                  <div className="text-center">
                    <button
                      onClick={() => navigate('/join')}
                      className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors duration-200"
                    >
                      返回加入会议
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMeeting;