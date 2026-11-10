# Petclinic Playwright Portfolio

An authenticated Playwright + TypeScript test project for the Bondar Academy Petclinic demo. It demonstrates browser UI tests, a Page Object Model, reusable fixtures, API interception, and bearer-token API setup.

## Requirements

- Node.js 24+
- npm
- A Petclinic demo account

## Setup

Before running the tests, open `https://petclinic.bondaracademy.com` and create an account using the site's **Sign up** or **Create account** option, if available. Complete any email verification. If public registration is disabled, use an account provided for the demo; this project's setup signs in with an existing account and does not create one.

```bash
npm install
cp .env-SAMPLE .env
```

Set the demo account credentials in `.env`:

```ini
EMAIL=your.email@example.com
PASSWORD=your-password
```

`.env` and generated authentication state are git-ignored. Global setup reads the credentials from the environment, signs in through the app's Auth0 login page, and saves browser state and an API access token under `.auth/`. Do not commit credentials, storage state, or tokens.

Run the Chromium suite after setup:

```bash
npm run test-chromium
```

## Run and debug

| Command | Purpose |
| --- | --- |
| `npm test` | Run the desktop Chromium suite |
| `npm run test-chromium` | Run tests in Chromium |
| `npm run test-firefox` | Run tests in Firefox |
| `npm run test-api` | Run API tests in Firefox |
| `npm run test-chromium-ui` | Run UI tests in Chromium, one at a time |
| `npm run test-firefox-ui` | Run UI tests in Firefox, one at a time |
| `npx playwright test --ui` | Explore and rerun tests in UI mode |
| `npx playwright test --headed` | Watch tests in a visible browser |
| `npx playwright test --debug` | Debug with the Playwright Inspector |
| `npx playwright test tests/pet-types.spec.ts` | Run the Pet Types tests |
| `npx playwright test tests/api-tests.spec.ts` | Run the API tests |
| `npx playwright test --grep "updates a pet type"` | Run a matching test |
| `npx playwright show-report` | Open the HTML report |
| `npm run typecheck` | Type-check the TypeScript files |

Traces are captured on retry. For a trace from every run, temporarily use `trace: 'on'` in the Playwright configuration.

## Test examples

- `tests/homework.spec.ts` — welcome content assertion using a locator.
- `tests/pet-types.spec.ts` — Pet Types table row and edit form interactions; restores the shared demo data.
- `tests/api-tests.spec.ts` — makes authenticated API requests to search, create, read, update, and delete owners, pets, and visits.
- `tests/test-data/owner.json` — sample owner, pet, and visit data for API test examples.
- `page-objects/pet-types.page.ts` — Page Object Model for Pet Types.
- `tests/fixtures.ts` — typed page-object fixture and an authenticated `APIRequestContext` fixture with a bearer token.

Use role, label, and text locators where possible; scope actions to a row or form. Keep selectors in page objects when they describe app behavior, and use `test.step()` for multi-part workflows whose steps should appear in reports.

## Topics and application scope

The test configuration currently runs desktop Chromium only; mobile emulation is disabled. Authentication is shared using Playwright `storageState`; the API fixture reads the access token produced by global setup, while the API mocking test demonstrates request interception without depending on mutable backend data. Environment variables are loaded from `.env`.

The current Petclinic flows provide a home page and Pet Types management example. Add tests for radio buttons, checkboxes, tooltips, date pickers, visits, iFrames, sliders, and web tables only when those controls are available in the target application; this project avoids claiming coverage for UI that the tested app does not expose.
