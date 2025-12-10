package errs

import (
	"fmt"
	"net/http"
)

type AppError struct {
	Code       string
	Message    string
	StatusCode int
	Err        error
}

func (e *AppError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %v", e.Message, e.Err)
	}

	return e.Message
}

func (e *AppError) Unwrap() error {
	return e.Err
}

type Params struct {
	Code       string
	Message    string
	StatusCode int
	Err        error
}

// New creates a new AppError with custom parameters
func New(params Params) *AppError {
	return &AppError{
		Code:       params.Code,
		Message:    params.Message,
		StatusCode: params.StatusCode,
		Err:        params.Err,
	}
}

func NewBadRequestError(message string) *AppError {
	return &AppError{
		Code:       "BAD_REQUEST",
		Message:    message,
		StatusCode: http.StatusBadRequest,
	}
}

func NewNotFoundError(resource string) *AppError {
	return &AppError{
		Code:       "NOT_FOUND",
		Message:    fmt.Sprintf("%s not found", resource),
		StatusCode: http.StatusNotFound,
	}
}

func NewConflictError(message string) *AppError {
	return &AppError{
		Code:       "CONFLICT",
		Message:    message,
		StatusCode: http.StatusConflict,
	}
}

func NewUnauthorizedError(message string) *AppError {
	return &AppError{
		Code:       "UNAUTHORIZE",
		Message:    message,
		StatusCode: http.StatusUnauthorized,
	}
}

func NewInternalError(err error) *AppError {
	return &AppError{
		Code:       "INTERNAL_ERROR",
		Message:    "Internal server error",
		StatusCode: http.StatusInternalServerError,
		Err:        err,
	}
}
