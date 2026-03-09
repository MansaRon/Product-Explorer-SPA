# Product Explorer — Improvement Roadmap

This document tracks all planned improvements for the Product Explorer application, broken down by category with clear rationale and implementation steps. Items are tackled one at a time in the order listed below.

---

## Table of Contents

1. [CSS Cleanup & Redundant Code Removal](#1-css-cleanup--redundant-code-removal)
2. [Replace `effect()` Syncing with `linkedSignal`](#2-replace-effect-syncing-with-linkedsignal)
3. [Use `fromPartial` in Unit Tests](#3-use-frompartial-in-unit-tests)
4. [Husky Pre-Push Git Hooks](#4-husky-pre-push-git-hooks)
5. [Commit Message Templates (Conventional Commits)](#5-commit-message-templates-conventional-commits)
6. [SonarQube Integration](#6-sonarqube-integration)
7. [Add IDs to Selectors for E2E Testing](#7-add-ids-to-selectors-for-e2e-testing)
8. [Global HTTP Interceptor](#8-global-http-interceptor)
9. [NestJS Backend](#9-nestjs-backend)
10. [Playwright E2E Tests](#10-playwright-e2e-tests)
11. [Update README & SOLUTION.md](#11-update-readme--solutionmd)

---

## 1. CSS Cleanup & Redundant Code Removal

### What
Audit all SCSS files across the application to remove dead rules, consolidate duplicated styles, and enforce consistent use of the existing CSS custom properties (design tokens) defined in `styles.scss`.

### Why
- Redundant CSS increases bundle size and makes design changes harder.
- Inconsistent use of hardcoded values (colours, spacing) instead of CSS variables breaks the design system.
- Cleaner styles reduce the risk of specificity conflicts and make responsive fixes easier.

### How
1. Audit `src/styles.scss` to confirm the full set of CSS custom properties (tokens).
2. For each component SCSS file, check for:
   - Hardcoded colour values that should reference a `--color-*` variable.
   - Hardcoded spacing/sizing that should reference a `--spacing-*` or `--radius-*` variable.
   - Duplicate rules that already exist globally.
   - Dead rules for elements that no longer exist in the template.
3. Remove or consolidate findings.
4. Verify visuals against all three breakpoints (mobile / tablet / desktop) after changes.

### Files in Scope
- `src/styles.scss` (global tokens)
- All `*.component.scss` files under `src/app/`

### Definition of Done
- No hardcoded colour hex values outside of `styles.scss`.
- No duplicate declarations across components.
- All breakpoints visually correct.
- Bundle size does not increase.

---

## 2. Replace `effect()` Syncing with `linkedSignal`

### What
Replace manual state-synchronisation patterns — plain mutable properties kept in sync with `input()` signals via `effect()`, and duplicate local signals manually reset when service state resets — with Angular 19's `linkedSignal`.

`linkedSignal` creates a writable signal whose value automatically resets to the source computation whenever the source changes, but can still be overridden manually by the user. This is the correct primitive for "default from source, but locally editable" state.

### Why
- `effect()` used purely to sync one signal into another is an anti-pattern; it adds an extra change-detection cycle and obscures ownership of state.
- Plain mutable class properties (`selectedOption`, `selectedMethod`) are not reactive — templates using `OnPush` change detection won't update unless explicitly triggered.
- Duplicate signals in `CatalogComponent` that mirror service state require manual coordination in `resetFilters()`. `linkedSignal` removes that coordination entirely.

### Locations to Update

#### A. `OptionsComponent` (`delivery-options/options.component.ts`)

The `selectedOption` property is a plain mutable variable synced from `initialData` via `effect()`. The `effect()` is doing nothing but a sync — exactly what `linkedSignal` is for.

```typescript
// Before
protected selectedOption: DeliveryOption | undefined;

constructor() {
  effect(() => {
    const data = this.initialData();
    if (data) {
      this.selectedOption = data;
      this.formValidity.emit(true);
    } else {
      this.formValidity.emit(false);
    }
  });
}
```

```typescript
// After
import { linkedSignal } from '@angular/core';

protected selectedOption = linkedSignal(() => this.initialData());
```

`selectedOption` now automatically resets to the latest `initialData()` whenever the parent rerenders with new data, and `selectOption()` can still call `selectedOption.set(option)` to record a user pick.

---

#### B. `PaymentMethodComponent` (`payment-methods/payment.component.ts`)

Same pattern as above — `selectedMethod` is a plain property synced from `initialData` via `effect()`.

```typescript
// Before
protected selectedMethod: PaymentMethod | undefined;

constructor() {
  effect(() => {
    const data = this.initialData();
    if (data) this.selectedMethod = data;
  });
}
```

```typescript
// After
protected selectedMethod = linkedSignal(() => this.initialData());
```

---

#### C. `CatalogComponent` (`catalog/catalog.component.ts`)

`searchTerm`, `selectedCategory`, `selectedSort`, and `selectedOrder` are plain `signal()`s that shadow the service's `filterParams`. They are manually reset inside `resetFilters()`. With `linkedSignal`, each local UI signal can be linked to its corresponding field in the service's `filterParams` signal, so a `productService.resetFilters()` call automatically resets the component signals too — no manual coordination needed.

```typescript
// Before
protected readonly searchTerm = signal('');
protected readonly selectedCategory = signal('');
protected readonly selectedSort = signal<SortField>('name');
protected readonly selectedOrder = signal<SortOrder>('asc');

protected resetFilters(): void {
  this.searchTerm.set('');          // manual reset
  this.selectedCategory.set('');    // manual reset
  this.selectedSort.set('name');    // manual reset
  this.selectedOrder.set('asc');    // manual reset
  this.productService.resetFilters();
}
```

```typescript
// After
import { linkedSignal } from '@angular/core';

protected readonly searchTerm = linkedSignal(
  () => this.filterParams().searchTerm
);
protected readonly selectedCategory = linkedSignal(
  () => this.filterParams().category
);
protected readonly selectedSort = linkedSignal<SortField>(
  () => this.filterParams().sortBy
);
protected readonly selectedOrder = linkedSignal<SortOrder>(
  () => this.filterParams().sortOrder
);

protected resetFilters(): void {
  this.productService.resetFilters();
  // linkedSignals above automatically reflect the reset — no manual .set() needed
}
```

---

### How

1. Import `linkedSignal` from `@angular/core` (available since Angular 19.1).
2. Replace each affected property as shown above.
3. Remove the now-redundant `effect()` blocks.
4. Update the `formValidity` emission logic: move it into `selectOption`/`selectMethod` and an initial `effect()` that watches the `linkedSignal` value (or use `computed()` for validity).
5. Run `npm test` to verify no regressions.

### Files in Scope
- `src/app/shared/components/delivery-options/options.component.ts`
- `src/app/shared/components/payment-methods/payment.component.ts`
- `src/app/features/catalog/catalog.component.ts`

### Definition of Done
- No `effect()` used solely to sync one signal into another.
- No plain mutable properties where a reactive signal should be used.
- `CatalogComponent.resetFilters()` calls only `productService.resetFilters()`.
- All unit and component tests pass.

---

## 3. Use `fromPartial` in Unit Tests

### What
Replace fully-specified mock objects in unit tests with `fromPartial<T>(...)` from `@total-typescript/shoehorn` (already installed). This utility lets you create a typed partial object and only specify the fields your test actually needs.

### Why
- Tests that spell out every property of a large model are brittle — any model change requires updating every mock.
- `fromPartial` keeps tests focused on what they're actually testing.
- Reduces boilerplate in `*.spec.ts` files significantly.

### How
```typescript
// Before
const mockProduct: Product = {
  id: '1',
  name: 'Wireless Headphones',
  description: 'High-quality wireless headphones...',
  price: 199.99,
  category: 'Electronics',
  imageUrl: 'headphones.jpg',
  rating: 4.5,
  stock: 10,
};

// After
import { fromPartial } from '@total-typescript/shoehorn';

const mockProduct = fromPartial<Product>({ id: '1', price: 199.99 });
```

1. Search all `*.spec.ts` files for large inline object literals that match model interfaces.
2. Replace each with `fromPartial<ModelType>({ ...only relevant fields... })`.
3. Run the full test suite to confirm no regressions.

### Files in Scope
All files under `src/app/**/*.spec.ts`.

### Definition of Done
- All spec files use `fromPartial` for mock model objects with more than 3 properties.
- `npm test` passes with no failures.

---

## 4. Husky Pre-Push Git Hooks

### What
Add [Husky](https://typicode.github.io/husky/) to the project so that automated checks run automatically before a `git push`. This prevents broken code from ever reaching the remote branch.

### Why
- Catches linting and test failures locally before CI even runs.
- Enforces code quality as a workflow habit, not just a CI afterthought.
- Pre-push (not pre-commit) keeps the developer loop fast — quick commits are still instant.

### Hooks to Add

| Hook | Trigger | Command |
|------|---------|---------|
| `pre-push` | `git push` | `npm run lint && npm test` |
| `commit-msg` | `git commit` | `npx commitlint --edit` (validates commit message format — see item 4) |

### How
```bash
# 1. Install Husky and commitlint
npm install --save-dev husky @commitlint/cli @commitlint/config-conventional lint-staged

# 2. Initialise Husky
npx husky init

# 3. Add pre-push hook (runs lint + unit tests)
echo "npm run lint && npm test" > .husky/pre-push

# 4. Add commit-msg hook (validates message format)
echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg

# 5. Add prepare script to package.json so Husky installs after npm install
```

```json
// package.json
"scripts": {
  "prepare": "husky"
}
```

### Definition of Done
- `git push` runs lint and unit tests; push is blocked if either fails.
- Invalid commit messages (e.g. `"fixed stuff"`) are rejected at commit time.
- `npm install` re-installs hooks via the `prepare` script.

---

## 5. Commit Message Templates (Conventional Commits)

### What
Enforce [Conventional Commits](https://www.conventionalcommits.org/) format across the repository using `commitlint`. A `commitlint.config.js` file defines the rules and a `.gitmessage` template guides developers.

### Why
- Consistent commit history makes changelogs, code reviews, and git bisect much easier.
- Enables automated tooling (e.g., semantic-release, changelog generation) in the future.
- Teams have a shared vocabulary for what a commit does.

### Commit Types

| Type | When to use |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `chore` | Maintenance (deps, tooling, config) |
| `refactor` | Code change with no functional impact |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `style` | Formatting / CSS / whitespace only |
| `perf` | Performance improvement |
| `ci` | CI/CD pipeline changes |
| `build` | Build system changes |
| `revert` | Reverting a previous commit |

### Format
```
<type>(<optional scope>): <short description>

[optional body]

[optional footer: BREAKING CHANGE or issue reference]
```

### Examples
```
feat(catalog): add sort by price to product list
fix(auth): redirect to login when session expires
chore(deps): upgrade angular to 19.2.0
test(product-service): add fromPartial mocks for filter tests
docs: update README with NestJS backend setup steps
```

### How
```js
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'chore', 'refactor', 'test',
      'docs', 'style', 'perf', 'ci', 'build', 'revert'
    ]],
    'subject-case': [2, 'always', 'lower-case'],
    'header-max-length': [2, 'always', 100],
  },
};
```

The `commit-msg` Husky hook (from item 3) runs `commitlint` to validate every commit message against these rules.

> **Note:** The user will provide a link to the specific commit strategy document — the rules above will be updated to match it exactly.

### Definition of Done
- `commitlint.config.js` is present and follows the agreed strategy.
- The Husky `commit-msg` hook blocks non-conforming messages.
- A `.gitmessage` template file is committed to the repo.

---

## 6. SonarQube Integration

### What
Integrate [SonarQube](https://www.sonarqube.org/) (or SonarCloud for a hosted option) to provide continuous code quality analysis, including code smells, security vulnerabilities, duplication, and test coverage reporting.

### Why
- Surfaces issues that linting alone won't catch (cognitive complexity, security hotspots, duplication).
- Provides a coverage dashboard that's shareable with the team without opening local HTML reports.
- Acts as a quality gate — a PR can be blocked if coverage drops below the threshold.

### Components

| Component | Role |
|-----------|------|
| SonarQube server | Hosts the analysis dashboard (local Docker or SonarCloud) |
| `sonar-scanner` | CLI tool that sends analysis results to the server |
| `sonar-project.properties` | Configuration file in the project root |
| Jest coverage (LCOV) | Coverage data that SonarQube reads |

### How

```properties
# sonar-project.properties
sonar.projectKey=product-explorer
sonar.projectName=Product Explorer
sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.spec.ts
sonar.exclusions=**/node_modules/**,**/dist/**,**/*.spec.ts
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.typescript.tsconfigPath=tsconfig.json
sonar.coverage.exclusions=**/*.spec.ts,**/main.ts,**/environment*.ts
```

```json
// package.json — new script
"sonar": "sonar-scanner"
```

```bash
# Run analysis (after npm run test:coverage)
npm run test:coverage && npm run sonar
```

#### Local Docker Setup (Optional)
```bash
docker run -d --name sonarqube \
  -p 9000:9000 \
  sonarqube:community
```

### Quality Gate Thresholds
- Coverage: ≥ 80%
- Duplications: ≤ 3%
- Maintainability rating: A
- Reliability rating: A

### Definition of Done
- `sonar-project.properties` is committed.
- `npm run sonar` sends a successful analysis report.
- Coverage is visible in the SonarQube dashboard.
- Quality gate thresholds are configured.

---

## 7. Add IDs to Selectors for E2E Testing

### What
Add `data-testid` attributes (or `id` attributes for truly unique elements) to interactive and meaningful elements across all component templates. These are used exclusively by E2E tests, keeping test selectors decoupled from CSS classes or element structure.

### Why
- CSS class selectors are fragile — a style refactor breaks tests.
- `data-testid` attributes communicate intent: "this element is tested."
- E2E tests become resilient to template restructuring.

### Naming Convention
```
data-testid="<feature>-<component>-<element>"
```

Examples:
```html
<button data-testid="catalog-product-card-favorite-btn">
<input data-testid="catalog-filter-search-input">
<div data-testid="catalog-product-list-container">
<button data-testid="cart-summary-checkout-btn">
<div data-testid="order-confirmation-order-number">
```

### How
1. Audit all component templates in `src/app/features/` and `src/app/shared/`.
2. Add `data-testid` to:
   - All interactive elements (buttons, inputs, links, selects).
   - Key container elements used for visibility assertions.
   - Dynamic content (product cards, list items) using interpolated IDs.
3. Update existing Playwright tests to use `page.getByTestId()` selectors.

### Playwright Usage
```typescript
// Before (fragile)
await page.locator('.product-card button.favorite-btn').click();

// After (robust)
await page.getByTestId('catalog-product-card-favorite-btn').click();
```

### Definition of Done
- All interactive elements in feature components have `data-testid` attributes.
- All existing Playwright tests updated to use `getByTestId`.
- No tests use CSS class selectors.

---

## 8. Global HTTP Interceptor

### What
Create an Angular `HttpInterceptorFn` that runs on every outgoing HTTP request and incoming response. Once the NestJS backend (item 8) is connected, this interceptor handles cross-cutting concerns centrally.

### Why
- Avoids repeating auth header injection, loading state management, and error handling in every service.
- Provides a single place to add, modify, or debug all HTTP traffic.
- Required for attaching JWT tokens once real authentication is implemented.

### Responsibilities

| Concern | What the interceptor does |
|---------|--------------------------|
| Auth headers | Attaches `Authorization: Bearer <token>` from session/storage |
| Loading state | Emits a global loading signal (start/end) |
| Error handling | Maps 401 → redirect to login; 500 → show global error toast |
| Request logging | Logs method + URL in development mode |
| Retry logic | Auto-retries idempotent requests on network failure (optional) |

### How
```typescript
// src/app/core/interceptors/api.interceptor.ts
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem('authToken');

  const authReq = token
    ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) { /* redirect */ }
      if (error.status >= 500) { /* show error toast */ }
      return throwError(() => error);
    })
  );
};
```

```typescript
// app.config.ts — register interceptor
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([apiInterceptor]))
  ]
};
```

### Definition of Done
- `api.interceptor.ts` exists under `src/app/core/interceptors/`.
- Interceptor is registered in `app.config.ts`.
- Unit test covers: auth header injection, 401 handling, 500 handling.
- All HTTP calls in services go through the interceptor.

---

## 9. NestJS Backend

### What
Create a standalone NestJS application (`product-explorer-api/`) as a sibling project that serves the product data currently read from the static `products.json` file. The Angular app will call this backend instead of loading local JSON.

### Why
- Moves the app from a static demo to a real client-server architecture.
- Enables future features: auth, cart persistence, order management, admin CRUD.
- Makes the E2E tests test a realistic stack.
- Demonstrates full-stack proficiency.

### Tech Stack

| Concern | Choice | Reason |
|---------|--------|--------|
| Framework | NestJS | Structured, Angular-like DI, TypeScript-first |
| Database | JSON file → SQLite (migration path) | Keeps initial setup simple |
| Auth | JWT (future) | Industry standard |
| Validation | `class-validator` + `class-transformer` | NestJS built-in support |
| API style | REST | Matches existing Angular service structure |

### Proposed API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/products` | List all products (with filter/sort query params) |
| `GET` | `/api/products/:id` | Single product detail |
| `POST` | `/api/orders` | Place an order |
| `GET` | `/api/orders/:id` | Get order by ID |
| `GET` | `/api/categories` | List all categories |

### Project Structure
```
product-explorer-api/
├── src/
│   ├── products/
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   ├── dto/
│   │   │   └── filter-products.dto.ts
│   │   └── products.module.ts
│   ├── orders/
│   │   ├── orders.controller.ts
│   │   ├── orders.service.ts
│   │   ├── dto/
│   │   │   └── create-order.dto.ts
│   │   └── orders.module.ts
│   ├── app.module.ts
│   └── main.ts
├── nest-cli.json
└── package.json
```

### CORS Configuration
The NestJS server will allow requests from `http://localhost:4200` during development.

### How
```bash
# From the parent directory
npm install -g @nestjs/cli
nest new product-explorer-api
```

The Angular `ProductService` and `OrderService` URLs will be updated from the local JSON asset path to `http://localhost:3000/api/...`.

### Definition of Done
- NestJS app starts with `npm start` on port `3000`.
- All Angular services fetch from the API (no more local JSON reads).
- CORS is configured for local development.
- At least one endpoint has a NestJS unit test.
- E2E tests run against the live stack (Angular + NestJS).

---

## 10. Playwright E2E Tests

### What
Expand the existing Playwright test suite (currently minimal) to cover all critical user flows end-to-end with meaningful assertions. Tests run against a live Angular + NestJS stack.

### Why
- Unit tests verify individual pieces; E2E tests verify the whole experience.
- Catches integration issues invisible to unit tests (routing, navigation, API response handling).
- Provides confidence for refactoring.

### Flows to Cover

| Flow | Priority | Notes |
|------|----------|-------|
| Browse product catalog | High | Search, filter, sort |
| View product detail | High | Navigate from card, back button |
| Add / remove favourite | High | Persists across page reload |
| Add product to cart | High | From detail page |
| Checkout flow | High | Form validation, order summary |
| Order confirmation | High | Correct order number displayed |
| Admin dashboard access | Medium | Toggle admin mode, view stats |
| Empty states | Medium | No products found, no favourites |
| Error states | Low | API down → error message shown |

### Test File Structure
```
e2e/
├── catalog.spec.ts
├── product-detail.spec.ts
├── favourites.spec.ts
├── cart.spec.ts
├── checkout.spec.ts
├── order-confirmation.spec.ts
├── admin.spec.ts
└── helpers/
    └── test-utils.ts   # shared selectors, navigation helpers
```

### Selector Strategy
Use `data-testid` attributes exclusively (see item 6):
```typescript
// e2e/helpers/test-utils.ts
export const selectors = {
  catalog: {
    searchInput: '[data-testid="catalog-filter-search-input"]',
    productCard: (id: string) => `[data-testid="catalog-product-card-${id}"]`,
    favoriteBtn: '[data-testid="catalog-product-card-favorite-btn"]',
  },
  checkout: {
    firstNameInput: '[data-testid="checkout-form-firstname-input"]',
    submitBtn: '[data-testid="checkout-form-submit-btn"]',
  },
};
```

### Definition of Done
- All flows in the table above have at least one passing E2E test.
- Tests run in CI (`npm run e2e`) without flakiness.
- `data-testid` selectors are used throughout (no CSS class selectors).
- Playwright HTML report is generated as a CI artifact.

---

## 11. Update README & SOLUTION.md

### What
Update both documents to reflect the new architecture (NestJS backend, Husky, SonarQube, Playwright) and replace placeholder content with accurate, up-to-date information.

### README.md Changes
- Add **Prerequisites** entry for NestJS/Node (backend).
- Add **Running the Backend** section (`cd product-explorer-api && npm start`).
- Update **Available Scripts** table with new entries (`sonar`, `e2e`, `prepare`).
- Update **Project Structure** to include `product-explorer-api/` and `e2e/`.
- Add **Git Workflow** section documenting the Husky hooks and commit convention.
- Add **Code Quality** section linking to SonarQube dashboard.

### SOLUTION.md Changes
- Add **Backend Architecture** section describing NestJS setup.
- Add **Testing Strategy** updates: SonarQube quality gates, Playwright E2E matrix.
- Update **Future Enhancements** to move completed items to the "Implemented" list.
- Add **Commit Convention** reference.

### Definition of Done
- Both files are accurate and reflect the current state of the project.
- A new developer can follow the README to get both frontend and backend running locally.
- SOLUTION.md explains every architectural decision made during this improvement phase.

---

## Implementation Order

Items will be tackled in the following sequence, one at a time:

| # | Item | Status |
|---|------|--------|
| 1 | CSS Cleanup & Redundant Code Removal | Pending |
| 2 | Replace `effect()` Syncing with `linkedSignal` | Pending |
| 3 | `fromPartial` in Unit Tests | Pending |
| 4 | Husky Pre-Push Git Hooks | Pending |
| 5 | Commit Message Templates | Pending |
| 6 | SonarQube Integration | Pending |
| 7 | Add IDs to Selectors | Pending |
| 8 | Global HTTP Interceptor | Pending |
| 9 | NestJS Backend | Pending |
| 10 | Playwright E2E Tests | Pending |
| 11 | Update README & SOLUTION.md | Pending |

> Each item will be completed, tested, and committed before the next begins.
