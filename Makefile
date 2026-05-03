# Makefile

.PHONY: build run stop logs clean up down

# Docker build & run
build:
	docker build -t ecommerce-frontend:latest .

run:
	docker run -d -p 4200:80 --name ecommerce-app ecommerce-frontend:latest

stop:
	docker stop ecommerce-app

remove:
	docker rm ecommerce-app

logs:
	docker logs -f ecommerce-app

clean:
	docker stop ecommerce-app || true
	docker rm ecommerce-app || true
	docker rmi ecommerce-frontend:latest || true

rebuild: clean build run

# Docker Compose
up:
	docker-compose up -d --build

down:
	docker-compose down

restart:
	docker-compose restart

compose-logs:
	docker-compose logs -f frontend