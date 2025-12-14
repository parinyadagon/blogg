package repository

import (
	"blogg/internal/core/domain"
	"context"
	"database/sql"

	"github.com/jmoiron/sqlx"
)

type PostRepository struct {
	db *sqlx.DB
}

func NewPostRepository(db *sqlx.DB) *PostRepository {
	return &PostRepository{db: db}
}

func (r *PostRepository) CreatePost(ctx context.Context, p *domain.Post) error {
	query := `INSERT INTO posts (id, user_id, title, slug, image, content, excerpt, is_published, published_at, created_at, updated_at)
			  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	_, err := r.db.ExecContext(ctx, query, p.ID, p.UserID, p.Title, p.Slug, p.Image, p.Content, p.Excerpt, p.IsPublished, p.PublishedAt, p.CreatedAt, p.UpdatedAt)
	return err
}

func (r *PostRepository) FindPostByID(ctx context.Context, postID string) (*domain.Post, error) {
	var p domain.Post
	query := `SELECT * FROM posts WHERE id = ? AND deleted_at IS NULL`
	err := r.db.GetContext(ctx, &p, query, postID)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *PostRepository) FindPostBySlug(ctx context.Context, slug string) (*domain.Post, error) {
	var p domain.Post
	query := `SELECT * FROM posts WHERE slug = ? AND deleted_at IS NULL`
	err := r.db.GetContext(ctx, &p, query, slug)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *PostRepository) UpdatePost(ctx context.Context, p *domain.Post) error {
	query := `UPDATE posts SET title = ?, slug = ?, image = ?, content = ?, excerpt = ?, is_published = ?, published_at = ?, updated_at = ?
			  WHERE id = ?`
	_, err := r.db.ExecContext(ctx, query, p.Title, p.Slug, p.Image, p.Content, p.Excerpt, p.IsPublished, p.PublishedAt, p.UpdatedAt, p.ID)
	return err
}

func (r *PostRepository) DeletePost(ctx context.Context, postID string) error {
	query := `UPDATE posts SET deleted_at = NOW(), updated_at = NOW() WHERE id = ?`
	_, err := r.db.ExecContext(ctx, query, postID)
	return err
}

func (r *PostRepository) ListPosts(ctx context.Context) ([]*domain.Post, error) {
	var posts []*domain.Post
	query := `SELECT * FROM posts WHERE deleted_at IS NULL AND is_published = true ORDER BY published_at DESC`
	err := r.db.SelectContext(ctx, &posts, query)
	return posts, err
}

func (r *PostRepository) AddCategoriesToPost(ctx context.Context, postID string, categoryIDs []string) error {
	query := `INSERT INTO posts_categories (post_id, category_id) VALUES (?, ?)`
	for _, categoryID := range categoryIDs {
		_, err := r.db.ExecContext(ctx, query, postID, categoryID)
		if err != nil {
			return err
		}
	}
	return nil
}

func (r *PostRepository) RemoveCategoriesFromPost(ctx context.Context, postID string) error {
	query := `DELETE FROM posts_categories WHERE post_id = ?`
	_, err := r.db.ExecContext(ctx, query, postID)
	return err
}

func (r *PostRepository) GetPostCategories(ctx context.Context, postID string) ([]domain.Category, error) {
	var categories []domain.Category
	query := `SELECT c.* FROM categories c 
			  INNER JOIN posts_categories pc ON c.id = pc.category_id 
			  WHERE pc.post_id = ?`
	err := r.db.SelectContext(ctx, &categories, query, postID)
	return categories, err
}
