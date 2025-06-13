package models

import "time"

// CommonResponse 通用API响应结构
type CommonResponse struct {
	Code    int         `json:"code"`    // 状态码：200成功，其他为错误码
	Message string      `json:"message"` // 响应消息
	Data    interface{} `json:"data"`    // 响应数据
	Success bool        `json:"success"` // 是否成功
}

// NewSuccessResponse 创建成功响应
func NewSuccessResponse(data interface{}, message ...string) *CommonResponse {
	msg := "操作成功"
	if len(message) > 0 && message[0] != "" {
		msg = message[0]
	}
	return &CommonResponse{
		Code:    200,
		Message: msg,
		Data:    data,
		Success: true,
	}
}

// NewErrorResponse 创建错误响应
func NewErrorResponse(code int, message string, data ...interface{}) *CommonResponse {
	var responseData interface{}
	if len(data) > 0 {
		responseData = data[0]
	}
	return &CommonResponse{
		Code:    code,
		Message: message,
		Data:    responseData,
		Success: false,
	}
}

// ZoomSignatureRequest JWT签名请求
type ZoomSignatureRequest struct {
	MeetingNumber string `json:"meetingNumber"`
	Role          int    `json:"role"`
}

// ZoomSignatureResponse JWT签名响应
type ZoomSignatureResponse struct {
	Signature string `json:"signature"`
}

// ConfigResponse 配置响应
type ConfigResponse struct {
	DisableJoinMeeting bool `json:"disable_join_meeting"`
}

// OAuthTokenResponse OAuth令牌响应
type OAuthTokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
	Scope       string `json:"scope"`
}

// CreateMeetingRequest 创建会议请求
type CreateMeetingRequest struct {
	Topic      string           `json:"topic"`
	Type       int              `json:"type"`
	StartTime  string           `json:"start_time,omitempty"`
	Duration   int              `json:"duration,omitempty"`
	Timezone   string           `json:"timezone,omitempty"`
	Password   string           `json:"password,omitempty"`
	Agenda     string           `json:"agenda,omitempty"`
	Settings   *MeetingSettings `json:"settings,omitempty"`
}

// MeetingSettings 会议设置
type MeetingSettings struct {
	HostVideo        bool `json:"host_video,omitempty"`
	ParticipantVideo bool `json:"participant_video,omitempty"`
	JoinBeforeHost   bool `json:"join_before_host,omitempty"`
	MuteUponEntry    bool `json:"mute_upon_entry,omitempty"`
	WaitingRoom      bool `json:"waiting_room,omitempty"`
}

// CreateMeetingResponse 创建会议响应
type CreateMeetingResponse struct {
	UUID              string           `json:"uuid"`
	ID                int64            `json:"id"`
	HostID            string           `json:"host_id"`
	HostEmail         string           `json:"host_email"`
	Topic             string           `json:"topic"`
	Type              int              `json:"type"`
	Status            string           `json:"status"`
	StartTime         time.Time        `json:"start_time"`
	Duration          int              `json:"duration"`
	Timezone          string           `json:"timezone"`
	CreatedAt         time.Time        `json:"created_at"`
	JoinURL           string           `json:"join_url"`
	Password          string           `json:"password"`
	H323Password      string           `json:"h323_password"`
	PSTNPassword      string           `json:"pstn_password"`
	EncryptedPassword string           `json:"encrypted_password"`
	Settings          *MeetingSettings `json:"settings"`
}

// JWTHeader JWT头部
type JWTHeader struct {
	Alg string `json:"alg"`
	Typ string `json:"typ"`
}

// JWTPayload JWT负载
type JWTPayload struct {
	Iss  string `json:"iss"`
	Exp  int64  `json:"exp"`
	Mn   string `json:"mn"`
	Role int    `json:"role"`
}