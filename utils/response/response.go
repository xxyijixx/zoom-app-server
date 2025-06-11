package response

import (
	"encoding/json"
	"net/http"
	"zoom-app-server/models"
)

// WriteSuccess 写入成功响应
func WriteSuccess(w http.ResponseWriter, data interface{}, message ...string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(models.NewSuccessResponse(data, message...))
}

// WriteError 写入错误响应
func WriteError(w http.ResponseWriter, httpStatus int, code int, message string, data ...interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(httpStatus)
	json.NewEncoder(w).Encode(models.NewErrorResponse(code, message, data...))
}

// WriteBadRequest 写入400错误响应
func WriteBadRequest(w http.ResponseWriter, message string, data ...interface{}) {
	WriteError(w, http.StatusBadRequest, 400, message, data...)
}

// WriteInternalError 写入500错误响应
func WriteInternalError(w http.ResponseWriter, message string, data ...interface{}) {
	WriteError(w, http.StatusInternalServerError, 500, message, data...)
}

// WriteUnauthorized 写入401错误响应
func WriteUnauthorized(w http.ResponseWriter, message string, data ...interface{}) {
	WriteError(w, http.StatusUnauthorized, 401, message, data...)
}

// WriteForbidden 写入403错误响应
func WriteForbidden(w http.ResponseWriter, message string, data ...interface{}) {
	WriteError(w, http.StatusForbidden, 403, message, data...)
}

// WriteNotFound 写入404错误响应
func WriteNotFound(w http.ResponseWriter, message string, data ...interface{}) {
	WriteError(w, http.StatusNotFound, 404, message, data...)
}