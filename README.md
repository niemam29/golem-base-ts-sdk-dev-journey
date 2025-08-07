# Golem Base TypeScript SDK Dev Journey

[![Daily Tests](https://github.com/krzysztofpaliga/golem-base-ts-sdk-dev-journey/actions/workflows/daily-tests.yml/badge.svg)](https://github.com/krzysztofpaliga/golem-base-ts-sdk-dev-journey/actions/workflows/daily-tests.yml)

This repository contains development experiments with the Golem Base TypeScript SDK, including automated daily testing of entity creation and validation.

## Features

- **Entity Creation**: Create sample entities with custom annotations
- **Metadata Validation**: Comprehensive assertions testing all entity properties
- **Daily Automated Tests**: GitHub Actions workflow running tests every midnight UTC
- **Error Handling**: Automatic issue creation on test failures

## Quick Start

1. Install dependencies: `npm install`
2. Build the project: `npm run build`
3. Run the application: `npm run app`

## Daily Testing

The repository includes automated daily testing via GitHub Actions. See [DAILY_TESTS_SETUP.md](DAILY_TESTS_SETUP.md) for configuration instructions.

## Project Structure

- `src/app.ts` - Main application with entity creation
- `src/assertions.ts` - Comprehensive validation using assert statements
- `src/entities.ts` - Entity creation utilities (if exists)
- `.github/workflows/daily-tests.yml` - Daily test automation
