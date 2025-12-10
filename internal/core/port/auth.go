package port

import (
	"blogg/internal/core/domain"
	"context"
)

type AuthServicePort interface {
	Register(ctx context.Context, u *domain.UserRegisterReq) (*domain.UserRegisterRes, error)
	Login(ctx context.Context, u *domain.UserLoginReq) (*domain.UserLoginRes, error)
}

type AuthRepositoryPort interface {
	CreateUser(ctx context.Context, u *domain.User) error
	FindUserByID(ctx context.Context, userID string) (*domain.User, error)
	FindUserByUsername(ctx context.Context, username string) (*domain.User, error)
	FindUserByEmail(ctx context.Context, email string) (*domain.User, error)
}
