package repository

import (
	"blogg/internal/core/domain"
	"blogg/internal/core/port"
	"context"

	"github.com/jmoiron/sqlx"
)

type authRepository struct {
	db *sqlx.DB
}

func NewAuthRepository(db *sqlx.DB) port.AuthRepositoryPort {
	return &authRepository{db: db}
}

func (arp *authRepository) CreateUser(ctx context.Context, u *domain.User) error {

	query := `INSERT INTO users (id, username, email, password, created_at, updated_at) 
	          VALUES (?, ?, ?, ?, NOW(), NOW())`
	_, err := arp.db.ExecContext(ctx, query, u.ID, u.Username, u.Email, u.Password)
	if err != nil {
		return err
	}

	return nil
}

func (arp *authRepository) FindUserByID(ctx context.Context, userID string) (*domain.User, error) {
	var user domain.User

	query := `SELECT id, username, email, password FROM users WHERE id = ?`
	err := arp.db.GetContext(ctx, &user, query, userID)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (arp *authRepository) FindUserByUsername(ctx context.Context, username string) (*domain.User, error) {
	var user domain.User

	query := `SELECT id, username, email, password FROM users WHERE username = ?`
	err := arp.db.GetContext(ctx, &user, query, username)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (arp *authRepository) FindUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	var user domain.User

	query := `SELECT id, username, email, password FROM users WHERE email = ?`
	err := arp.db.GetContext(ctx, &user, query, email)
	if err != nil {
		return nil, err
	}

	return &user, nil
}
