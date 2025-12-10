package service

import (
	"blogg/internal/core/domain"
	"blogg/internal/core/port"
	"blogg/utils/hasher"
	jwthelper "blogg/utils/jwt"
	"context"
	"database/sql"
	"errors"

	"github.com/google/uuid"
)

type authService struct {
	repo port.AuthRepositoryPort
}

func NewAuthService(repo port.AuthRepositoryPort) port.AuthServicePort {
	return &authService{
		repo: repo,
	}
}

func (as *authService) Register(ctx context.Context, u *domain.UserRegisterReq) (*domain.UserRegisterRes, error) {
	// Validation is now handled at Handler layer
	// Service only handles business logic

	// Business logic: Check if username already exists
	foundUser, err := as.repo.FindUserByUsername(ctx, u.Username)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		// If it's not a "not found" error, propagate it (e.g., db connection error)
		return nil, err
	}
	if foundUser != nil {
		// User found, username already exists
		return nil, domain.ErrUsernameExists
	}

	// Business logic: Check if email already exists
	foundUser, err = as.repo.FindUserByEmail(ctx, u.Email)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		// If it's not a "not found" error, propagate it
		return nil, err
	}
	if foundUser != nil {
		// User found, email already exists
		return nil, domain.ErrEmailExists
	}

	newUser := &domain.User{
		ID:       uuid.NewString(),
		Username: u.Username,
		Password: u.Password,
		Email:    u.Email,
	}

	hashed, err := hasher.NewArgonHash().Hash(u.Password)
	if err != nil {
		return nil, err
	}

	newUser.Password = hashed

	// Create user in database
	err = as.repo.CreateUser(ctx, newUser)
	if err != nil {
		return nil, err
	}

	return &domain.UserRegisterRes{
		ID:       newUser.ID,
		Username: newUser.Username,
	}, nil
}

func (as *authService) Login(ctx context.Context, u *domain.UserLoginReq) (*domain.UserLoginRes, error) {
	// Find user by username
	founded, err := as.repo.FindUserByUsername(ctx, u.Username)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// User not found - return invalid credentials (don't reveal if user exists)
			return nil, domain.ErrInvalidCredentials
		}
		// Other database error
		return nil, err
	}

	// Verify password
	matched, err := hasher.NewArgonHash().Verify(u.Password, founded.Password)
	if err != nil {
		return nil, err
	}
	if !matched {
		return nil, domain.ErrInvalidCredentials
	}

	// Generate JWT token
	accessToken, err := jwthelper.NewDefaultJWTManager().GenerateToken(founded.ID, founded.Username)
	if err != nil {
		return nil, err
	}

	return &domain.UserLoginRes{
		AccessToken: accessToken,
		Username:    founded.Username,
	}, nil
}
