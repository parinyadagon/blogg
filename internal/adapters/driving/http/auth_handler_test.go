//go:build unit

package http_test

import (
	"blogg/internal/adapters/driving/http"
	"blogg/internal/core/domain"
	"blogg/mocks"
	"bytes"
	"encoding/json"
	"errors"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func setupTestEcho(handler *http.AuthHandler) *echo.Echo {
	e := echo.New()
	e.POST("/register", handler.Register)
	return e
}

func TestAuthHandler_Register_Validation(t *testing.T) {
	// Validation tests - no need to call service
	type validationTest struct {
		name           string
		input          map[string]interface{}
		expectedStatus int
		expectError    bool
	}

	tests := []validationTest{
		{
			name: "username less than 4 characters",
			input: map[string]interface{}{
				"username": "Jon",
				"email":    "jon@email.com",
				"password": "123456",
			},
			expectedStatus: 400,
			expectError:    true,
		},
		{
			name: "username is required",
			input: map[string]interface{}{
				"email":    "jon@email.com",
				"password": "123456",
			},
			expectedStatus: 400,
			expectError:    true,
		},
		{
			name: "email is invalid format",
			input: map[string]interface{}{
				"username": "john",
				"email":    "invalid-email",
				"password": "123456",
			},
			expectedStatus: 400,
			expectError:    true,
		},
		{
			name: "password less than 4 characters",
			input: map[string]interface{}{
				"username": "john",
				"email":    "john@email.com",
				"password": "123",
			},
			expectedStatus: 400,
			expectError:    true,
		},
		{
			name: "missing required fields",
			input: map[string]interface{}{
				"invalid": "data",
			},
			expectedStatus: 400,
			expectError:    true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			// Create mock service (won't be called for validation errors)
			mockService := mocks.NewMockAuthServicePort(t)
			handler := http.NewAuthHandler(mockService)
			e := setupTestEcho(handler)

			// Prepare request
			body, _ := json.Marshal(tc.input)
			req := httptest.NewRequest("POST", "/register", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()

			// Execute
			e.ServeHTTP(w, req)

			// Assert
			assert.Equal(t, tc.expectedStatus, w.Code)
			if tc.expectError {
				var response map[string]interface{}
				err := json.Unmarshal(w.Body.Bytes(), &response)
				require.NoError(t, err)
				assert.Contains(t, response, "error")
			}
		})
	}
}

func TestAuthHandler_Register_MalformedJSON(t *testing.T) {
	// Test actual malformed JSON to cover Bind error path
	mockService := mocks.NewMockAuthServicePort(t)
	handler := http.NewAuthHandler(mockService)

	e := echo.New()
	// Send malformed JSON (not valid JSON syntax)
	req := httptest.NewRequest("POST", "/register", strings.NewReader("{invalid json"))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	c := e.NewContext(req, w)

	// Execute
	_ = handler.Register(c)

	// Assert
	assert.Equal(t, 400, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	require.NoError(t, err)

	// Verify error response structure
	assert.Equal(t, false, response["success"])
	assert.Contains(t, response, "error")

	// Verify error code is BAD_REQUEST
	errorInfo := response["error"].(map[string]interface{})
	assert.Equal(t, "BAD_REQUEST", errorInfo["code"])
}

func TestAuthHandler_Register_BusinessLogic(t *testing.T) {
	type businessTest struct {
		name           string
		input          domain.UserRegisterReq
		setupMock      func(m *mocks.MockAuthServicePort)
		expectedStatus int
		expectError    bool
	}

	tests := []businessTest{
		{
			name: "successfully create user",
			input: domain.UserRegisterReq{
				Username: "testuser",
				Email:    "test@email.com",
				Password: "123456",
			},
			setupMock: func(m *mocks.MockAuthServicePort) {
				m.EXPECT().Register(mock.Anything, mock.Anything).
					Return(&domain.UserRegisterRes{ID: "user-123"}, nil).
					Once()
			},
			expectedStatus: 201,
			expectError:    false,
		},
		{
			name: "username already exists",
			input: domain.UserRegisterReq{
				Username: "existing",
				Email:    "test@email.com",
				Password: "123456",
			},
			setupMock: func(m *mocks.MockAuthServicePort) {
				m.EXPECT().Register(mock.Anything, mock.Anything).
					Return(nil, domain.ErrUsernameExists).
					Once()
			},
			expectedStatus: 409,
			expectError:    true,
		},
		{
			name: "database error",
			input: domain.UserRegisterReq{
				Username: "testuser",
				Email:    "test@email.com",
				Password: "123456",
			},
			setupMock: func(m *mocks.MockAuthServicePort) {
				m.EXPECT().Register(mock.Anything, mock.Anything).
					Return(nil, errors.New("db connection lost")).
					Once()
			},
			expectedStatus: 500,
			expectError:    true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			// Setup mock
			mockService := mocks.NewMockAuthServicePort(t)
			tc.setupMock(mockService)
			handler := http.NewAuthHandler(mockService)
			e := setupTestEcho(handler)

			// Prepare request
			body, _ := json.Marshal(tc.input)
			req := httptest.NewRequest("POST", "/register", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()

			// Execute
			e.ServeHTTP(w, req)

			// Assert
			assert.Equal(t, tc.expectedStatus, w.Code)

			var response map[string]interface{}
			err := json.Unmarshal(w.Body.Bytes(), &response)
			require.NoError(t, err)

			if tc.expectError {
				assert.Equal(t, false, response["success"])
				assert.Contains(t, response, "error")
			} else {
				assert.Equal(t, true, response["success"])
				assert.Contains(t, response, "data")
				// Check data contains id
				data, ok := response["data"].(map[string]interface{})
				require.True(t, ok, "data should be an object")
				assert.Contains(t, data, "id")
			}
		})
	}
}

// Example of testing with Echo context directly (alternative approach)
func TestAuthHandler_Register_WithContext(t *testing.T) {
	mockService := mocks.NewMockAuthServicePort(t)
	mockService.EXPECT().Register(mock.Anything, mock.MatchedBy(func(req *domain.UserRegisterReq) bool {
		return req.Username == "testuser"
	})).Return(&domain.UserRegisterRes{ID: "user-123", Username: "testuser"}, nil)

	handler := http.NewAuthHandler(mockService)

	e := echo.New()
	input := domain.UserRegisterReq{
		Username: "testuser",
		Email:    "test@email.com",
		Password: "123456",
	}
	body, _ := json.Marshal(input)
	req := httptest.NewRequest("POST", "/register", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	c := e.NewContext(req, w)

	err := handler.Register(c)

	require.NoError(t, err)
	assert.Equal(t, 201, w.Code)
}
