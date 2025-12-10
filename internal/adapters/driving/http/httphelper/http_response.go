package httphelper

import (
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type Response struct {
	Success bool       `json:"success"`
	Code    int        `json:"code"`
	Message string     `json:"message"`
	Data    any        `json:"data,omitempty"`
	Meta    *Meta      `json:"meta,omitempty"`
	Error   *ErrorInfo `json:"error,omitempty"`
}

type Meta struct {
	Timestamp  string      `json:"timestamp"`
	TraceID    string      `json:"trace_id,omitempty"`
	Pagination *Pagination `json:"pagination,omitempty"`
}

type Pagination struct {
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	TotalItems int `json:"total_items"`
	TotalPages int `json:"total_pages"`
}

type ErrorInfo struct {
	Code    string `json:"code"`
	Details any    `json:"details,omitempty"`
	HelpURL string `json:"help_url,omitempty"`
}

type SuccessResponseParams struct {
	StatusCode int
	Message    string
	Data       any
}

type SuccessListResponseParams struct {
	StatusCode int
	Message    string
	Data       any
	Pagination *Pagination
}

func SuccessResponse(c echo.Context, params SuccessResponseParams) error {
	traceID := getOrCreateTraceID(c)

	return c.JSON(params.StatusCode, Response{
		Success: true,
		Code:    params.StatusCode,
		Message: params.Message,
		Data:    params.Data,
		Meta: &Meta{
			Timestamp: time.Now().UTC().Format(time.RFC3339),
			TraceID:   traceID,
		},
	})
}

func SuccessListResponse(c echo.Context, params SuccessListResponseParams) error {
	traceID := getOrCreateTraceID(c)

	return c.JSON(params.StatusCode, Response{
		Success: true,
		Code:    params.StatusCode,
		Message: params.Message,
		Data:    params.Data,
		Meta: &Meta{
			Timestamp:  time.Now().UTC().Format(time.RFC3339),
			TraceID:    traceID,
			Pagination: params.Pagination,
		},
	})
}

// CalculatePagination calculates pagination metadata
func CalculatePagination(page, limit, totalItems int) *Pagination {
	totalPages := (totalItems + limit - 1) / limit

	return &Pagination{
		Page:       page,
		Limit:      limit,
		TotalItems: totalItems,
		TotalPages: totalPages,
	}
}

// getOrCreateTraceID retrieves or creates a trace ID for request tracking
func getOrCreateTraceID(c echo.Context) string {
	// Try to get from header first (if forwarded from gateway/proxy)
	traceID := c.Request().Header.Get("X-Trace-ID")
	if traceID == "" {
		// Generate new trace ID
		traceID = uuid.New().String()
		c.Set("trace_id", traceID)
	}
	return traceID
}
