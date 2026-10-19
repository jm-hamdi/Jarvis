.PHONY: up down logs demo reset attack build

## Start the full stack
up:
	docker compose up -d --build

## Stop the full stack
down:
	docker compose down

## Follow logs (all services)
logs:
	docker compose logs -f

## Run the automated demo scenario (attack → detect → remediate → verify)
demo:
	@echo "▶  Launching demo scenario..."
	docker compose exec -T remediator python /app/demo.py || true
	cd attacks && python normal_traffic.py &
	sleep 5
	cd attacks && bash flood.sh

## Reset everything (volumes + containers)
reset:
	docker compose down -v --remove-orphans
	docker volume prune -f

## Launch attack scripts from this machine (dev only)
attack:
	cd attacks && bash flood.sh

## Build images without starting
build:
	docker compose build
