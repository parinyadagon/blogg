.PHONY: help test test-unit test-integration test-all test-coverage mock clean run build

# Default target
help:
	@echo "Available targets:"
	@echo "  make test              - Run all unit tests"
	@echo "  make test-unit         - Run unit tests only"
	@echo "  make test-integration  - Run integration tests (requires Docker)"
	@echo "  make test-all          - Run both unit and integration tests"
	@echo "  make test-coverage     - Run tests with coverage report"
	@echo "  make mock              - Generate mocks using mockery"
	@echo "  make run               - Run the application"
	@echo "  make build             - Build the application"
	@echo "  make clean             - Clean build artifacts"

# Run unit tests (excludes integration tests)
test-unit:
	@echo "Running unit tests..."
	@go test -tags=unit ./... -v -short

# Run integration tests only (requires Docker)
test-integration:
	@echo "Running integration tests..."
	@go test -tags=integration ./internal/adapters/driven/mysql/integration/... -v
	@go test -tags=integration ./internal/adapters/driving/http/... -v

# Run all tests (unit + integration)
test-all:
	@echo "Running all tests..."
	@go test -tags=unit ./... -v -short
	@go test -tags=integration ./internal/adapters/driven/mysql/integration/... -v

# Alias for test-unit (default test target)
test: test-unit

# Run tests with coverage
test-coverage:
	@echo "Running tests with coverage..."
	@go test ./... -v -short -coverprofile=coverage.out
	@go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"

# Generate mocks using mockery
mock:
	@echo "Generating mocks..."
	@mockery --all --output=./mocks --case=underscore

# Run the application
run:
	@echo "Running application..."
	@go run cmd/main.go

# Build the application
build:
	@echo "Building application..."
	@go build -o bin/blogg cmd/main.go

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf bin/
	@rm -f coverage.out coverage.html
