package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/sirupsen/logrus"
	"zoom-app-server/config"
	"zoom-app-server/models"
	"zoom-app-server/services"
	"zoom-app-server/utils/logger"
	"zoom-app-server/utils/response"
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
	logger.WithFields(logrus.Fields{
		"method": r.Method,
		"path":   r.URL.Path,
		"remote": r.RemoteAddr,
	}).Info("Handling generate signature request")
	
	var req models.ZoomSignatureRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logger.WithError(err).Error("Failed to decode signature request")
		response.WriteBadRequest(w, "请求参数格式错误")
		return
	}

	logger.WithFields(logrus.Fields{
		"meeting_number": req.MeetingNumber,
		"role":           req.Role,
	}).Debug("Generating signature for meeting")

	signature, err := h.zoomService.GenerateSignature(req.MeetingNumber, req.Role)
	if err != nil {
		logger.WithError(err).WithFields(logrus.Fields{
			"meeting_number": req.MeetingNumber,
			"role":           req.Role,
		}).Error("Failed to generate signature")
		response.WriteInternalError(w, "生成签名失败")
		return
	}

	responseData := models.ZoomSignatureResponse{
		Signature: signature,
	}

	logger.WithField("meeting_number", req.MeetingNumber).Info("Signature generated successfully")
	response.WriteSuccess(w, responseData, "签名生成成功")
}

// HandleGetConfig 处理获取配置请求
func (h *ZoomHandler) HandleGetConfig(w http.ResponseWriter, r *http.Request) {
	logger.WithFields(logrus.Fields{
		"method": r.Method,
		"path":   r.URL.Path,
		"remote": r.RemoteAddr,
	}).Info("Handling get config request")
	
	responseData := models.ConfigResponse{
		DisableJoinMeeting: h.cfg.DisableJoinMeeting,
	}

	logger.Debug("Config retrieved successfully")
	response.WriteSuccess(w, responseData, "获取配置成功")
}

// HandleCreateMeeting 处理创建会议请求
func (h *ZoomHandler) HandleCreateMeeting(w http.ResponseWriter, r *http.Request) {
	logger.WithFields(logrus.Fields{
		"method": r.Method,
		"path":   r.URL.Path,
		"remote": r.RemoteAddr,
	}).Info("Handling create meeting request")
	
	var req models.CreateMeetingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		logger.WithError(err).Error("Failed to decode create meeting request")
		response.WriteBadRequest(w, "请求参数格式错误")
		return
	}
	
	// 验证必要的OAuth配置
	if h.cfg.ZoomAccountID == "" || h.cfg.ZoomClientID == "" || h.cfg.ZoomClientSecret == "" {
		response.WriteInternalError(w, "服务器OAuth配置未完成")
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
	logger.Debug("Getting OAuth token for meeting creation")
	tokenResp, err := h.zoomService.GetOAuthToken()
	if err != nil {
		logger.WithError(err).Error("Failed to get OAuth token")
		response.WriteInternalError(w, "Zoom认证失败")
		return
	}
	
	// 创建会议
	logger.WithFields(logrus.Fields{
		"topic":    req.Topic,
		"duration": req.Duration,
		"timezone": req.Timezone,
	}).Info("Creating Zoom meeting")
	meetingResp, err := h.zoomService.CreateMeeting(tokenResp.AccessToken, &req)
	if err != nil {
		logger.WithError(err).WithField("topic", req.Topic).Error("Failed to create meeting")
		response.WriteInternalError(w, "创建会议失败")
		return
	}
	
	logger.WithFields(logrus.Fields{
		"meeting_id": meetingResp.ID,
		"topic":      meetingResp.Topic,
		"join_url":   meetingResp.JoinURL,
	}).Info("Meeting created successfully")
	
	response.WriteSuccess(w, meetingResp, "会议创建成功")
}