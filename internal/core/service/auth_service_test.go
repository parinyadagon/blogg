//go:build unit

package service_test

import (
	"blogg/internal/core/domain"
	"blogg/internal/core/service"
	"blogg/mocks"
	"context"
	"database/sql"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func TestAuthService_Register(t *testing.T) {
	// Note: Validation tests have been moved to user_handler_test.go
	// Service layer only tests business logic

	t.Run("BusinessLogic", func(t *testing.T) {
		type businessTest struct {
			name           string
			input          *domain.UserRegisterReq
			setupMock      func(m *mocks.MockAuthRepositoryPort)
			expectError    bool
			expectedErr    error
			validateResult func(t *testing.T, result *domain.UserRegisterRes)
		}

		tests := []businessTest{
			{
				name:  "successfully create user",
				input: &domain.UserRegisterReq{Username: "user-1", Email: "user-1@mail.com", Password: "123456"},
				setupMock: func(m *mocks.MockAuthRepositoryPort) {
					m.On("FindUserByUsername", mock.Anything, "user-1").Return((*domain.User)(nil), sql.ErrNoRows).Once()
					m.On("FindUserByEmail", mock.Anything, "user-1@mail.com").Return((*domain.User)(nil), sql.ErrNoRows).Once()
					m.EXPECT().CreateUser(mock.Anything, mock.Anything).
						Return(nil).
						Once()
				},
				expectError: false,
			},
			{
				name:  "return error when database connection lost",
				input: &domain.UserRegisterReq{Username: "user-1", Email: "user-1@mail.com", Password: "123456"},
				setupMock: func(m *mocks.MockAuthRepositoryPort) {
					m.On("FindUserByUsername", mock.Anything, "user-1").Return((*domain.User)(nil), errors.New("db connection lost")).Once()
				},
				expectError: true,
				expectedErr: nil, // Generic error, not a domain error
			},
			{
				name:  "return error when username already exists",
				input: &domain.UserRegisterReq{Username: "existing-user", Email: "user@mail.com", Password: "123456"},
				setupMock: func(m *mocks.MockAuthRepositoryPort) {
					m.On("FindUserByUsername", mock.Anything, "existing-user").Return(&domain.User{ID: "123", Username: "existing-user"}, nil).Once()
				},
				expectError: true,
				expectedErr: domain.ErrUsernameExists,
			},
			{
				name:  "return error when email already exists",
				input: &domain.UserRegisterReq{Username: "newuser", Email: "existing@mail.com", Password: "123456"},
				setupMock: func(m *mocks.MockAuthRepositoryPort) {
					m.On("FindUserByUsername", mock.Anything, "newuser").Return((*domain.User)(nil), sql.ErrNoRows).Once()
					m.On("FindUserByEmail", mock.Anything, "existing@mail.com").Return(&domain.User{ID: "456", Email: "existing@mail.com"}, nil).Once()
				},
				expectError: true,
				expectedErr: domain.ErrEmailExists,
			},
			{
				name:  "return error when checking email fails",
				input: &domain.UserRegisterReq{Username: "user-1", Email: "user-1@mail.com", Password: "123456"},
				setupMock: func(m *mocks.MockAuthRepositoryPort) {
					m.On("FindUserByUsername", mock.Anything, "user-1").Return((*domain.User)(nil), sql.ErrNoRows).Once()
					m.On("FindUserByEmail", mock.Anything, "user-1@mail.com").Return((*domain.User)(nil), errors.New("db error")).Once()
				},
				expectError: true,
				expectedErr: nil,
			},
			{
				name:  "return error when create user fails",
				input: &domain.UserRegisterReq{Username: "user-1", Email: "user-1@mail.com", Password: "123456"},
				setupMock: func(m *mocks.MockAuthRepositoryPort) {
					m.On("FindUserByUsername", mock.Anything, "user-1").Return((*domain.User)(nil), sql.ErrNoRows).Once()
					m.On("FindUserByEmail", mock.Anything, "user-1@mail.com").Return((*domain.User)(nil), sql.ErrNoRows).Once()
					m.On("CreateUser", mock.Anything, mock.Anything).Return(errors.New("db error")).Once()
				},
				expectError: true,
				expectedErr: nil,
			},
		}

		for _, tc := range tests {
			t.Run(tc.name, func(t *testing.T) {
				mockRepo := mocks.NewMockAuthRepositoryPort(t)
				tc.setupMock(mockRepo)

				svc := service.NewAuthService(mockRepo)

				result, err := svc.Register(context.Background(), tc.input)

				if tc.expectError {
					require.Error(t, err)
					if tc.expectedErr != nil {
						assert.ErrorIs(t, err, tc.expectedErr)
					}
				} else {
					require.NoError(t, err)
					require.NotNil(t, result)
					if tc.validateResult != nil {

						tc.validateResult(t, result)
					}
				}
			})
		}
	})
}
