package http

import (
	"blogg/internal/adapters/driving/http/httphelper"
	"blogg/internal/adapters/driving/http/middleware"
	"blogg/internal/core/domain"
	"blogg/internal/core/port"
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
)

type PostHandler struct {
	postService port.PostServicePort
	validate    *validator.Validate
}

func NewPostHandler(postService port.PostServicePort) *PostHandler {
	validate := validator.New()
	// Register custom slug validator
	validate.RegisterValidation("slug", func(fl validator.FieldLevel) bool {
		slug := fl.Field().String()
		// Allow lowercase, numbers, and hyphens only
		for _, char := range slug {
			if !((char >= 'a' && char <= 'z') || (char >= '0' && char <= '9') || char == '-') {
				return false
			}
		}
		return len(slug) > 0
	})
	return &PostHandler{
		postService: postService,
		validate:    validate,
	}
}

type CreatePostRequest struct {
	Title       string   `json:"title" validate:"required,min=3,max=200"`
	Slug        string   `json:"slug" validate:"required,slug"`
	Image       string   `json:"image" validate:"omitempty,url"`
	Content     string   `json:"content" validate:"required,min=50,max=100000"`
	Excerpt     string   `json:"excerpt" validate:"omitempty,max=300"`
	Publish     bool     `json:"publish"`
	CategoryIDs []string `json:"category_ids" validate:"omitempty,dive,uuid"`
}

type UpdatePostRequest struct {
	Title       *string   `json:"title" validate:"omitempty,min=3,max=200"`
	Slug        *string   `json:"slug" validate:"omitempty,slug"`
	Image       *string   `json:"image" validate:"omitempty,url"`
	Content     *string   `json:"content" validate:"omitempty,min=50,max=100000"`
	Excerpt     *string   `json:"excerpt" validate:"omitempty,max=300"`
	Publish     *bool     `json:"publish"`
	CategoryIDs *[]string `json:"category_ids" validate:"omitempty,dive,uuid"`
}

func (h *PostHandler) CreatePost(c echo.Context) error {
	var req CreatePostRequest
	if err := c.Bind(&req); err != nil {
		return httphelper.ErrorResponse(c, httphelper.ErrorResponseParams{
			StatusCode: http.StatusBadRequest,
			Message:    "Invalid request body",
			ErrorCode:  "INVALID_REQUEST",
			Details:    err.Error(),
		})
	}

	if err := h.validate.Struct(req); err != nil {
		return httphelper.HandleValidationError(c, err)
	}

	// Get user ID from JWT token (set by auth middleware)
	userID, err := middleware.GetUserID(c)
	if err != nil {
		return httphelper.HandleServiceError(c, err)
	}

	post := &domain.Post{
		UserID:      userID,
		Title:       req.Title,
		Slug:        req.Slug,
		Image:       req.Image,
		Content:     req.Content,
		Excerpt:     req.Excerpt,
		IsPublished: req.Publish,
	}

	createdPost, err := h.postService.CreatePost(c.Request().Context(), post, req.CategoryIDs)
	if err != nil {
		return httphelper.HandleServiceError(c, err)
	}

	return httphelper.SuccessResponse(c, httphelper.SuccessResponseParams{
		StatusCode: http.StatusCreated,
		Message:    "Post created successfully",
		Data:       createdPost,
	})
}

func (h *PostHandler) ListPosts(c echo.Context) error {
	posts, err := h.postService.ListPosts(c.Request().Context())
	if err != nil {
		return httphelper.HandleServiceError(c, err)
	}

	return httphelper.SuccessResponse(c, httphelper.SuccessResponseParams{
		StatusCode: http.StatusOK,
		Message:    "Posts retrieved successfully",
		Data:       posts,
	})
}

func (h *PostHandler) GetPost(c echo.Context) error {
	id := c.Param("id")
	post, err := h.postService.GetPost(c.Request().Context(), id)
	if err != nil {
		return httphelper.HandleServiceError(c, err)
	}

	return httphelper.SuccessResponse(c, httphelper.SuccessResponseParams{
		StatusCode: http.StatusOK,
		Message:    "Post retrieved successfully",
		Data:       post,
	})
}

func (h *PostHandler) UpdatePost(c echo.Context) error {
	id := c.Param("id")
	var req UpdatePostRequest
	if err := c.Bind(&req); err != nil {
		return httphelper.ErrorResponse(c, httphelper.ErrorResponseParams{
			StatusCode: http.StatusBadRequest,
			Message:    "Invalid request body",
			ErrorCode:  "INVALID_REQUEST",
			Details:    err.Error(),
		})
	}

	if err := h.validate.Struct(req); err != nil {
		return httphelper.HandleValidationError(c, err)
	}

	userID, err := middleware.GetUserID(c)
	if err != nil {
		return httphelper.HandleServiceError(c, err)
	}

	// Build partial update
	post := &domain.Post{}
	if req.Title != nil {
		post.Title = *req.Title
	}
	if req.Slug != nil {
		post.Slug = *req.Slug
	}
	if req.Image != nil {
		post.Image = *req.Image
	}
	if req.Content != nil {
		post.Content = *req.Content
	}
	if req.Excerpt != nil {
		post.Excerpt = *req.Excerpt
	}
	if req.Publish != nil {
		post.IsPublished = *req.Publish
	}

	var categoryIDs *[]string
	if req.CategoryIDs != nil {
		categoryIDs = req.CategoryIDs
	}

	updatedPost, err := h.postService.UpdatePost(c.Request().Context(), id, userID, post, categoryIDs)
	if err != nil {
		return httphelper.HandleServiceError(c, err)
	}

	return httphelper.SuccessResponse(c, httphelper.SuccessResponseParams{
		StatusCode: http.StatusOK,
		Message:    "Post updated successfully",
		Data:       updatedPost,
	})
}

func (h *PostHandler) DeletePost(c echo.Context) error {
	id := c.Param("id")
	userID, err := middleware.GetUserID(c)
	if err != nil {
		return httphelper.HandleServiceError(c, err)
	}

	err = h.postService.DeletePost(c.Request().Context(), id, userID)
	if err != nil {
		return httphelper.HandleServiceError(c, err)
	}

	return httphelper.SuccessResponse(c, httphelper.SuccessResponseParams{
		StatusCode: http.StatusOK,
		Message:    "Post deleted successfully",
		Data:       nil,
	})
}

func (h *PostHandler) ListMyPosts(c echo.Context) error {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		return httphelper.HandleServiceError(c, err)
	}

	posts, err := h.postService.ListPostsByUser(c.Request().Context(), userID)
	if err != nil {
		return httphelper.HandleServiceError(c, err)
	}

	return httphelper.SuccessResponse(c, httphelper.SuccessResponseParams{
		StatusCode: http.StatusOK,
		Message:    "My posts retrieved successfully",
		Data:       posts,
	})
}
