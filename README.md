# Seaverse LMS Automation

Enterprise Playwright Automation Framework using TypeScript.

## Folder Structure Overview

- `pages/`: Page Object Model (POM) classes.
- `fixtures/`: Custom Playwright fixtures.
- `tests/`: Test specs (`*.spec.ts`).
- `playwright/.auth/`: Stored authentication state (e.g., `user.json`).

## Setup Instructions
1. Install dependencies: `npm install`
2. Install browsers: `npx playwright install`
3. Configure `.env`: Set your variables in `.env` based on `.env.example` (or your initial setup).

## Running Tests
- Headless Mode: `npx playwright test`
- UI Mode: `npx playwright test --ui`
