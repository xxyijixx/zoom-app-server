package logger

import (
	"os"
	"path/filepath"
	"time"

	"github.com/sirupsen/logrus"
)

var Logger *logrus.Logger

// LogConfig 日志配置
type LogConfig struct {
	Level      string // 日志级别: debug, info, warn, error
	Format     string // 日志格式: json, text
	Output     string // 输出方式: stdout, file, both
	FilePath   string // 日志文件路径
	MaxSize    int    // 单个日志文件最大大小(MB)
	MaxBackups int    // 保留的旧日志文件数量
	MaxAge     int    // 保留日志文件的最大天数
}

// InitLogger 初始化日志器
func InitLogger(config *LogConfig) {
	Logger = logrus.New()

	// 设置日志级别
	switch config.Level {
	case "debug":
		Logger.SetLevel(logrus.DebugLevel)
	case "info":
		Logger.SetLevel(logrus.InfoLevel)
	case "warn":
		Logger.SetLevel(logrus.WarnLevel)
	case "error":
		Logger.SetLevel(logrus.ErrorLevel)
	default:
		Logger.SetLevel(logrus.InfoLevel)
	}

	// 设置日志格式
	if config.Format == "json" {
		Logger.SetFormatter(&logrus.JSONFormatter{
			TimestampFormat: time.RFC3339,
		})
	} else {
		Logger.SetFormatter(&logrus.TextFormatter{
			FullTimestamp:   true,
			TimestampFormat: "2006-01-02 15:04:05",
		})
	}

	// 设置输出
	switch config.Output {
	case "file":
		setupFileOutput(config)
	case "both":
		setupFileOutput(config)
		// 同时输出到控制台和文件
	default:
		// 默认输出到控制台
		Logger.SetOutput(os.Stdout)
	}

	// 添加调用者信息
	Logger.SetReportCaller(true)
}

// setupFileOutput 设置文件输出
func setupFileOutput(config *LogConfig) {
	if config.FilePath == "" {
		config.FilePath = "logs/app.log"
	}

	// 确保日志目录存在
	logDir := filepath.Dir(config.FilePath)
	if err := os.MkdirAll(logDir, 0755); err != nil {
		logrus.Fatalf("Failed to create log directory: %v", err)
	}

	// 打开日志文件
	logFile, err := os.OpenFile(config.FilePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		logrus.Fatalf("Failed to open log file: %v", err)
	}

	Logger.SetOutput(logFile)
}

// GetDefaultConfig 获取默认日志配置
func GetDefaultConfig() *LogConfig {
	return &LogConfig{
		Level:      "info",
		Format:     "text",
		Output:     "stdout",
		FilePath:   "logs/app.log",
		MaxSize:    100,
		MaxBackups: 3,
		MaxAge:     7,
	}
}

// Debug 记录调试信息
func Debug(args ...interface{}) {
	Logger.Debug(args...)
}

// Debugf 格式化记录调试信息
func Debugf(format string, args ...interface{}) {
	Logger.Debugf(format, args...)
}

// Info 记录信息
func Info(args ...interface{}) {
	Logger.Info(args...)
}

// Infof 格式化记录信息
func Infof(format string, args ...interface{}) {
	Logger.Infof(format, args...)
}

// Warn 记录警告
func Warn(args ...interface{}) {
	Logger.Warn(args...)
}

// Warnf 格式化记录警告
func Warnf(format string, args ...interface{}) {
	Logger.Warnf(format, args...)
}

// Error 记录错误
func Error(args ...interface{}) {
	Logger.Error(args...)
}

// Errorf 格式化记录错误
func Errorf(format string, args ...interface{}) {
	Logger.Errorf(format, args...)
}

// Fatal 记录致命错误并退出程序
func Fatal(args ...interface{}) {
	Logger.Fatal(args...)
}

// Fatalf 格式化记录致命错误并退出程序
func Fatalf(format string, args ...interface{}) {
	Logger.Fatalf(format, args...)
}

// WithField 添加字段
func WithField(key string, value interface{}) *logrus.Entry {
	return Logger.WithField(key, value)
}

// WithFields 添加多个字段
func WithFields(fields logrus.Fields) *logrus.Entry {
	return Logger.WithFields(fields)
}

// WithError 添加错误字段
func WithError(err error) *logrus.Entry {
	return Logger.WithError(err)
}