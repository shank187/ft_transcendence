NAME = ft_transcendence

# Start the project normally
all: up

# Start containers in the background
up:
	docker compose up -d

# Stop and remove containers
down:
	docker compose down

# Rebuild and start containers
build:
	docker compose up --build -d

# Remove containers, networks, and volumes (fixes networking/orphan issues)
clean:
	docker compose down -v --remove-orphans

# Deep clean: remove everything including old images and cache
fclean: clean
	docker system prune -af

# Full reset: clean and rebuild from scratch
re: clean build

# View logs for all containers (follow mode)
logs:
	docker compose logs -f

# Push Prisma schema to PostgreSQL database
db-push:
	docker exec -it transcendence_backend npx prisma db push

# Start Prisma Studio to view the database in the browser
db-studio:
	docker exec -it transcendence_backend npx prisma studio

# List running containers
ps:
	docker ps

.PHONY: all up down build clean fclean re logs db-push db-studio ps