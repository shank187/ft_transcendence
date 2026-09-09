NAME = ft_transcendence

# Default: build and start the complete project
all:
	docker compose up -d --build

# Start existing containers/images
up:
	docker compose up -d

# Build/rebuild images and start
build:
	docker compose up -d --build

# Stop and remove containers/network
# Database volume is preserved
down:
	docker compose down --remove-orphans

# Stop project without removing containers
stop:
	docker compose stop

# Restart services
restart:
	docker compose restart

# Show project containers
ps:
	docker compose ps

# Follow logs
logs:
	docker compose logs -f

# Backend logs only
logs-backend:
	docker compose logs -f backend

# Frontend logs only
logs-frontend:
	docker compose logs -f frontend

# PostgreSQL logs only
logs-db:
	docker compose logs -f postgres

# Apply committed Prisma migrations manually
db-migrate:
	docker compose exec backend npx prisma migrate deploy

# Run canonical seed manually
db-seed:
	docker compose exec backend npx prisma db seed

# Open Prisma Studio
db-studio:
	docker compose exec backend npx prisma studio --hostname 0.0.0.0 --port 5555

# Remove containers/network, preserve database data
clean:
	docker compose down --remove-orphans

# Explicit destructive reset: delete database volume too
reset:
	docker compose down -v --remove-orphans
	docker compose up -d --build

# Clean rebuild while preserving DB data
re:
	docker compose down --remove-orphans
	docker compose up -d --build

.PHONY: all up build down stop restart ps logs \
	logs-backend logs-frontend logs-db \
	db-migrate db-seed db-studio clean reset re