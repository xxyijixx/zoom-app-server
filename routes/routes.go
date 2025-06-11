package routes

import (
	"zoom-app-server/config"
	"zoom-app-server/handlers"
	"zoom-app-server/middleware"
	"zoom-app-server/services"

	"github.com/gorilla/mux"
)

// SetupRoutes 设置路由
func SetupRoutes(cfg *config.Config) *mux.Router {
	// 创建服务实例
	zoomService := services.NewZoomService(cfg)

	// 创建处理器实例
	zoomHandler := handlers.NewZoomHandler(cfg, zoomService)

	// 创建中间件实例
	dooTaskMiddleware := middleware.NewDooTaskMiddleware(cfg)

	// 创建路由器
	router := mux.NewRouter()

	// 创建需要认证的子路由
	authRouter := router.PathPrefix("/api").Subrouter()
	authRouter.Use(dooTaskMiddleware.AuthMiddleware)

	// 注册需要强制认证的路由
	// 创建会议接口（需要认证）
	authRouter.HandleFunc("/meetings", zoomHandler.HandleCreateMeeting).Methods("POST")

	// 注册可选认证的路由
	// JWT签名生成接口（可选认证）
	authRouter.HandleFunc("/signature", zoomHandler.HandleGenerateSignature).Methods("POST")
	// 获取配置接口（可选认证）
	authRouter.HandleFunc("/config", zoomHandler.HandleGetConfig).Methods("GET")

	return router
}
