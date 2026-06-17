IMAGE ?= devops-portfolio
TAG ?= local
PORT ?= 8080

.PHONY: build run compose-up compose-down smoke

build:
	docker build -t $(IMAGE):$(TAG) .

run:
	docker run --rm -p $(PORT):8080 $(IMAGE):$(TAG)

compose-up:
	docker compose up --build -d

compose-down:
	docker compose down

smoke:
	curl -fsS http://127.0.0.1:$(PORT)/healthz
