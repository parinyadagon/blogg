package http

import (
	"blogg/internal/adapters/driving/http/httphelper"
	"blogg/internal/core/domain"
	"blogg/utils/errs"

	"blogg/internal/core/port"
	"context"
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
)

type AuthHandler struct {
	authService port.AuthServicePort
	validate    *validator.Validate
}

func NewAuthHandler(authService port.AuthServicePort) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		validate:    validator.New(),
	}
}

func (h *AuthHandler) Register(c echo.Context) error {
	var req domain.UserRegisterReq

	// 1. Bind JSON to struct
	if err := c.Bind(&req); err != nil {
		return httphelper.HandleServiceError(
			c,
			errs.NewBadRequestError("Invalid JSON format"),
		)
	}

	// 2. Validate input format (Handler Layer responsibility)
	if err := h.validate.Struct(&req); err != nil {
		ve := err.(validator.ValidationErrors)
		validationErrors := make([]httphelper.ValidationError, 0, len(ve))

		for _, fe := range ve {
			validationErrors = append(validationErrors, httphelper.ValidationError{
				Field:  fe.Field(),
				Reason: httphelper.FormatValidationMessage(fe.Tag(), fe.Field(), fe.Param()),
			})
		}

		return httphelper.ValidationErrorResponse(c, validationErrors)
	}

	// 3. Call service (only business logic happens here)
	result, err := h.authService.Register(context.Background(), &req)
	if err != nil {
		return httphelper.HandleServiceError(c, err)
	}

	return httphelper.SuccessResponse(c, httphelper.SuccessResponseParams{
		StatusCode: http.StatusCreated,
		Message:    "User registered successfully",
		Data:       result,
	})
}

func (h *AuthHandler) Login(c echo.Context) error {
	var req domain.UserLoginReq

	// 1. Bind JSON to struct
	if err := c.Bind(&req); err != nil {
		return httphelper.HandleServiceError(
			c,
			errs.NewBadRequestError("Invalid JSON format"),
		)
	}

	// 2. Validate input format
	if err := h.validate.Struct(&req); err != nil {
		ve := err.(validator.ValidationErrors)
		validationErrors := make([]httphelper.ValidationError, 0, len(ve))

		for _, fe := range ve {
			validationErrors = append(validationErrors, httphelper.ValidationError{
				Field:  fe.Field(),
				Reason: httphelper.FormatValidationMessage(fe.Tag(), fe.Field(), fe.Param()),
			})
		}

		return httphelper.ValidationErrorResponse(c, validationErrors)
	}

	// 3. Call service
	result, err := h.authService.Login(context.Background(), &req)
	if err != nil {
		return httphelper.HandleServiceError(c, err)
	}

	// 4. Set JWT token in HttpOnly cookie
	cookie := &http.Cookie{
		Name:     "auth_token",
		Value:    result.AccessToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   true, // Set to true in production with HTTPS
		SameSite: http.SameSiteStrictMode,
		MaxAge:   86400, // 24 hours
	}
	c.SetCookie(cookie)

	// Return response without token in body (stored in cookie)
	return httphelper.SuccessResponse(c, httphelper.SuccessResponseParams{
		StatusCode: http.StatusOK,
		Message:    "Login successful",
		Data: map[string]interface{}{
			"username": result.Username,
		},
	})
}

func (h *AuthHandler) Logout(c echo.Context) error {
	// Clear the auth cookie
	cookie := &http.Cookie{
		Name:     "auth_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		MaxAge:   -1, // Delete cookie
	}
	c.SetCookie(cookie)

	return httphelper.SuccessResponse(c, httphelper.SuccessResponseParams{
		StatusCode: http.StatusOK,
		Message:    "Logout successful",
		Data:       nil,
	})
}
