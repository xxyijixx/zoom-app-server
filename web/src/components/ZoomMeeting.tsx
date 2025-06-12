import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ZoomMtg } from "@zoom/meetingsdk";
import ThemeToggle from "./ThemeToggle";



const ZoomMeeting: React.FC = () => {
  const navigate = useNavigate();
  const meetingContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLeft, setHasLeft] = useState(false);
  const [meetingData, setMeetingData] = useState<{
    meetingNumber: string;
    userName: string;
    userEmail: string;
    passWord: string;
    role: number;
    apiKey: string;
    registrantToken: string;
    zakToken: string;
  } | null>(null);

  // 清理 Zoom SDK 和相关样式的函数
  const cleanupZoomSDK = () => {
    try {
      // 清理 Zoom 容器
      const zoomContainer = document.getElementById('zmmtg-root');
      if (zoomContainer) {
        zoomContainer.style.display = 'none';
        zoomContainer.innerHTML = '';
      }

      // 移除 Zoom SDK 注入的样式
      const zoomStyles = document.querySelectorAll('link[href*="zoom"], style[data-zoom]');
      zoomStyles.forEach(style => {
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      });

      // 移除可能的 Zoom CSS 文件
      const allLinks = document.querySelectorAll('link[rel="stylesheet"]');
      allLinks.forEach(link => {
        const href = (link as HTMLLinkElement).href;
        if (href && href.includes('zoom')) {
          if (link.parentNode) {
            link.parentNode.removeChild(link);
          }
        }
      });

      // 重置可能被 Zoom 修改的 body 样式
      document.body.style.overflow = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
      
    } catch (error) {
      console.warn('清理 Zoom SDK 时出错:', error);
    }
  };

  // 统一的离开会议处理函数
  const handleLeaveMeeting = () => {
    if (hasLeft) return;
    setHasLeft(true);
    
    console.log('处理离开会议');
    localStorage.removeItem('zoom_meeting_info');
    cleanupZoomSDK();
    navigate('/leave');
  };

  useEffect(() => {
    // 从 localStorage 读取会议信息
    const info = localStorage.getItem("zoom_meeting_info");
    if (info) {
      setMeetingData(JSON.parse(info));
    } else {
      // 如果没有会议信息，跳转到加入会议页面
      navigate("/join");
    }
  }, [navigate]);

  useEffect(() => {
    const initializeZoom = async () => {
      try {
        console.log("开始预加载 Zoom SDK...");
        ZoomMtg.preLoadWasm();
        ZoomMtg.prepareWebSDK();
        ZoomMtg.i18n.load("zh-CN");
        console.log("Zoom SDK 预加载完成");
      } catch (error) {
        console.error("初始化 Zoom 客户端失败:", error);
        setError("初始化 Zoom 客户端失败");
        setIsLoading(false);
      }
    };

    initializeZoom();
    return () => {
      cleanupZoomSDK();
    };
  }, []);

  useEffect(() => {
    const joinMeeting = async () => {
      if (!meetingData) {
        return;
      }

      const {
        meetingNumber,
        userName,
        userEmail,
        passWord,
        apiKey,
        registrantToken,
        zakToken,
      } = meetingData;

      if (!meetingNumber || !userName) {
        setError("缺少必要信息");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const cleanMeetingNumber = meetingNumber.replace(/\s+/g, "");
        console.log("开始加入会议:", {
          cleanMeetingNumber,
          userName,
          userEmail,
        });

        // 获取签名
        console.log("正在获取签名...");
        const response = await fetch("http://192.168.31.214:4000", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            meetingNumber: cleanMeetingNumber,
            role: 0, // 0 表示参会者
          }),
        });

        if (!response.ok) {
          throw new Error(
            `获取签名失败: ${response.status} ${response.statusText}`
          );
        }

        const { signature } = await response.json();
        console.log("获取到的签名:", signature);

        // 加入会议
        console.log("开始初始化 Zoom SDK...");

        ZoomMtg.init({
          leaveUrl: window.location.origin + "/leave",
          patchJsMedia: true,
          leaveOnPageUnload: true,
          success: () => {
            console.log("Zoom SDK 初始化成功，开始加入会议...");
            const container = document.getElementById("zmmtg-root");
            if (container) {
              container.style.display = "block";
            }
            ZoomMtg.join({
              signature: signature,
              sdkKey: apiKey,
              meetingNumber: cleanMeetingNumber,
              passWord: passWord,
              userName: userName,
              userEmail: userEmail,
              tk: registrantToken || "",
              zak: zakToken || "",
              success: () => {
                console.log("成功加入会议");
                setIsLoading(false);
              },
              error: (error: any) => {
                console.error("加入会议失败:", error);
                setError(`加入会议失败: ${JSON.stringify(error)}`);
                setIsLoading(false);
              },
            });
          },
          error: (error: any) => {
            console.error("Zoom SDK 初始化失败:", error);
            setError(`Zoom SDK 初始化失败: ${JSON.stringify(error)}`);
            setIsLoading(false);
          },
        });

        // 监听会议结束事件
        ZoomMtg.inMeetingServiceListener("onMeetingStatus", (data: any) => {
          console.log("会议状态变化:", data);
          if (data.meetingStatus === 3) {
            // 3 表示会议结束
            console.log("会议已结束");
            handleLeaveMeeting();
          }
        });

        // 监听用户离开会议事件
        ZoomMtg.inMeetingServiceListener("onUserLeave", (data: any) => {
          console.log("用户离开会议:", data);
          ZoomMtg.getCurrentUser({
            success: (res: any) => {
              if (data.userId === res.userId) {
                console.log("当前用户离开会议");
                handleLeaveMeeting();
              }
            },
          });
        });
      } catch (error) {
        console.error("加入会议时发生错误:", error);
        setError("加入会议时发生错误");
        setIsLoading(false);
      }
    };

    joinMeeting();
  }, [meetingData, navigate]);

  // 组件卸载时清理 Zoom SDK
  useEffect(() => {
    return () => {
      console.log('ZoomMeeting 组件卸载，清理 Zoom SDK');
      cleanupZoomSDK();
    };
  }, []);

  // 监听页面卸载事件
  useEffect(() => {
    const handleBeforeUnload = () => {
      cleanupZoomSDK();
    };

    const handleUnload = () => {
      cleanupZoomSDK();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 dark:border-green-300"></div>
          <span className="ml-2 dark:text-gray-200">正在加入会议...</span>
        </div>
      </div>
    );
  }

  return <div ref={meetingContainerRef}/>
};

export default ZoomMeeting;
