package service

import (
	"blogg/internal/core/domain"
	"blogg/internal/core/port"
	"context"
	"database/sql"
	"time"

	"github.com/google/uuid"
)

type PostService struct {
	postRepo port.PostRepositoryPort
}

func NewPostService(postRepo port.PostRepositoryPort) *PostService {
	return &PostService{
		postRepo: postRepo,
	}
}

func (s *PostService) CreatePost(ctx context.Context, p *domain.Post, categoryIDs []string) (*domain.Post, error) {
	// Check if slug already exists
	existing, err := s.postRepo.FindPostBySlug(ctx, p.Slug)
	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}
	if existing != nil {
		return nil, domain.ErrSlugExists
	}

	// Set server-managed fields
	p.ID = uuid.NewString()
	p.CreatedAt = time.Now()
	p.UpdatedAt = time.Now()

	// Handle publish logic
	if p.IsPublished && (p.PublishedAt == nil || p.PublishedAt.IsZero()) {
		now := time.Now()
		p.PublishedAt = &now
	}

	// Create post
	err = s.postRepo.CreatePost(ctx, p)
	if err != nil {
		return nil, err
	}

	// Add categories if provided
	if len(categoryIDs) > 0 {
		err = s.postRepo.AddCategoriesToPost(ctx, p.ID, categoryIDs)
		if err != nil {
			return nil, err
		}
		// Load categories for response
		categories, _ := s.postRepo.GetPostCategories(ctx, p.ID)
		p.Categories = categories
	}

	return p, nil
}

func (s *PostService) GetPostByID(ctx context.Context, id string) (*domain.Post, error) {
	post, err := s.postRepo.FindPostByID(ctx, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, domain.ErrPostNotFound
		}
		return nil, err
	}
	if post == nil {
		return nil, domain.ErrPostNotFound
	}

	// Load categories
	categories, _ := s.postRepo.GetPostCategories(ctx, post.ID)
	post.Categories = categories

	return post, nil
}

func (s *PostService) GetPostBySlug(ctx context.Context, slug string) (*domain.Post, error) {
	post, err := s.postRepo.FindPostBySlug(ctx, slug)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, domain.ErrPostNotFound
		}
		return nil, err
	}
	if post == nil {
		return nil, domain.ErrPostNotFound
	}

	// Load categories
	categories, _ := s.postRepo.GetPostCategories(ctx, post.ID)
	post.Categories = categories

	return post, nil
}

func (s *PostService) UpdatePost(ctx context.Context, id string, userID string, p *domain.Post, categoryIDs *[]string) (*domain.Post, error) {
	// Get existing post to check ownership
	existingPost, err := s.postRepo.FindPostByID(ctx, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, domain.ErrPostNotFound
		}
		return nil, err
	}
	if existingPost == nil {
		return nil, domain.ErrPostNotFound
	}

	// Check ownership
	if existingPost.UserID != userID {
		return nil, domain.ErrUnauthorized
	}

	// Check slug uniqueness if slug is being updated
	if p.Slug != "" && p.Slug != existingPost.Slug {
		existing, err := s.postRepo.FindPostBySlug(ctx, p.Slug)
		if err != nil && err != sql.ErrNoRows {
			return nil, err
		}
		if existing != nil {
			return nil, domain.ErrSlugExists
		}
	}

	// Merge updates
	if p.Title != "" {
		existingPost.Title = p.Title
	}
	if p.Slug != "" {
		existingPost.Slug = p.Slug
	}
	if p.Image != "" {
		existingPost.Image = p.Image
	}
	if p.Content != "" {
		existingPost.Content = p.Content
	}
	if p.Excerpt != "" {
		existingPost.Excerpt = p.Excerpt
	}
	existingPost.IsPublished = p.IsPublished
	existingPost.UpdatedAt = time.Now()

	if existingPost.IsPublished && (existingPost.PublishedAt == nil || existingPost.PublishedAt.IsZero()) {
		now := time.Now()
		existingPost.PublishedAt = &now
	}

	err = s.postRepo.UpdatePost(ctx, existingPost)
	if err != nil {
		return nil, err
	}

	// Update categories if provided
	if categoryIDs != nil {
		// Remove old categories
		err = s.postRepo.RemoveCategoriesFromPost(ctx, id)
		if err != nil {
			return nil, err
		}
		// Add new categories
		if len(*categoryIDs) > 0 {
			err = s.postRepo.AddCategoriesToPost(ctx, id, *categoryIDs)
			if err != nil {
				return nil, err
			}
		}
	}

	// Load categories for response
	categories, _ := s.postRepo.GetPostCategories(ctx, id)
	existingPost.Categories = categories

	return existingPost, nil
}

func (s *PostService) DeletePost(ctx context.Context, id string, userID string) error {
	// Get post to check ownership
	post, err := s.postRepo.FindPostByID(ctx, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return domain.ErrPostNotFound
		}
		return err
	}
	if post == nil {
		return domain.ErrPostNotFound
	}

	// Check ownership
	if post.UserID != userID {
		return domain.ErrUnauthorized
	}

	return s.postRepo.DeletePost(ctx, id)
}

func (s *PostService) ListPosts(ctx context.Context) ([]*domain.Post, error) {
	posts, err := s.postRepo.ListPosts(ctx)
	if err != nil {
		return nil, err
	}

	// Load categories for each post
	for _, post := range posts {
		categories, _ := s.postRepo.GetPostCategories(ctx, post.ID)
		post.Categories = categories
	}

	return posts, nil
}

func (s *PostService) ListPostsByUser(ctx context.Context, userID string) ([]*domain.Post, error) {
	posts, err := s.postRepo.FindPostsByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	// Load categories for each post
	for _, post := range posts {
		categories, _ := s.postRepo.GetPostCategories(ctx, post.ID)
		post.Categories = categories
	}

	return posts, nil
}
