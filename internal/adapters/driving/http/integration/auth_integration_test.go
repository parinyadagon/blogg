//go:build integration

package integration

import (
	httpAdapter "blogg/internal/adapters/driving/http"
	"blogg/internal/core/domain"
	"blogg/internal/core/service"
	"blogg/mocks"
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func setupTestServer(t *testing.T) (*echo.Echo, *mocks.MockAuthRepositoryPort) {
	mockRepo := mocks.NewMockAuthRepositoryPort(t)
	authService := service.NewAuthService(mockRepo)
	authHandler := httpAdapter.NewAuthHandler(authService)

	// Create mock post repository and handler for router
	mockPostRepo := mocks.NewMockPostRepositoryPort(t)
	postService := service.NewPostService(mockPostRepo)
	postHandler := httpAdapter.NewPostHandler(postService)

	router := httpAdapter.NewRouter(authHandler, postHandler)
	router.SetupRoutes()

	return router.GetEcho(), mockRepo
}

func TestIntegration_UserRegister(t *testing.T) {
	tests := []struct {
		name           string
		payload        interface{}
		setupMock      func(m *mocks.MockAuthRepositoryPort)
		expectedStatus int
		validateBody   func(t *testing.T, body map[string]interface{})
	}{
		{
			name: "successfully register new user",
			payload: domain.UserRegisterReq{
				Username: "newuser",
				Email:    "newuser@example.com",
				Password: "password123",
			},
			setupMock: func(m *mocks.MockAuthRepositoryPort) {
				m.On("FindUserByUsername", mock.Anything, "newuser").Return((*domain.User)(nil), sql.ErrNoRows).Once()
				m.On("FindUserByEmail", mock.Anything, "newuser@example.com").Return((*domain.User)(nil), sql.ErrNoRows).Once()
				m.On("CreateUser", mock.Anything, mock.MatchedBy(func(u *domain.User) bool {
					return u.Username == "newuser" && u.Email == "newuser@example.com" && u.Role == "user"
				})).Return(nil).Once()
			},
			expectedStatus: http.StatusCreated,
			validateBody: func(t *testing.T, body map[string]interface{}) {
				assert.True(t, body["success"].(bool))
				assert.Equal(t, float64(201), body["code"])
				assert.Equal(t, "User registered successfully", body["message"])
				data := body["data"].(map[string]interface{})
				assert.NotEmpty(t, data["id"])
				assert.Equal(t, "newuser", data["username"])
			},
		},
		{
			name: "fail when username already exists",
			payload: domain.UserRegisterReq{
				Username: "existinguser",
				Email:    "new@example.com",
				Password: "password123",
			},
			setupMock: func(m *mocks.MockAuthRepositoryPort) {
				m.On("FindUserByUsername", mock.Anything, "existinguser").Return(&domain.User{ID: "123", Username: "existinguser", Role: "user"}, nil).Once()
			},
			expectedStatus: http.StatusConflict,
			validateBody: func(t *testing.T, body map[string]interface{}) {
				assert.False(t, body["success"].(bool))
				assert.Equal(t, float64(409), body["code"])
				errorInfo := body["error"].(map[string]interface{})
				assert.Equal(t, "USERNAME_EXISTS", errorInfo["code"])
				assert.Equal(t, "Username already exists", body["message"])
			},
		},
		{
			name: "fail when email already exists",
			payload: domain.UserRegisterReq{
				Username: "newuser",
				Email:    "existing@example.com",
				Password: "password123",
			},
			setupMock: func(m *mocks.MockAuthRepositoryPort) {
				m.On("FindUserByUsername", mock.Anything, "newuser").Return((*domain.User)(nil), sql.ErrNoRows).Once()
				m.On("FindUserByEmail", mock.Anything, "existing@example.com").Return(&domain.User{ID: "456", Email: "existing@example.com", Role: "user"}, nil).Once()
			},
			expectedStatus: http.StatusConflict,
			validateBody: func(t *testing.T, body map[string]interface{}) {
				assert.False(t, body["success"].(bool))
				assert.Equal(t, float64(409), body["code"])
				errorInfo := body["error"].(map[string]interface{})
				assert.Equal(t, "EMAIL_EXISTS", errorInfo["code"])
				assert.Equal(t, "Email already exists", body["message"])
			},
		},
		{
			name: "fail validation - username too short",
			payload: domain.UserRegisterReq{
				Username: "abc",
				Email:    "test@example.com",
				Password: "password123",
			},
			setupMock:      func(m *mocks.MockAuthRepositoryPort) {},
			expectedStatus: http.StatusBadRequest,
			validateBody: func(t *testing.T, body map[string]interface{}) {
				assert.False(t, body["success"].(bool))
				assert.Equal(t, float64(400), body["code"])
				errorInfo := body["error"].(map[string]interface{})
				assert.Equal(t, "VALIDATION_ERROR", errorInfo["code"])
				details := errorInfo["details"].([]interface{})
				assert.Len(t, details, 1)
				firstError := details[0].(map[string]interface{})
				assert.Equal(t, "Username", firstError["field"])
				assert.Contains(t, firstError["reason"], "at least 4 characters")
			},
		},
		{
			name: "fail validation - invalid email",
			payload: domain.UserRegisterReq{
				Username: "testuser",
				Email:    "invalidemail",
				Password: "password123",
			},
			setupMock:      func(m *mocks.MockAuthRepositoryPort) {},
			expectedStatus: http.StatusBadRequest,
			validateBody: func(t *testing.T, body map[string]interface{}) {
				assert.False(t, body["success"].(bool))
				assert.Equal(t, float64(400), body["code"])
				errorInfo := body["error"].(map[string]interface{})
				assert.Equal(t, "VALIDATION_ERROR", errorInfo["code"])
				details := errorInfo["details"].([]interface{})
				assert.Len(t, details, 1)
				firstError := details[0].(map[string]interface{})
				assert.Equal(t, "Email", firstError["field"])
				assert.Contains(t, firstError["reason"], "valid email")
			},
		},
		{
			name: "fail validation - missing required fields",
			payload: domain.UserRegisterReq{
				Username: "",
				Email:    "",
				Password: "",
			},
			setupMock:      func(m *mocks.MockAuthRepositoryPort) {},
			expectedStatus: http.StatusBadRequest,
			validateBody: func(t *testing.T, body map[string]interface{}) {
				assert.False(t, body["success"].(bool))
				assert.Equal(t, float64(400), body["code"])
				errorInfo := body["error"].(map[string]interface{})
				assert.Equal(t, "VALIDATION_ERROR", errorInfo["code"])
				details := errorInfo["details"].([]interface{})
				assert.Len(t, details, 3)
			},
		},
		{
			name:           "fail with malformed JSON",
			payload:        "{invalid json",
			setupMock:      func(m *mocks.MockAuthRepositoryPort) {},
			expectedStatus: http.StatusBadRequest,
			validateBody: func(t *testing.T, body map[string]interface{}) {
				assert.False(t, body["success"].(bool))
				assert.Equal(t, float64(400), body["code"])
				errorInfo := body["error"].(map[string]interface{})
				assert.Equal(t, "BAD_REQUEST", errorInfo["code"])
				assert.Equal(t, "Invalid JSON format", body["message"])
			},
		},
		{
			name: "fail when database error occurs",
			payload: domain.UserRegisterReq{
				Username: "testuser",
				Email:    "test@example.com",
				Password: "password123",
			},
			setupMock: func(m *mocks.MockAuthRepositoryPort) {
				m.On("FindUserByUsername", mock.Anything, "testuser").Return((*domain.User)(nil), errors.New("database connection lost")).Once()
			},
			expectedStatus: http.StatusInternalServerError,
			validateBody: func(t *testing.T, body map[string]interface{}) {
				assert.False(t, body["success"].(bool))
				assert.Equal(t, float64(500), body["code"])
				assert.Equal(t, "Internal server error", body["message"])
			},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			e, mockRepo := setupTestServer(t)
			tc.setupMock(mockRepo)

			// Prepare request
			var reqBody []byte
			if str, ok := tc.payload.(string); ok {
				reqBody = []byte(str)
			} else {
				reqBody, _ = json.Marshal(tc.payload)
			}

			req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewBuffer(reqBody))
			req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
			rec := httptest.NewRecorder()

			// Execute request
			e.ServeHTTP(rec, req)

			// Assert status code
			assert.Equal(t, tc.expectedStatus, rec.Code)

			// Assert response body
			var responseBody map[string]interface{}
			err := json.Unmarshal(rec.Body.Bytes(), &responseBody)
			require.NoError(t, err)

			tc.validateBody(t, responseBody)

			// Verify mock expectations
			mockRepo.AssertExpectations(t)
		})
	}
}

func TestIntegration_UserRegister_ContextCancellation(t *testing.T) {
	e, mockRepo := setupTestServer(t)

	// Setup mock to simulate long-running operation
	mockRepo.On("FindUserByUsername", mock.Anything, "testuser").Return((*domain.User)(nil), context.Canceled).Once()

	payload := domain.UserRegisterReq{
		Username: "testuser",
		Email:    "test@example.com",
		Password: "password123",
	}
	reqBody, _ := json.Marshal(payload)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/register", bytes.NewBuffer(reqBody))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()

	e.ServeHTTP(rec, req)

	assert.Equal(t, http.StatusInternalServerError, rec.Code)

	var responseBody map[string]interface{}
	err := json.Unmarshal(rec.Body.Bytes(), &responseBody)
	require.NoError(t, err)

	assert.False(t, responseBody["success"].(bool))
	assert.Equal(t, float64(500), responseBody["code"])
	assert.Equal(t, "Internal server error", responseBody["message"])

	mockRepo.AssertExpectations(t)
}
