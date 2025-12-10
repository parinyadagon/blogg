package main

import (
	"blogg/config"
	repository "blogg/internal/adapters/driven/mysql"
	httpAdapter "blogg/internal/adapters/driving/http"
	"blogg/internal/core/service"
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"time"
)

func main() {

	cfg, err := config.Load()
	if err != nil {
		fmt.Println(err)
	}

	db, err := config.NewDB(cfg)
	if err != nil {
		fmt.Println(err)
	}

	userRepo := repository.NewAuthRepository(db)
	authService := service.NewAuthService(userRepo)
	authHandler := httpAdapter.NewAuthHandler(authService)

	// Setup router
	router := httpAdapter.NewRouter(authHandler)
	router.SetupRoutes()

	// Start server in goroutine
	go func() {
		log.Println("Server starting on :8080")
		if err := router.Start(cfg.GetServerAddress()); err != nil {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	// Wait for interrupt signal for graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit

	log.Println("Shutting down server...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := router.Shutdown(); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	<-ctx.Done()
	log.Println("Server exited")
}
