package middleware

import (
	"blogg/internal/adapters/driving/http/httphelper"
	"blogg/utils/errs"
	jwthelper "blogg/utils/jwt"
	"strings"

	"github.com/labstack/echo/v4"
)

type AuthMiddleware struct {
	jwtManager *jwthelper.JWTManager
}

func NewAuthMiddleware(jwtManager *jwthelper.JWTManager) *AuthMiddleware {
	return &AuthMiddleware{
		jwtManager: jwtManager,
	}
}

// RequireAuth middleware validates JWT token from cookie
func (m *AuthMiddleware) RequireAuth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		// Try to get token from cookie first
		cookie, err := c.Cookie("auth_token")
		var token string

		if err == nil && cookie.Value != "" {
			token = cookie.Value
		} else {
			// Fallback: Try Authorization header
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" {
				return httphelper.HandleServiceError(c, errs.NewUnauthorizedError("Missing authentication token"))
			}

			// Extract Bearer token
			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				return httphelper.HandleServiceError(c, errs.NewUnauthorizedError("Invalid authorization header format"))
			}
			token = parts[1]
		}

		// Validate token
		claims, err := m.jwtManager.Validate(token)
		if err != nil {
			return httphelper.HandleServiceError(c, errs.NewUnauthorizedError("Invalid or expired token"))
		}

		// Store user info in context
		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)

		return next(c)
	}
}

// OptionalAuth middleware validates token if present but doesn't require it
func (m *AuthMiddleware) OptionalAuth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		cookie, err := c.Cookie("auth_token")
		if err == nil && cookie.Value != "" {
			claims, err := m.jwtManager.Validate(cookie.Value)
			if err == nil {
				c.Set("user_id", claims.UserID)
				c.Set("username", claims.Username)
			}
		}
		return next(c)
	}
}
