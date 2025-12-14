package http

import (
	"blogg/internal/adapters/driving/http/middleware"
	jwthelper "blogg/utils/jwt"

	"github.com/labstack/echo/v4"
	echoMiddleware "github.com/labstack/echo/v4/middleware"
)

type Router struct {
	echo           *echo.Echo
	authHandler    *AuthHandler
	postHandler    *PostHandler
	authMiddleware *middleware.AuthMiddleware
}

func NewRouter(authHandler *AuthHandler, postHandler *PostHandler) *Router {
	e := echo.New()

	// Middleware
	e.Use(echoMiddleware.LoggerWithConfig(echoMiddleware.LoggerConfig{
		Format: "${time_rfc3339} | ${status} | ${latency_human} | ${method} ${uri}\n",
	}))
	e.Use(echoMiddleware.Recover())
	e.Use(echoMiddleware.CORSWithConfig(echoMiddleware.CORSConfig{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:3001"},
		AllowMethods:     []string{echo.GET, echo.POST, echo.PUT, echo.DELETE, echo.PATCH},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
		AllowCredentials: true,
	}))

	// Initialize auth middleware
	jwtManager := jwthelper.NewDefaultJWTManager()
	authMiddleware := middleware.NewAuthMiddleware(jwtManager)

	return &Router{
		echo:           e,
		authHandler:    authHandler,
		postHandler:    postHandler,
		authMiddleware: authMiddleware,
	}
}

func (r *Router) SetupRoutes() {
	api := r.echo.Group("/api/v1")

	// Auth routes (public)
	auth := api.Group("/auth")
	auth.POST("/register", r.authHandler.Register)
	auth.POST("/login", r.authHandler.Login)
	auth.POST("/logout", r.authHandler.Logout)

	// Post routes (public)
	posts := api.Group("/posts")
	posts.GET("", r.postHandler.ListPosts)
	posts.GET("/:id", r.postHandler.GetPost)

	// Post routes (protected - require authentication)
	postsAuth := api.Group("/posts", r.authMiddleware.RequireAuth)
	postsAuth.POST("", r.postHandler.CreatePost)
	postsAuth.PATCH("/:id", r.postHandler.UpdatePost)
	postsAuth.DELETE("/:id", r.postHandler.DeletePost)
}

func (r *Router) Start(address string) error {
	return r.echo.Start(address)
}

func (r *Router) Shutdown() error {
	return r.echo.Close()
}

func (r *Router) GetEcho() *echo.Echo {
	return r.echo
}
