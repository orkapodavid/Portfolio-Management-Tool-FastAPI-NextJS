# Makefile

# Variables
BACKEND_DIR=fastapi_backend
FRONTEND_DIR=nextjs-frontend

# Help
.PHONY: help
help:
	@echo "Available commands:"
	@awk '/^[a-zA-Z_-]+:/{split($$1, target, ":"); print "  " target[1] "\t" substr($$0, index($$0,$$2))}' $(MAKEFILE_LIST)

# Backend commands
.PHONY: test-backend

test-backend: ## Run backend tests using pytest
	cd $(BACKEND_DIR) && uv run pytest


# Frontend commands
.PHONY: test-frontend

test-frontend: ## Run frontend tests using pnpm
	cd $(FRONTEND_DIR) && pnpm run test
