package main

import (
	"log"
	"net/http"

	"zoom-app-server/config"
	"zoom-app-server/routes"
)

func main() {
	// 加载配置
	cfg := config.LoadConfig()

	// 设置路由
	router := routes.SetupRoutes(cfg)

	log.Printf("Server starting on port %s", cfg.Port)
	log.Printf("Available endpoints:")
	log.Printf("  POST /api/signature - Generate Zoom signature (JWT)")
	log.Printf("  POST /api/meetings - Create Zoom meeting (OAuth)")
	log.Printf("  GET /api/config - Get server configuration")
	log.Fatal(http.ListenAndServe(":"+cfg.Port, router))
}
