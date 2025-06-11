package routes

import (
	"zoom-app-server/config"
	"zoom-app-server/handlers"
	"zoom-app-server/services"

	"github.com/gorilla/mux"
)

// SetupRoutes 设置路由
func SetupRoutes(cfg *config.Config) *mux.Router {
	// 创建服务实例
	zoomService := services.NewZoomService(cfg)
	
	// 创建处理器实例
	zoomHandler := handlers.NewZoomHandler(cfg, zoomService)
	
	// 创建路由器
	router := mux.NewRouter()
	
	// 注册路由
	// JWT签名生成接口（原有功能）
	router.HandleFunc("/api/signature", zoomHandler.HandleGenerateSignature).Methods("POST")
	// 创建会议接口（新增功能）
	router.HandleFunc("/api/meetings", zoomHandler.HandleCreateMeeting).Methods("POST")
	// 获取配置接口
	router.HandleFunc("/api/config", zoomHandler.HandleGetConfig).Methods("GET")
	
	return router
}