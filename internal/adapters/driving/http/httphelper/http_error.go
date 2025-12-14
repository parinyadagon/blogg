package httphelper

import (
	"blogg/utils/errs"
	"errors"
	"net/http"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
)

type ErrorResponseParams struct {
	StatusCode int
	Message    string
	ErrorCode  string
	Details    any
}

type ValidationError struct {
	Field  string `json:"field"`
	Reason string `json:"reason"`
}

func ErrorResponse(c echo.Context, params ErrorResponseParams) error {
	traceID := getOrCreateTraceID(c)

	return c.JSON(params.StatusCode, Response{
		Success: false,
		Code:    params.StatusCode,
		Message: params.Message,
		Data:    nil,
		Error: &ErrorInfo{
			Code:    params.ErrorCode,
			Details: params.Details,
		},
		Meta: &Meta{
			Timestamp: time.Now().UTC().Format(time.RFC3339),
			TraceID:   traceID,
		},
	})
}

func ValidationErrorResponse(c echo.Context, errors []ValidationError) error {
	traceID := getOrCreateTraceID(c)

	return c.JSON(http.StatusBadRequest, Response{
		Success: false,
		Code:    http.StatusBadRequest,
		Message: "Validation failed",
		Data:    nil,
		Error: &ErrorInfo{
			Code:    "VALIDATION_ERROR",
			Details: errors,
		},
		Meta: &Meta{
			Timestamp: time.Now().UTC().Format(time.RFC3339),
			TraceID:   traceID,
		},
	})
}

// HandleServiceError maps service/domain errors to HTTP error responses
func HandleServiceError(c echo.Context, err error) error {
	// Try to unwrap AppError
	var appErr *errs.AppError
	if errors.As(err, &appErr) {
		return ErrorResponse(c, ErrorResponseParams{
			StatusCode: appErr.StatusCode,
			Message:    appErr.Message,
			ErrorCode:  appErr.Code,
			Details:    nil,
		})
	}

	// Default to internal server error for unknown errors
	return ErrorResponse(c, ErrorResponseParams{
		StatusCode: http.StatusInternalServerError,
		Message:    "Internal server error",
		ErrorCode:  "INTERNAL_ERROR",
		Details:    nil,
	})
}

// HandleValidationError handles validator.ValidationErrors
func HandleValidationError(c echo.Context, err error) error {
	ve, ok := err.(validator.ValidationErrors)
	if !ok {
		return ErrorResponse(c, ErrorResponseParams{
			StatusCode: http.StatusBadRequest,
			Message:    "Validation failed",
			ErrorCode:  "VALIDATION_ERROR",
			Details:    err.Error(),
		})
	}

	validationErrors := make([]ValidationError, 0, len(ve))
	for _, fe := range ve {
		validationErrors = append(validationErrors, ValidationError{
			Field:  fe.Field(),
			Reason: FormatValidationMessage(fe.Tag(), fe.Field(), fe.Param()),
		})
	}
	return ValidationErrorResponse(c, validationErrors)
}

// FormatValidationMessage formats validator.FieldError to human readable message
func FormatValidationMessage(tag, field, param string) string {
	// Custom messages per field
	fieldMessages := map[string]map[string]string{
		"Username": {
			"required": "Username is required",
			"min":      "Username must be at least " + param + " characters",
			"max":      "Username must not exceed " + param + " characters",
		},
		"Email": {
			"required": "Email address is required",
			"email":    "Please provide a valid email address",
		},
		"Password": {
			"required": "Password is required",
			"min":      "Password must be at least " + param + " characters",
		},
		"Title": {
			"required": "Title is required",
			"min":      "Title must be at least " + param + " characters",
			"max":      "Title must not exceed " + param + " characters",
		},
		"Slug": {
			"required": "Slug is required",
			"slug":     "Slug must contain only lowercase letters, numbers, and hyphens",
		},
		"Content": {
			"required": "Content is required",
			"min":      "Content must be at least " + param + " characters",
			"max":      "Content must not exceed " + param + " characters",
		},
	}

	// Check if custom message exists
	if fieldMap, exists := fieldMessages[field]; exists {
		if msg, exists := fieldMap[tag]; exists {
			return msg
		}
	}

	// Default fallback messages
	switch tag {
	case "required":
		return field + " is required"
	case "email":
		return "Invalid email format"
	case "min":
		return field + " must be at least " + param + " characters"
	case "max":
		return field + " must not exceed " + param + " characters"
	case "url":
		return field + " must be a valid URL"
	case "uuid":
		return field + " must be a valid UUID"
	default:
		return field + " is invalid"
	}
}
