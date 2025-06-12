package middleware

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
	
	"github.com/sirupsen/logrus"
	"zoom-app-server/config"
	"zoom-app-server/utils/common"
	"zoom-app-server/utils/logger"
)

// DooTaskAuthResponse DooTask验证响应结构
type DooTaskAuthResponse struct {
	Ret  int    `json:"ret"`
	Msg  string `json:"msg"`
	Data struct {
		UserID   int    `json:"userid"`
		Username string `json:"username"`
		Nickname string `json:"nickname"`
		Email    string `json:"email"`
	} `json:"data"`
}

// UserInfoResp 返回用户信息
type UserInfoResp struct {
	*UserBasicResp
	Token            string   `json:"token"`             // token
	Identity         []string `json:"identity"`          // 身份
	Tel              string   `json:"tel"`               // 手机号
	Changepass       int      `json:"changepass"`        // 是否需要修改密码 1-是 0-否
	CreatedIp        string   `json:"created_ip"`        // 创建ip
	EmailVerity      int      `json:"email_verity"`      // 邮箱是否验证 1-是 0-否
	LastAt           string   `json:"last_at"`           // 最后登录时间
	LastIp           string   `json:"last_ip"`           // 最后登录ip
	LineIp           string   `json:"line_ip"`           // 在线ip
	LoginNum         int      `json:"login_num"`         // 登录次数
	NicknameOriginal string   `json:"nickname_original"` // 昵称原始值
	TaskDialogId     int      `json:"task_dialog_id"`    // 任务对话框id
	CreatedAt        string   `json:"created_at"`        // 创建时间
	DepartmentOwner  bool     `json:"department_owner"`  // 是否是部门负责人 false-不是 true-是
	OkrAdminOwner    bool     `json:"okr_admin_owner"`   // okr普通人员是否拥有管理员有权限 false-不是 true-是
}

// 用户基础信息
type UserBasicResp struct {
	Az             string `json:"az"`              // 首字母
	Bot            int    `json:"bot"`             // 是否是机器人 1-是 0-否
	Department     []int  `json:"department"`      // 部门
	DepartmentName string `json:"department_name"` // 部门名称
	DisableAt      string `json:"disable_at"`      // 禁用时间
	Userid         int    `json:"userid"`          // 用户id
	Nickname       string `json:"nickname"`        // 昵称
	Userimg        string `json:"userimg"`         // 头像
	Email          string `json:"email"`           // 邮箱
	LineAt         string `json:"line_at"`         // 在线时间
	Pinyin         string `json:"pinyin"`          // 拼音
	Profession     string `json:"profession"`      // 职业
}

// 判断是否是管理员
func (u *UserInfoResp) IsAdmin() bool {
	for _, v := range u.Identity {
		if v == "admin" {
			return true
		}
	}
	return false
}

// DooTaskMiddleware DooTask验证中间件
type DooTaskMiddleware struct {
	cfg *config.Config
}

// NewDooTaskMiddleware 创建新的DooTask中间件实例
func NewDooTaskMiddleware(cfg *config.Config) *DooTaskMiddleware {
	return &DooTaskMiddleware{
		cfg: cfg,
	}
}

// AuthMiddleware DooTask认证中间件
func (m *DooTaskMiddleware) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		logger.WithFields(logrus.Fields{
			"method": r.Method,
			"path":   r.URL.Path,
			"remote": r.RemoteAddr,
		}).Debug("Processing DooTask auth middleware")
		
		// 如果禁用了DooTask验证，直接通过
		if m.cfg.DisableDooTaskAuth {
			logger.Debug("DooTask auth disabled, skipping validation")
			next.ServeHTTP(w, r)
			return
		}

		// 从Header或查询参数获取token
		token := m.extractToken(r)
		if token == "" {
			m.respondWithError(w, "Token is required", http.StatusUnauthorized)
			return
		}

		// 验证token
		logger.WithField("token_length", len(token)).Debug("Validating DooTask token")
		userInfo, err := m.validateToken(token)
		if err != nil {
			logger.WithError(err).Error("DooTask token validation failed")
			m.respondWithError(w, "Invalid token", http.StatusUnauthorized)
			return
		}
		
		logger.WithFields(logrus.Fields{
			"user_id": userInfo.Userid,
			"nickname": userInfo.Nickname,
			"email": userInfo.Email,
		}).Info("DooTask token validation successful")

		// // 将用户信息添加到请求上下文中
		r.Header.Set("X-User-ID", fmt.Sprintf("%d", userInfo.Userid))
		// r.Header.Set("X-Username", userInfo.Data.Username)
		// r.Header.Set("X-Nickname", userInfo.Data.Nickname)
		// r.Header.Set("X-Email", userInfo.Data.Email)

		// 继续处理请求
		next.ServeHTTP(w, r)
	})
}

