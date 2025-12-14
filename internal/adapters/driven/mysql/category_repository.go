package repository

import (
	"blogg/internal/core/domain"
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
)

type CategoryRepository struct {
	db *sqlx.DB
}

func NewCategoryRepository(db *sqlx.DB) *CategoryRepository {
	return &CategoryRepository{db: db}
}

func (r *CategoryRepository) CreateCategory(ctx context.Context, c *domain.Category) error {
	query := `INSERT INTO categories (id, name, slug)
			  VALUES (?, ?, ?)`
	_, err := r.db.ExecContext(ctx, query, c.ID, c.Name, c.Slug)
	return err
}

func (r *CategoryRepository) FindCategoryByID(ctx context.Context, categoryID string) (*domain.Category, error) {
	var c domain.Category
	query := `SELECT * FROM categories WHERE id = ?`
	err := r.db.GetContext(ctx, &c, query, categoryID)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *CategoryRepository) ListCategories(ctx context.Context) ([]domain.Category, error) {
	var categories []domain.Category
	query := `SELECT * FROM categories ORDER BY name ASC`
	err := r.db.SelectContext(ctx, &categories, query)
	return categories, err
}
