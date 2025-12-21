package port

import (
	"blogg/internal/core/domain"
	"context"
)

type PostServicePort interface {
	CreatePost(ctx context.Context, req *domain.Post, categoryIDs []string) (*domain.Post, error)
	GetPostByID(ctx context.Context, id string) (*domain.Post, error)
	GetPostBySlug(ctx context.Context, slug string) (*domain.Post, error)
	UpdatePost(ctx context.Context, id string, userID string, req *domain.Post, categoryIDs *[]string) (*domain.Post, error)
	DeletePost(ctx context.Context, id string, userID string) error
	ListPosts(ctx context.Context) ([]*domain.Post, error)
	ListPostsByUser(ctx context.Context, userID string) ([]*domain.Post, error)
}

type PostRepositoryPort interface {
	CreatePost(ctx context.Context, p *domain.Post) error
	FindPostByID(ctx context.Context, postID string) (*domain.Post, error)
	FindPostBySlug(ctx context.Context, slug string) (*domain.Post, error)
	UpdatePost(ctx context.Context, p *domain.Post) error
	DeletePost(ctx context.Context, postID string) error
	ListPosts(ctx context.Context) ([]*domain.Post, error)
	FindPostsByUserID(ctx context.Context, userID string) ([]*domain.Post, error)
	AddCategoriesToPost(ctx context.Context, postID string, categoryIDs []string) error
	RemoveCategoriesFromPost(ctx context.Context, postID string) error
	GetPostCategories(ctx context.Context, postID string) ([]domain.Category, error)
}

type CategoryRepositoryPort interface {
	CreateCategory(ctx context.Context, c *domain.Category) error
	FindCategoryByID(ctx context.Context, categoryID string) (*domain.Category, error)
	ListCategories(ctx context.Context) ([]domain.Category, error)
}
