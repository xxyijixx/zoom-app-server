package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config 存储应用程序配置
type Config struct {
	ZoomAPIKey    string
	ZoomAPISecret string
	Port          string
	// Server-To-Server OAuth 配置
	ZoomAccountID     string
	ZoomClientID      string
	ZoomClientSecret  string
	// 功能开关
	DisableJoinMeeting bool
}

// LoadConfig 从环境变量加载配置
func LoadConfig() *Config {
	// 尝试加载 .env 文件
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	config := &Config{
		ZoomAPIKey:    getEnv("ZOOM_API_KEY", ""),
		ZoomAPISecret: getEnv("ZOOM_API_SECRET", ""),
		Port:          getEnv("PORT", "8080"),
		// Server-To-Server OAuth 配置
		ZoomAccountID:     getEnv("ZOOM_ACCOUNT_ID", ""),
		ZoomClientID:      getEnv("ZOOM_CLIENT_ID", ""),
		ZoomClientSecret:  getEnv("ZOOM_CLIENT_SECRET", ""),
		// 功能开关
		DisableJoinMeeting: getEnv("DISABLE_JOIN_MEETING", "false") == "true",
	}
	if !config.DisableJoinMeeting {
// 验证必要的配置
if config.ZoomAPIKey == "" || config.ZoomAPISecret == "" {
	log.Fatal("ZOOM_API_KEY and ZOOM_API_SECRET must be set")
}
	}
	
	
	// 验证Server-To-Server OAuth配置（用于创建会议）
	if config.ZoomAccountID == "" || config.ZoomClientID == "" || config.ZoomClientSecret == "" {
		log.Println("Warning: ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET should be set for Server-To-Server OAuth")
	}

	return config
}

// getEnv 获取环境变量，如果不存在则返回默认值
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
