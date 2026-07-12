install:
	npm ci
	cd backend && npm ci
	cd frontend && npm ci

dev:
	npm run start:test

build:
	cd backend && npm run build
	cd frontend && npm run build

docker-build:
	docker build -t call-calendar .

docker-run:
	docker run -p 3000:3000 -e PORT=3000 call-calendar

test:
	npm run test:e2e

lint:
	cd frontend && npm run lint

clean:
	rm -rf backend/dist frontend/dist