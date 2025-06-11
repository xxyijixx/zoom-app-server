package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"zoom-app-server/config"
	"zoom-app-server/models"
	"zoom-app-server/services"
)

// ZoomHandler Zoom处理器
type ZoomHandler struct {
	cfg         *config.Config
	zoomService *services.ZoomService
}

// NewZoomHandler 创建新的Zoom处理器实例
func NewZoomHandler(cfg *config.Config, zoomService *services.ZoomService) *ZoomHandler {
	return &ZoomHandler{
		cfg:         cfg,
		zoomService: zoomService,
	}
}

// HandleGenerateSignature 处理生成签名请求
func (h *ZoomHandler) HandleGenerateSignature(w http.ResponseWriter, r *http.Request) {
	var req models.ZoomSignatureRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	signature, err := h.zoomService.GenerateSignature(req.MeetingNumber, req.Role)
	if err != nil {
		http.Error(w, "Failed to generate signature", http.StatusInternalServerError)
		return
	}

	response := models.ZoomSignatureResponse{
		Signature: signature,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// HandleGetConfig 处理获取配置请求
func (h *ZoomHandler) HandleGetConfig(w http.ResponseWriter, r *http.Request) {
	response := models.ConfigResponse{
		DisableJoinMeeting: h.cfg.DisableJoinMeeting,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// HandleCreateMeeting 处理创建会议请求
func (h *ZoomHandler) HandleCreateMeeting(w http.ResponseWriter, r *http.Request) {
	var req models.CreateMeetingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	// 验证必要的OAuth配置
	if h.cfg.ZoomAccountID == "" || h.cfg.ZoomClientID == "" || h.cfg.ZoomClientSecret == "" {
		http.Error(w, "Server-To-Server OAuth not configured", http.StatusInternalServerError)
		return
	}
	
	// 设置默认值
	if req.Duration == 0 {
		req.Duration = 60 // 默认60分钟
	}
	if req.Timezone == "" {
		req.Timezone = "Asia/Shanghai" // 默认北京时间
	}
	
	// 添加默认会议设置
	if req.Settings == nil {
		req.Settings = &models.MeetingSettings{
			HostVideo:        true,
			ParticipantVideo: true,
			JoinBeforeHost:   false,
			MuteUponEntry:    true,
			WaitingRoom:      false,
		}
	}
	
	// 获取访问令牌
	tokenResp, err := h.zoomService.GetOAuthToken()
	if err != nil {
		log.Printf("Failed to get OAuth token: %v", err)
		http.Error(w, "Failed to authenticate with Zoom", http.StatusInternalServerError)
		return
	}
	
	// 创建会议
	meetingResp, err := h.zoomService.CreateMeeting(tokenResp.AccessToken, &req)
	if err != nil {
		log.Printf("Failed to create meeting: %v", err)
		http.Error(w, "Failed to create meeting", http.StatusInternalServerError)
		return
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(meetingResp)
}