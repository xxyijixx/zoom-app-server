package services

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"zoom-app-server/config"
	"zoom-app-server/models"
)

// ZoomService Zoom服务
type ZoomService struct {
	cfg *config.Config
}

// NewZoomService 创建新的Zoom服务实例
func NewZoomService(cfg *config.Config) *ZoomService {
	return &ZoomService{
		cfg: cfg,
	}
}

// GenerateSignature 生成Zoom JWT签名
func (z *ZoomService) GenerateSignature(meetingNumber string, role int) (string, error) {
	// 创建JWT头部
	header := models.JWTHeader{
		Alg: "HS256",
		Typ: "JWT",
	}
	headerJSON, err := json.Marshal(header)
	if err != nil {
		return "", err
	}
	headerBase64 := base64.RawURLEncoding.EncodeToString(headerJSON)

	// 创建JWT负载
	payload := models.JWTPayload{
		Iss:  z.cfg.ZoomAPIKey,
		Exp:  time.Now().Add(time.Hour * 24).Unix(),
		Mn:   meetingNumber,
		Role: role,
	}
	payloadJSON, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}
	payloadBase64 := base64.RawURLEncoding.EncodeToString(payloadJSON)

	// 组合头部和负载
	message := headerBase64 + "." + payloadBase64

	// 使用HMAC SHA256创建签名
	h := hmac.New(sha256.New, []byte(z.cfg.ZoomAPISecret))
	h.Write([]byte(message))
	signature := base64.RawURLEncoding.EncodeToString(h.Sum(nil))

	// 返回完整的JWT
	return message + "." + signature, nil
}

// GetOAuthToken 获取OAuth访问令牌
func (z *ZoomService) GetOAuthToken() (*models.OAuthTokenResponse, error) {
	tokenURL := "https://zoom.us/oauth/token"
	
	data := url.Values{}
	data.Set("grant_type", "account_credentials")
	data.Set("account_id", z.cfg.ZoomAccountID)
	
	req, err := http.NewRequest("POST", tokenURL, strings.NewReader(data.Encode()))
	if err != nil {
		return nil, err
	}
	
	// 设置Basic Auth
	auth := base64.StdEncoding.EncodeToString([]byte(z.cfg.ZoomClientID + ":" + z.cfg.ZoomClientSecret))
	req.Header.Set("Authorization", "Basic "+auth)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("failed to get OAuth token: %s, response: %s", resp.Status, string(body))
	}
	
	var tokenResp models.OAuthTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return nil, err
	}
	
	return &tokenResp, nil
}

// CreateMeeting 创建Zoom会议
func (z *ZoomService) CreateMeeting(accessToken string, meetingReq *models.CreateMeetingRequest) (*models.CreateMeetingResponse, error) {
	createURL := "https://api.zoom.us/v2/users/me/meetings"
	
	jsonData, err := json.Marshal(meetingReq)
	if err != nil {
		return nil, err
	}
	
	req, err := http.NewRequest("POST", createURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}
	
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Content-Type", "application/json")
	
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("failed to create meeting: %s, response: %s", resp.Status, string(body))
	}
	
	var meetingResp models.CreateMeetingResponse
	if err := json.NewDecoder(resp.Body).Decode(&meetingResp); err != nil {
		return nil, err
	}
	
	return &meetingResp, nil
}