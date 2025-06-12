package main

import (
	"net/http"

	"github.com/sirupsen/logrus"
	"zoom-app-server/config"
	"zoom-app-server/routes"
	"zoom-app-server/utils/logger"
)

func main() {
	// 加载配置
	cfg := config.LoadConfig()

	// 初始化日志器
	logConfig := &logger.LogConfig{
		Level:    cfg.LogLevel,
		Format:   cfg.LogFormat,
		Output:   cfg.LogOutput,
		FilePath: cfg.LogFilePath,
	}
	logger.InitLogger(logConfig)

	// 设置路由
	router := routes.SetupRoutes(cfg)

	logger.Infof("Server starting on port %s", cfg.Port)
	logger.Info("Available endpoints:")
	logger.Info("  POST /api/signature - Generate Zoom signature (JWT)")
	logger.Info("  POST /api/meetings - Create Zoom meeting (OAuth)")
	logger.Info("  GET /api/config - Get server configuration")
	
	logger.WithFields(logrus.Fields{
		"port": cfg.Port,
		"log_level": cfg.LogLevel,
		"log_format": cfg.LogFormat,
	}).Info("Server configuration loaded")
	
	if err := http.ListenAndServe(":"+cfg.Port, router); err != nil {
		logger.WithError(err).Fatal("Failed to start server")
	}
}
