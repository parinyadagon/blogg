package jwthelper

import (
	"errors"
	"os"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var (
	ErrInvalidToken = errors.New("invalid token")
	ErrExpiredToken = errors.New("token has expired")
)

type JWTClaims struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

type JWTManager struct {
	secretKey  string
	expiration time.Duration
}

const (
	DefaultJWTExpiration = 24 * time.Hour
	DefaultJWTSecret     = "default-secret-key-change-in-production"
)

func NewJWTManager(secretKey string, expiration time.Duration) *JWTManager {
	if secretKey == "" {
		secretKey = getEnv("JWT_SECRET", DefaultJWTSecret)
	}
	if expiration <= 0 {
		expiration = getEnvAsDuration("JWT_EXPIRATION", DefaultJWTExpiration)
	}

	return &JWTManager{
		secretKey:  secretKey,
		expiration: expiration,
	}
}

func NewDefaultJWTManager() *JWTManager {
	return NewJWTManager("", 0)
}

func (jm *JWTManager) GenerateToken(userID, username string) (string, error) {
	claims := JWTClaims{
		UserID:   userID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(jm.expiration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(jm.secretKey))
}

func (jm *JWTManager) Validate(tokenString string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return []byte(jm.secretKey), nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrExpiredToken
		}
		return nil, ErrInvalidToken
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, ErrInvalidToken
}

func (jm *JWTManager) RefreshToken(tokenString string) (string, error) {
	claims, err := jm.Validate(tokenString)
	if err != nil && !errors.Is(err, ErrExpiredToken) {
		return "", err
	}

	return jm.GenerateToken(claims.UserID, claims.Username)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsDuration(key string, defaultValue time.Duration) time.Duration {
	valueStr := os.Getenv(key)
	if valueStr == "" {
		return defaultValue
	}

	// Try parsing as duration string (e.g., "24h", "1h30m")
	if duration, err := time.ParseDuration(valueStr); err == nil {
		return duration
	}

	// Try parsing as hours integer (for backward compatibility)
	if hours, err := strconv.Atoi(valueStr); err == nil {
		return time.Duration(hours) * time.Hour
	}

	return defaultValue
}