// extractToken 从请求中提取token
func (m *DooTaskMiddleware) extractToken(r *http.Request) string {
	// 首先尝试从Header中获取
	token := r.Header.Get("Token")
	if token != "" {
		return token
	}

	// 然后尝试从Authorization Header中获取（Bearer格式）
	auth := r.Header.Get("Authorization")
	if auth != "" && strings.HasPrefix(auth, "Bearer ") {
		return strings.TrimPrefix(auth, "Bearer ")
	}

	// 最后尝试从查询参数中获取
	return r.URL.Query().Get("token")
}

// validateToken 验证token
func (m *DooTaskMiddleware) validateToken(token string) (*UserInfoResp, error) {
	// 构建验证URL
	validateURL := fmt.Sprintf("%s%s?token=%s", m.cfg.DooTaskURL, "/api/user/info", token)
	
	logger.WithFields(logrus.Fields{
		"dootask_url": m.cfg.DooTaskURL,
		"timeout": m.cfg.DooTaskTimeout,
	}).Debug("Sending token validation request to DooTask")

	// 创建HTTP客户端
	client := &http.Client{
		Timeout: time.Duration(m.cfg.DooTaskTimeout) * time.Second,
	}

	// 发送验证请求
	resp, err := client.Get(validateURL)
	if err != nil {
		logger.WithError(err).WithField("dootask_url", m.cfg.DooTaskURL).Error("Failed to send validation request to DooTask")
		return nil, fmt.Errorf("failed to validate token: %w", err)
	}
	defer resp.Body.Close()
	result, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	info, err := m.UnmarshalAndCheckResponse(result)
	if err != nil {
		return nil, err
	}
	userInfo := new(UserInfoResp)
	if err := common.MapToStruct(info, userInfo); err != nil {
		return nil, err
	}

	return userInfo, nil
}

// respondWithError 返回错误响应
func (m *DooTaskMiddleware) respondWithError(w http.ResponseWriter, message string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	errorResp := map[string]interface{}{
		"error":   true,
		"message": message,
		"code":    statusCode,
	}

	json.NewEncoder(w).Encode(errorResp)
}

// 解码并检查返回数据
func (d *DooTaskMiddleware) UnmarshalAndCheckResponse(resp []byte) (map[string]interface{}, error) {
	var ret map[string]interface{}
	if err := json.Unmarshal(resp, &ret); err != nil {
		// return nil, e.NewErrorWithDetail(constant.ErrDooTaskUnmarshalResponse, err, nil)
		return nil, errors.New("ErrDooTaskUnmarshalResponse")
	}

	retCode, ok := ret["ret"].(float64)
	if !ok {
		return nil, errors.New("ErrDooTaskResponseFormat")
	}

	if retCode != 1 {
		msg, ok := ret["msg"].(string)
		if !ok {
			return nil, errors.New("ErrDooTaskRequestFailed")
		}
		// return nil, e.NewErrorWithDetail("ErrDooTaskRequestFailedWithErr, msg, nil)
		return nil, errors.New("ErrDooTaskRequestFailedWithErr " + msg)
	}

	data, ok := ret["data"].(map[string]interface{})
	if !ok {
		dataList, isList := ret["data"].([]interface{})
		if !isList {
			return nil, errors.New("ErrDooTaskDataFormat")
		}

		data = make(map[string]interface{})
		data["list"] = dataList
	}

	return data, nil
}
