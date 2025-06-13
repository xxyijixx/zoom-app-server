package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config 存储应用程序配置
type Config struct {
	ZoomAPIKey    string
	ZoomAPISecret string
	Port          string
	// Server-To-Server OAuth 配置
	ZoomAccountID    string
	ZoomClientID     string
	ZoomClientSecret string
	// 功能开关
	DisableJoinMeeting bool
	// DooTask 验证配置
	DooTaskURL         string
	DooTaskTimeout     int
	DisableDooTaskAuth bool
	// 日志配置
	LogLevel    string
	LogFormat   string
	LogOutput   string
	LogFilePath string
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
		ZoomAccountID:    getEnv("ZOOM_ACCOUNT_ID", ""),
		ZoomClientID:     getEnv("ZOOM_CLIENT_ID", ""),
		ZoomClientSecret: getEnv("ZOOM_CLIENT_SECRET", ""),
		// 功能开关
		DisableJoinMeeting: getEnv("DISABLE_JOIN_MEETING", "false") == "true",
		// DooTask 验证配置
		DooTaskURL:         getEnv("DOOTASK_URL", "http://nginx"),
		DooTaskTimeout:     getEnvAsInt("DOOTASK_TIMEOUT", 10),
		DisableDooTaskAuth: getEnv("DISABLE_DOOTASK_AUTH", "false") == "true",
		// 日志配置
		LogLevel:    getEnv("LOG_LEVEL", "info"),
		LogFormat:   getEnv("LOG_FORMAT", "json"),
		LogOutput:   getEnv("LOG_OUTPUT", "file"),
		LogFilePath: getEnv("LOG_FILE_PATH", "logs/app.log"),
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

// getEnvAsInt 获取整数类型的环境变量，如果不存在或转换失败则返回默认值
func getEnvAsInt(key string, defaultValue int) int {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	if intValue, err := strconv.Atoi(value); err == nil {
		return intValue
	}
	return defaultValue
}
