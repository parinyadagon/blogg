//go:build integration

package integration

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/jmoiron/sqlx"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/mysql"
	"github.com/testcontainers/testcontainers-go/wait"

	_ "github.com/go-sql-driver/mysql"
)

type TestDatabase struct {
	Container *mysql.MySQLContainer
	DB        *sqlx.DB
}

func SetupTestDB(t *testing.T) (*TestDatabase, func()) {
	ctx := context.Background()

	// Start MySQL container
	mysqlContainer, err := mysql.Run(ctx,
		"mysql:8.0",
		mysql.WithDatabase("test"),
		mysql.WithUsername("test"),
		mysql.WithPassword("test"),
		testcontainers.WithWaitStrategy(
			wait.ForLog("port: 3306  MySQL Community Server - GPL").
				WithOccurrence(1).
				WithStartupTimeout(60*time.Second)),
	)
	if err != nil {
		t.Fatalf("Failed to start MySQL container: %v", err)
	}

	// Get connection string
	connStr, err := mysqlContainer.ConnectionString(ctx, "parseTime=true&charset=utf8mb4")
	if err != nil {
		t.Fatalf("Failed to get connection string: %v", err)
	}

	// Connect to database
	db, err := sqlx.Connect("mysql", connStr)
	if err != nil {
		t.Fatalf("Failed to connect to database: %v", err)
	}

	// Set connection pool
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Run migrations
	if err := runMigrations(db); err != nil {
		t.Fatalf("Failed to run migrations: %v", err)
	}

	// Cleanup function
	cleanup := func() {
		db.Close()
		if err := mysqlContainer.Terminate(ctx); err != nil {
			t.Logf("Failed to terminate container: %v", err)
		}
	}

	return &TestDatabase{
		Container: mysqlContainer,
		DB:        db,
	}, cleanup
}

func runMigrations(db *sqlx.DB) error {
	migrations := []string{
		`CREATE TABLE users (
			id VARCHAR(36) NOT NULL, -- แนะนำลดขนาดถ้าใช้ UUID (36 chars)
			username VARCHAR(50) NOT NULL,
			email VARCHAR(255) NOT NULL,
			password VARCHAR(255) NOT NULL,
			role ENUM('admin', 'editor', 'user') DEFAULT 'user', -- เพิ่ม role เผื่ออนาคต
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			UNIQUE KEY uk_users_username (username),
			UNIQUE KEY uk_users_email (email)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
	`,
	}

	for _, migration := range migrations {
		if _, err := db.Exec(migration); err != nil {
			return fmt.Errorf("failed to execute migration: %w", err)
		}
	}

	return nil
}
