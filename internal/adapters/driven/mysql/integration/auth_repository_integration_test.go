//go:build integration

package integration

import (
	repository "blogg/internal/adapters/driven/mysql"
	"blogg/internal/core/domain"
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestAuthRepository_CreateUser_Integration(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test")
	}

	testDB, cleanup := SetupTestDB(t)
	defer cleanup()

	repo := repository.NewAuthRepository(testDB.DB)

	t.Run("successfully create user", func(t *testing.T) {
		user := &domain.User{
			ID:       uuid.NewString(),
			Username: "testuser",
			Email:    "test@example.com",
			Password: "$argon2id$v=19$m=65536,t=3,p=2$salt$hash",
			Role:     "user",
		}

		err := repo.CreateUser(context.Background(), user)
		require.NoError(t, err)

		// Verify user was created in database
		var count int
		err = testDB.DB.Get(&count, "SELECT COUNT(*) FROM users WHERE id = ?", user.ID)
		require.NoError(t, err)
		assert.Equal(t, 1, count)
	})

	t.Run("fail to create duplicate username", func(t *testing.T) {
		user1 := &domain.User{
			ID:       uuid.NewString(),
			Username: "duplicate",
			Email:    "user1@example.com",
			Password: "$argon2id$v=19$m=65536,t=3,p=2$salt$hash",
			Role:     "user",
		}

		err := repo.CreateUser(context.Background(), user1)
		require.NoError(t, err)

		// Try to create with same username
		user2 := &domain.User{
			ID:       uuid.NewString(),
			Username: "duplicate", // Same username
			Email:    "user2@example.com",
			Password: "$argon2id$v=19$m=65536,t=3,p=2$salt$hash",
			Role:     "user",
		}

		err = repo.CreateUser(context.Background(), user2)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "Duplicate entry")
	})

	t.Run("fail to create duplicate email", func(t *testing.T) {
		user1 := &domain.User{
			ID:       uuid.NewString(),
			Username: "user1",
			Email:    "duplicate@example.com",
			Password: "$argon2id$v=19$m=65536,t=3,p=2$salt$hash",
			Role:     "user",
		}

		err := repo.CreateUser(context.Background(), user1)
		require.NoError(t, err)

		// Try to create with same email
		user2 := &domain.User{
			ID:       uuid.NewString(),
			Username: "user2",
			Email:    "duplicate@example.com", // Same email
			Password: "$argon2id$v=19$m=65536,t=3,p=2$salt$hash",
			Role:     "user",
		}

		err = repo.CreateUser(context.Background(), user2)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "Duplicate entry")
	})
}

func TestAuthRepository_FindUserByUsername_Integration(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test")
	}

	testDB, cleanup := SetupTestDB(t)
	defer cleanup()

	repo := repository.NewAuthRepository(testDB.DB)

	// Insert test data
	user := &domain.User{
		ID:       uuid.NewString(),
		Username: "findme",
		Email:    "findme@example.com",
		Password: "$argon2id$v=19$m=65536,t=3,p=2$salt$hash",
		Role:     "user",
	}
	err := repo.CreateUser(context.Background(), user)
	require.NoError(t, err)

	t.Run("find existing user", func(t *testing.T) {
		foundUser, err := repo.FindUserByUsername(context.Background(), "findme")
		require.NoError(t, err)
		assert.Equal(t, "findme", foundUser.Username)
		assert.Equal(t, "findme@example.com", foundUser.Email)
		assert.Equal(t, "user", foundUser.Role)
	})

	t.Run("user not found", func(t *testing.T) {
		_, err := repo.FindUserByUsername(context.Background(), "notexist")
		assert.Error(t, err)
	})
}

func TestAuthRepository_FindUserByEmail_Integration(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test")
	}

	testDB, cleanup := SetupTestDB(t)
	defer cleanup()

	repo := repository.NewAuthRepository(testDB.DB)

	// Insert test data
	user := &domain.User{
		ID:       uuid.NewString(),
		Username: "emailtest",
		Email:    "find@example.com",
		Password: "$argon2id$v=19$m=65536,t=3,p=2$salt$hash",
		Role:     "user",
	}
	err := repo.CreateUser(context.Background(), user)
	require.NoError(t, err)

	t.Run("find existing email", func(t *testing.T) {
		foundUser, err := repo.FindUserByEmail(context.Background(), "find@example.com")
		require.NoError(t, err)
		assert.Equal(t, "emailtest", foundUser.Username)
		assert.Equal(t, "find@example.com", foundUser.Email)
		assert.Equal(t, "user", foundUser.Role)
	})

	t.Run("email not found", func(t *testing.T) {
		_, err := repo.FindUserByEmail(context.Background(), "notexist@example.com")
		assert.Error(t, err)
	})
}

func TestAuthRepository_FindUserByID_Integration(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test")
	}

	testDB, cleanup := SetupTestDB(t)
	defer cleanup()

	repo := repository.NewAuthRepository(testDB.DB)

	// Insert test data
	userID := uuid.NewString()
	user := &domain.User{
		ID:       userID,
		Username: "idtest",
		Email:    "id@example.com",
		Password: "$argon2id$v=19$m=65536,t=3,p=2$salt$hash",
		Role:     "user",
	}
	err := repo.CreateUser(context.Background(), user)
	require.NoError(t, err)

	t.Run("find user by ID", func(t *testing.T) {
		foundUser, err := repo.FindUserByID(context.Background(), userID)
		require.NoError(t, err)
		assert.Equal(t, userID, foundUser.ID)
		assert.Equal(t, "idtest", foundUser.Username)
		assert.Equal(t, "id@example.com", foundUser.Email)
		assert.Equal(t, "user", foundUser.Role)
	})

	t.Run("user ID not found", func(t *testing.T) {
		_, err := repo.FindUserByID(context.Background(), uuid.NewString())
		assert.Error(t, err)
	})
}
