package domain

import (
	"blogg/utils/errs"
	"net/http"
	"time"
)

type Post struct {
	ID          string     `json:"id" db:"id"`
	UserID      string     `json:"user_id" db:"user_id"`
	Title       string     `json:"title" db:"title"`
	Slug        string     `json:"slug" db:"slug"`
	Image       string     `json:"image" db:"image"`
	Content     string     `json:"content" db:"content"`
	Excerpt     string     `json:"excerpt" db:"excerpt"`
	IsPublished bool       `json:"is_published" db:"is_published"`
	PublishedAt *time.Time `json:"published_at,omitempty" db:"published_at"`
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at" db:"updated_at"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty" db:"deleted_at"`
	Author      *User      `json:"author,omitempty" db:"-"`
	Categories  []Category `json:"categories,omitempty" db:"-"`
}

type Category struct {
	ID   string `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
	Slug string `json:"slug" db:"slug"`
}

var (
	ErrPostNotFound     = errs.New(errs.Params{Code: "POST_NOT_FOUND", Message: "Post not found", StatusCode: http.StatusNotFound})
	ErrSlugExists       = errs.New(errs.Params{Code: "SLUG_EXISTS", Message: "Slug already exists", StatusCode: http.StatusConflict})
	ErrUnauthorized     = errs.New(errs.Params{Code: "UNAUTHORIZED", Message: "You are not authorized to perform this action", StatusCode: http.StatusForbidden})
	ErrCategoryNotFound = errs.New(errs.Params{Code: "CATEGORY_NOT_FOUND", Message: "Category not found", StatusCode: http.StatusNotFound})
)
