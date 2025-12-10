package http

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type Router struct {
	echo        *echo.Echo
	authHandler *AuthHandler
}

func NewRouter(authHandler *AuthHandler) *Router {
	e := echo.New()

	// Middleware
	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: "${time_rfc3339} | ${status} | ${latency_human} | ${method} ${uri}\n",
	}))
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:3001"},
		AllowMethods:     []string{echo.GET, echo.POST, echo.PUT, echo.DELETE, echo.PATCH},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
		AllowCredentials: true,
	}))

	return &Router{
		echo:        e,
		authHandler: authHandler,
	}
}

func (r *Router) SetupRoutes() {
	api := r.echo.Group("/api/v1")

	// Auth routes (public)
	auth := api.Group("/auth")
	auth.POST("/register", r.authHandler.Register)
	auth.POST("/login", r.authHandler.Login)
	auth.POST("/logout", r.authHandler.Logout)
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
