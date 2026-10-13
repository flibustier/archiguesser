.DEFAULT_GOAL := help

##@ Setup

.PHONY: install
install: ## Install dependencies from the lockfile
	pnpm install --frozen-lockfile

##@ Development

.PHONY: start dev
start dev: ## Start the dev server with hot-reload
	pnpm run dev

.PHONY: build
build: ## Type-check and build for production
	pnpm run build

.PHONY: preview
preview: build ## Build, then serve the production bundle locally
	pnpm run preview

.PHONY: lint
lint: ## Lint and auto-fix with ESLint
	pnpm run lint

.PHONY: format
format: ## Format with Prettier
	pnpm run format

.PHONY: check
check: lint build test ## Lint, build and run unit tests (what CI checks)

##@ Tests

.PHONY: test
test: ## Run unit tests
	pnpm run test:unit

.PHONY: test-e2e
test-e2e: ## Run Playwright end-to-end tests
	pnpm run test:e2e

.PHONY: test-e2e-update
test-e2e-update: ## Update Playwright snapshots in Linux Docker (same as CI)
	pnpm run test:e2e:linux

##@ Daily data

.PHONY: download
download: ## Download sources: make download URL=<url> DAY=<n>
	@test -n "$(URL)" -a -n "$(DAY)" || { echo "Usage: make download URL=<url> DAY=<n>"; exit 1; }
	pnpm run download "$(URL)" "$(DAY)"

.PHONY: convert
convert: ## Convert sources/<DAY> into public/<DAY>: make convert DAY=<n>
	@test -n "$(DAY)" || { echo "Usage: make convert DAY=<n>"; exit 1; }
	pnpm run convert "$(DAY)"

.PHONY: convert-all
convert-all: ## Convert every numbered folder in sources/
	pnpm run convert:all

.PHONY: add
add: ## Add the next day to data.json: make add [LINK=<url>]
	deno task add $(LINK)

.PHONY: replay
replay: ## Replay a past day: make replay DAY=<n> [NEXT=<n>]
	@test -n "$(DAY)" || { echo "Usage: make replay DAY=<n> [NEXT=<n>]"; exit 1; }
	deno task replay $(DAY) $(NEXT)

.PHONY: thumbnails
thumbnails: ## Regenerate thumbnails for days 1..N: make thumbnails N=<n>
	@test -n "$(N)" || { echo "Usage: make thumbnails N=<n>"; exit 1; }
	./scripts/thumbnails.sh $(N)

##@ Release

.PHONY: deploy
deploy: ## Build and push dist/ to gh-pages
	pnpm run deploy

##@ Help

.PHONY: help
help: ## Show this help
	@awk 'BEGIN {FS = ":.*##"} \
		/^##@/ {printf "\n\033[1m%s\033[0m\n", substr($$0, 5)} \
		/^[a-zA-Z0-9_ -]+:.*##/ {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
