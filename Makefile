.PHONY: check format lint typecheck build test

check: format lint typecheck build test

format:
	npx prettier --check .

lint:
	npx eslint .

typecheck:
	npx astro check

build:
	npx astro build

test:
	npx playwright test
