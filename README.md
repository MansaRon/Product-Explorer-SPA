# Product Explorer

A modern Angular 19+ SPA demonstrating senior-level proficiency in Angular and TypeScript with micro-frontend readiness.

## Features

- ✅ Modern Angular (standalone components, signals, lazy loading)
- ✅ TypeScript strict mode with full type safety
- ✅ Responsive mobile-first design
- ✅ Accessible (WCAG AA compliant)
- ✅ Comprehensive test coverage (Jest + Spectator)
- ✅ Micro-frontend ready architecture
- ✅ Clean, maintainable code following SOLID principles

## Tech Stack

- **Framework:** Angular 19+
- **Language:** TypeScript (strict mode)
- **State Management:** Angular Signals
- **Styling:** SCSS with CSS custom properties
- **Testing:** Jest + Spectator
- **Build Tool:** Angular CLI

## Prerequisites

Before running this project, ensure you have:

- **Node.js:** v18.19+ or v20.9+ (LTS recommended)
- **npm:** v9+ (comes with Node.js)
- **Angular CLI:** v19+ (optional, but recommended)

Check your versions:
```bash
node --version
npm --version
```

## Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd product-explorer
```

2. **Install dependencies:**
```bash
npm install
```

3. **Verify installation:**
```bash
ng version
```

## Running the Application

### Development Server

Start the development server:
```bash
npm start
# or
ng serve
```

Navigate to `http://localhost:4200/` in your browser. The application will automatically reload if you change any source files.

### Production Build

Build the project for production:
```bash
npm run build
# or
ng build --configuration production
```

The build artifacts will be stored in the `dist/` directory.

## Testing

### Run Unit Tests
```bash
npm test
# or
npm run test:watch  # Watch mode
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

Coverage reports will be generated in the `coverage/` directory.

### View Coverage Report
```bash
open coverage/lcov-report/index.html  # macOS
xdg-open coverage/lcov-report/index.html  # Linux
start coverage/lcov-report/index.html  # Windows
```

## Project Structure
```
product-explorer/
├── src/
│   ├── app/
│   │   ├── core/                    # Core services, guards, models
│   │   │   ├── guards/
│   │   │   │   └── admin.guard.ts
│   │   │   ├── models/
│   │   │   │   ├── product.model.ts
│   │   │   │   ├── filter-params.ts
│   │   │   │   └── nav-item.ts
│   │   │   └── services/
│   │   │       ├── product.service.ts
│   │   │       ├── favourite.service.ts
│   │   │       └── auth.service.ts
│   │   ├── features/                # Feature modules (lazy loaded)
│   │   │   ├── catalog/
│   │   │   │   ├── catalog.routes.ts
│   │   │   │   ├── catalog-list/
│   │   │   │   └── product-detail/
│   │   │   ├── favorites/
│   │   │   │   ├── favorites.routes.ts
│   │   │   │   └── favorites-list/
│   │   │   └── admin/
│   │   │       ├── admin.routes.ts
│   │   │       └── admin-dashboard/
│   │   ├── shared/                  # Shared components
│   │   │   ├── components/
│   │   │   │   ├── header/
│   │   │   │   ├── loader/
│   │   │   │   ├── error-message/
│   │   │   │   ├── product-card/
│   │   │   │   └── empty-state/
│   │   │   └── utils/               # Utility functions
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── assets/
│   │   └── data/
│   │       └── products.json
│   └── styles.scss
├── jest.config.js
├── setup-jest.ts
└── README.md
```

## Application Features

### Catalog

- Browse products with search, filter, and sort
- View product details
- Add/remove favorites
- Responsive grid layout

### Favorites

- View all favorited products
- Persistent storage (localStorage)
- Clear all favorites
- Empty state handling

### Admin Dashboard

- Protected route (requires admin access)
- Product statistics and analytics
- Category breakdowns
- Top-rated products

### Admin Access

To access the Admin dashboard:

1. Click the **" Guest Mode"** button in the header
2. It will toggle to **" Admin Mode"**
3. Now you can access the Admin section

Or via browser console:
```javascript
sessionStorage.setItem('isAdmin', 'true');
// Refresh the page
```

## Key Features

### Modern Angular Patterns

- **Standalone Components:** No NgModules
- **Signals:** Reactive state management
- **Control Flow:** Modern `@if`, `@for`, `@switch` syntax
- **Lazy Loading:** Feature-based code splitting
- **Type Safety:** Strict TypeScript throughout

### Architecture

- **Feature-based structure:** Organized for scalability
- **Lazy loading boundaries:** Each feature is independently loadable
- **Micro-frontend ready:** Can be split into host + remotes
- **SOLID principles:** Clean, maintainable code

### Accessibility

- WCAG AA compliant
- Keyboard navigation
- Screen reader support
- Focus management
- ARIA attributes

### Performance

- Lazy loading routes
- OnPush change detection
- Optimized bundle size
- Simulated network latency (800ms) for realistic UX

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Code Quality

- **TypeScript:** Strict mode enabled
- **Linting:** ESLint configured
- **Testing:** 80%+ coverage target
- **Formatting:** Consistent code style

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm run build` | Build for production |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate coverage report |
| `ng lint` | Run linter |

## Troubleshooting

### Port Already in Use

If port 4200 is already in use:
```bash
ng serve --port 4300
```

### Clear Cache

If you encounter build issues:
```bash
rm -rf .angular
rm -rf node_modules
npm install
```

### Test Failures

If tests fail after updates:
```bash
npm test -- --clearCache
npm test
```

## Contributing

This is a demonstration project. For improvements or issues, please follow standard Git workflow:

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## License

This project is for demonstration purposes.

## Author

Product Explorer - Angular SPA Demonstration

---

For architecture details and micro-frontend strategy, see [SOLUTION.md](./SOLUTION.md).