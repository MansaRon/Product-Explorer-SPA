# Admin Panel — Build Plan & Tracking

Branch strategy: all sub-branches merge into `feature/admin-panel`, which merges into `master`.

---

## Branch Checklist

| # | Branch | Status | Notes |
|---|--------|--------|-------|
| ① | `admin/shell-layout` | ✅ Done | App-level layout refactor + admin shell + routing scaffold |
| ② | `admin/dashboard` | ✅ Done | Stats cards + analytics charts — requires branch ① |
| ③ | `admin/orders` | ✅ Done | Order list, status/pricing updates, rebook, refunds, stale purge |
| ④ | `admin/users` | 🔲 Pending | User list, user detail, block/unblock, reset |
| ⑤ | `admin/catalog` | 🔲 Pending | Product CRUD, image management, review moderation |
| ⑥ | `admin/categories` | 🔲 Pending | Category list + add/edit |
| ⑦ | `admin/coupons` | 🔲 Pending | Coupon/promo code create, manage, deactivate |
| — | `feature/admin-panel` | 🔲 Pending | Integration branch — merge into `master` when all above done |

Mark each row ✅ Done when its branch is merged into `feature/admin-panel`.

---

## Cross-reference: IMPROVEMENTS.md 👑 Items

Each crown-icon item from IMPROVEMENTS.md mapped to the branch that delivers it.

| IMPROVEMENTS.md Item | Scope | Frontend Branch | Backend status |
|----------------------|-------|-----------------|----------------|
| **#2** Admin: Create/manage coupons | New feature | ⑦ `admin/coupons` | ❌ Not built |
| **#3** Admin initiates refund (partial / full) | Extends branch ③ | ③ `admin/orders` | ❌ Not built |
| **#3** Restore inventory on refund | Backend side-effect | ③ (UI only surfaces it) | ❌ Not built |
| **#3** Refund history in order details | Extends order-edit view | ③ `admin/orders` | ❌ Not built |
| **#4** Admin review moderation (hide/remove/approve) | Extends branch ⑤ | ⑤ `admin/catalog` | ⚠️ DELETE exists; flag/hide/approve outstanding |
| **#8** Low-stock warning display | Dashboard stat card | ② `admin/dashboard` | ✅ Derivable from product data |
| **#8** Admin email when stock low | Backend notification | — (backend only) | ❌ Not built |
| **#14** Order counts by status | Dashboard stat card | ② `admin/dashboard` | ✅ `/order/admin/statistics` exists |
| **#14** Sales charts (daily/weekly/monthly) | Dashboard charts | ② `admin/dashboard` | ❌ Not built |
| **#14** Revenue tracking | Dashboard charts | ② `admin/dashboard` | ❌ Not built |
| **#14** Top selling products | Dashboard table | ② `admin/dashboard` | ❌ Not built |
| **#14** Customer analytics | Dashboard section | ② `admin/dashboard` | ❌ Not built |
| **#14** Conversion rate tracking | Dashboard section | ② `admin/dashboard` | ❌ Not built |

Other IMPROVEMENTS.md items unblocked by the admin panel:

| Item | Relationship |
|------|-------------|
| **#7** Add IDs for E2E Testing | Admin components need `data-testid` on all interactive elements |
| **#10** Playwright E2E Tests | `e2e/admin.spec.ts` already planned — unblocked when branches ①–⑦ land |

---

## ① `admin/shell-layout`

### What changes

**`app.component.html` / `app.component.ts`** — strip out `<app-header>` and the wrapper div.
Root component becomes a bare `<router-outlet>`. All consumer-facing chrome moves into a new
`ConsumerShellComponent`.

**New: `features/consumer-shell/`**
```
consumer-shell.component.ts   ← imports Header, Footer; wraps <router-outlet>
consumer-shell.component.html
consumer-shell.component.scss
```

**`app.routes.ts`** — wrap all non-admin routes under `ConsumerShellComponent` as a parent:
```typescript
{ path: '', component: ConsumerShellComponent, children: [ ...catalog, cart, orders, etc... ] }
{ path: 'admin', canActivate: [authGuard, adminGuard], loadChildren: () => ADMIN }
```

**New: `features/admin/admin-shell/`**
```
admin-shell.component.ts    ← sidebar nav + topbar (admin name + logout) + <router-outlet>
admin-shell.component.html
admin-shell.component.scss
```

**`admin.routing.ts`** — restructure with `AdminShellComponent` as parent layout:
```typescript
{ path: '', component: AdminShellComponent, children: [
    { path: '',                    redirectTo: 'dashboard' },
    { path: 'dashboard',           loadComponent: ... DashboardComponent },
    { path: 'orders',              loadComponent: ... OrderListComponent },
    { path: 'orders/:id',          loadComponent: ... OrderEditComponent },
    { path: 'users',               loadComponent: ... UserListComponent },
    { path: 'users/:id',           loadComponent: ... UserDetailComponent },
    { path: 'catalog',             loadComponent: ... ProductListComponent },
    { path: 'catalog/new',         loadComponent: ... ProductFormComponent },
    { path: 'catalog/:id/edit',    loadComponent: ... ProductFormComponent },
    { path: 'catalog/:id/reviews', loadComponent: ... ProductReviewsComponent },
    { path: 'categories',          loadComponent: ... CategoryListComponent },
    { path: 'coupons',             loadComponent: ... CouponListComponent },
]}
```

**`shared/enums/app-routes-enum.ts`** — add:
```typescript
ADMIN_DASHBOARD:  'dashboard',
ADMIN_ORDERS:     'orders',
ADMIN_USERS:      'users',
ADMIN_CATALOG:    'catalog',
ADMIN_CATEGORIES: 'categories',
ADMIN_COUPONS:    'coupons',
```

**Add to `core/models/api-response.ts`** — new paged wrapper type:
```typescript
export interface PagedApiResponse<T> {
  data: { items: T[]; totalCount: number; page: number; size: number };
  message: string; status: string; statusCode: number;
}
```

**Move `admin.component.*` → `admin/dashboard/dashboard.component.*`** (rename only — logic
overhaul is branch ②'s job).

---

## ② `admin/dashboard`

### Component: `features/admin/dashboard/`

**`dashboard.component.ts`**
- Inject `AdminStatsService`
- `orderStatusStats` — from confirmed endpoint `GET /order/admin/statistics`
- `platformStats` — from new `GET /admin/stats`
- `salesChartData = computed(...)` — transforms sales trend data for chart rendering
- `topProducts = computed(...)` — top 5 selling products by revenue

**`dashboard.component.html`**
- **Stat cards row** — total users, total orders, total revenue, pending orders, blocked users,
  low-stock count, out-of-stock count, avg product rating, total products, total categories
  *(low-stock and out-of-stock are derivable client-side from product list; others need backend)*
- **Sales trend chart** — line/bar chart (daily / weekly / monthly toggle); use Chart.js via
  `ng2-charts` wrapper or plain `<canvas>` with Chart.js directly
- **Order status breakdown** — doughnut/pie chart from `/order/admin/statistics` (already exists)
- **Top selling products table** — product name, category, units sold, revenue
- **Recent orders table** — last 10 system-wide orders, links to `admin/orders/:id`
- **Customer analytics row** — new users this month, returning vs new ratio

### New service: `core/services/admin/admin-stats.service.ts`
```typescript
loadOrderStatusStats(): void   // GET /order/admin/statistics  ← EXISTS
loadPlatformStats(): void      // GET /admin/stats             ← NEW
loadSalesTrend(period: 'daily' | 'weekly' | 'monthly'): void  // GET /admin/analytics/sales?period=...
loadTopProducts(): void        // GET /admin/analytics/top-products
loadCustomerAnalytics(): void  // GET /admin/analytics/customers
```

### New model: `core/models/admin-stats.ts`
```typescript
export interface OrderStatusStats {
  pending: number; confirmed: number; shipped: number;
  delivered: number; cancelled: number; refunded: number;
}
export interface PlatformStats {
  totalUsers: number; blockedUsers: number; newUsersThisMonth: number;
  totalOrders: number; totalRevenue: number;
  totalProducts: number; lowStockProducts: number; outOfStockProducts: number;
  totalCategories: number; avgProductRating: number;
}
export interface SalesTrendPoint {
  label: string;    // "Mon", "Week 12", "Jan"
  revenue: number;
  orderCount: number;
}
export interface TopSellingProduct {
  productId: string; title: string; category: string;
  unitsSold: number; revenue: number;
}
export interface CustomerAnalytics {
  newUsersThisMonth: number; returningUsersThisMonth: number;
  conversionRate: number;    // orders / unique visitors — backend must track this
}
```

---

## ③ `admin/orders`

### Components

**`features/admin/orders/order-list/`**
- `orderListSignal`, `isLoadingSignal`, `totalCountSignal`
- Filter signals: `statusFilter`, `searchTerm`, `dateFrom`, `dateTo`, `page`, `pageSize`
- `computedFilters = computed(...)` — builds query params object
- `effect()` on `computedFilters` → calls `adminOrderService.loadOrders(params)`
- Table columns: Order #, User email, Status badge, Total, Placed date, Actions (View/Edit)
- Bulk action: "Purge Stale Orders" → `ConfirmModalComponent` → `purgeStaleOrders()`

**`features/admin/orders/order-edit/`**

Sections on a single page:
1. **Order summary** — read-only header (order number, user, placed date, current status badge)
2. **Status update** — dropdown (`PENDING → CONFIRMED → SHIPPED → DELIVERED`) + optional notes
   textarea → `PATCH /admin/orders/:id/status`
3. **Price adjustment** — subtotal override + discount override + mandatory reason field
   → `PATCH /admin/orders/:id/pricing`; show original vs adjusted values side-by-side
4. **Rebook** — "Rebook Order" button + `ConfirmModalComponent`
   → `POST /admin/orders/:id/rebook`; on success navigate to new order's edit page
5. **Refund** — shown only when `orderStatus === 'DELIVERED' || orderStatus === 'CANCELLED'`
   - Refund type toggle: Full / Partial
   - If partial: amount input field (capped at `totalAmount`)
   - Reason textarea (required)
   - Restore inventory checkbox (default checked)
   - → `POST /admin/orders/:id/refund`
6. **Refund history** — read-only list of past refunds on this order (amount, date, reason,
   initiated by) — from `GET /admin/orders/:id/refunds`

### New service: `core/services/admin/admin-order.service.ts`
```typescript
loadOrders(params: AdminOrderFilterParams): void      // GET  /admin/orders
loadOrderById(orderId: string): void                  // GET  /admin/orders/:orderId
updateOrderStatus(orderId, status, notes?): void      // PATCH /admin/orders/:orderId/status
adjustOrderPricing(orderId, body): void               // PATCH /admin/orders/:orderId/pricing
rebookOrder(orderId): void                            // POST  /admin/orders/:orderId/rebook
initiateRefund(orderId, body): void                   // POST  /admin/orders/:orderId/refund
loadRefundHistory(orderId): void                      // GET   /admin/orders/:orderId/refunds
purgeStaleOrders(olderThanDays: number): void         // DELETE /admin/orders/stale
```

### New models: `core/models/admin-order.ts`
```typescript
export interface AdminOrderSummary {
  id: string; orderNumber: string; userId: string; userEmail: string;
  orderStatus: string; totalAmount: number; createdAt: string;
}
export interface AdminOrderFilterParams {
  page?: number; size?: number; status?: string;
  search?: string; dateFrom?: string; dateTo?: string;
}
export interface OrderStatusUpdateRequest {
  status: string; notes?: string;
}
export interface OrderPriceAdjustRequest {
  discount?: number; totalAmount?: number; reason: string;
}
export interface RefundRequest {
  type: 'FULL' | 'PARTIAL';
  amount?: number;           // required when type === 'PARTIAL'
  reason: string;
  restoreInventory: boolean;
}
export interface RefundRecord {
  id: string; type: 'FULL' | 'PARTIAL'; amount: number;
  reason: string; initiatedBy: string; createdAt: string; status: string;
}
```

---

## ④ `admin/users`

### Components

**`features/admin/users/user-list/`**
- Paginated table: Name, Email, Phone, Status badge (Active / Blocked), Joined date, Actions (View, Block/Unblock)
- Search by name or email
- Status filter: All / Active / Blocked
- Inline block/unblock via `ConfirmModalComponent`

**`features/admin/users/user-detail/`**
- User profile card (name, email, phone, role, status, joined date)
- Editable reset form: name, email, phone — `PATCH /admin/users/:userId/reset`
- Their order history: table linking to `admin/orders/:id`
- Block/Unblock button with `ConfirmModalComponent`
- "Send Password Reset" button → `POST /admin/users/:userId/reset-password`

### New service: `core/services/admin/admin-user.service.ts`
```typescript
loadUsers(params: AdminUserFilterParams): void      // GET  /admin/users
loadUserById(userId: string): void                  // GET  /admin/users/:userId
loadUserOrders(userId: string): void                // GET  /admin/users/:userId/orders
blockUser(userId, reason?): void                    // PATCH /admin/users/:userId/block  { blocked: true }
unblockUser(userId): void                           // PATCH /admin/users/:userId/block  { blocked: false }
resetUserDetails(userId, body): void                // PATCH /admin/users/:userId/reset
triggerPasswordReset(userId): void                  // POST  /admin/users/:userId/reset-password
```

### New models: `core/models/admin-user.ts`
```typescript
export interface AdminUserSummary {
  id: string; name: string; email: string; phone: string;
  status: 'ACTIVE' | 'BLOCKED'; roles: string[]; createdAt: string;
}
export interface AdminUserFilterParams {
  page?: number; size?: number; status?: string; search?: string;
}
export interface UserBlockRequest   { blocked: boolean; reason?: string; }
export interface UserResetRequest   { name?: string; email?: string; phone?: string; }
```

---

## ⑤ `admin/catalog`

### Components

**`features/admin/catalog/product-list/`**
- Full product table: image thumbnail, title, category, price, stock badge, avg rating, Actions (Edit, Reviews, Delete)
- Search + category filter
- Delete with `ConfirmModalComponent`
- "Add Product" button → navigates to `catalog/new`

**`features/admin/catalog/product-form/`**
- Single form used for both create (`/catalog/new`) and edit (`/catalog/:id/edit`)
- Mode determined by: `routeId = inject(ActivatedRoute).snapshot.params['id']` — present = edit mode
- Fields: title, description, price, category (dropdown), quantity/stock, imageUrls (multi-input,
  add/remove rows)
- On submit: `POST /admin/products` (create) or `PUT /admin/products/:id` (update)

**`features/admin/catalog/product-reviews/`**
- Review list for `:id` product: reviewer name, rating stars, comment, date, flagged badge
- Three actions per review (all via `ConfirmModalComponent`):
  - **Remove** → `DELETE /admin/products/:productId/reviews/:reviewId` (endpoint confirmed ✅)
  - **Flag** → `PATCH /admin/products/:productId/reviews/:reviewId/flag`
  - **Approve** (unflag) → same PATCH endpoint, `{ flagged: false }`
- Filter by: All / Flagged / Verified purchaser only

> **Backend note:** Review CRUD exists but is **owner-scoped** — a user manages their own review,
> keyed by `userId` in the path. Admin moderation (read/hide/approve/flag **any** review regardless
> of ownership) is what's genuinely missing. Confirm with the backend whether admin moderation is a
> separate endpoint or a role check on the existing review paths. The "verified purchaser"
> restriction (item #4 in IMPROVEMENTS.md) is also outstanding.

### New service: `core/services/admin/admin-product.service.ts`
```typescript
loadProducts(params?): void                           // GET    /products (reuse existing)
loadProductById(id): void                             // GET    /products/:id
createProduct(body: ProductCreateRequest): void       // POST   /admin/products
updateProduct(id, body: ProductUpdateRequest): void   // PUT    /admin/products/:id
deleteProduct(id): void                               // DELETE /admin/products/:id
loadProductReviews(productId): void                   // GET    /admin/products/:productId/reviews
removeReview(productId, reviewId): void               // DELETE /admin/products/:productId/reviews/:reviewId ✅ exists
flagReview(productId, reviewId, flag): void           // PATCH  /admin/products/:productId/reviews/:reviewId/flag
```

### New models: `core/models/admin-product.ts`
```typescript
export interface ProductCreateRequest {
  title: string; description: string; price: number;
  category: string; quantity: number; imageUrls: string[];
}
export type ProductUpdateRequest = Partial<ProductCreateRequest>;
export interface AdminReview {
  id: string; userId: string; userName: string; rating: number;
  comment: string; reviewDate: string; flagged?: boolean; verifiedPurchase?: boolean;
}
```

---

## ⑥ `admin/categories`

### Component: `features/admin/categories/category-list/`
- List all categories with product count per category
- Inline "Add Category" form or slide-in panel
- Edit and delete actions (delete returns 409 / shows error if products still exist in category)

### Service & backend — decision needed before building

> **Important:** Categories on the backend are currently a **fixed enum** (`Category`), not a
> database-backed resource. Products are filtered by a category string against that enum.
> There is **no `/categories` CRUD controller today**.
>
> However, an **`AdminLookupAPI`** already exists with `POST/PUT/DELETE /admin/lookup` — a generic
> managed reference-data resource designed for exactly this pattern.
>
> **Recommended approach:** Migrate categories to a lookup type via `AdminLookupAPI` rather than
> building a brand-new `/admin/categories` controller. This avoids duplicating the managed
> reference-data pattern and reuses an endpoint that is already secured and tested.
>
> Before starting branch ⑥, confirm with the backend:
> 1. What `type` key should be used for categories in the lookup resource (e.g. `"CATEGORY"`)?
> 2. Is `GET /admin/lookup?type=CATEGORY` the read path, or is there a separate read endpoint?
> 3. Does `GET /products` need to be updated to source category values from lookup instead of the
>    enum, and is that migration in scope for this branch?

If the lookup approach is confirmed, the frontend service call becomes:
```typescript
// AdminProductService or a thin AdminLookupService
loadCategories(): void   // GET /admin/lookup?type=CATEGORY
createCategory(name): void  // POST /admin/lookup  { type: 'CATEGORY', value: name }
updateCategory(id, name): void  // PUT /admin/lookup/:id  { value: name }
deleteCategory(id): void  // DELETE /admin/lookup/:id
```

### Models — `{ id: string, type: string, value: string, productCount?: number }` (lookup shape)

---

## ⑦ `admin/coupons`

### Component: `features/admin/coupons/coupon-list/`
- Table: Code, Discount %, Expiry date, Usage count / limit, Status badge (Active / Expired /
  Disabled), Actions (Edit, Deactivate)
- "Create Coupon" → slide-in form or navigate to `coupons/new`
- Deactivate with `ConfirmModalComponent`

### Component: `features/admin/coupons/coupon-form/`
- Fields: code (uppercase, unique), discount type (% or fixed amount), discount value, expiry date,
  max uses, min order value (optional), applicable categories (optional multi-select)
- Create: `POST /admin/coupons`
- Edit: `PUT /admin/coupons/:couponId`

### New service: `core/services/admin/admin-coupon.service.ts`
```typescript
loadCoupons(): void                                   // GET    /admin/coupons
loadCouponById(couponId): void                        // GET    /admin/coupons/:couponId
createCoupon(body: CouponCreateRequest): void         // POST   /admin/coupons
updateCoupon(couponId, body): void                    // PUT    /admin/coupons/:couponId
deactivateCoupon(couponId): void                      // PATCH  /admin/coupons/:couponId/deactivate
deleteCoupon(couponId): void                          // DELETE /admin/coupons/:couponId
```

### New model: `core/models/admin-coupon.ts`
```typescript
export type CouponDiscountType = 'PERCENTAGE' | 'FIXED';

export interface Coupon {
  id: string; code: string; discountType: CouponDiscountType;
  discountValue: number; expiryDate: string; maxUses: number;
  usedCount: number; minOrderValue?: number; active: boolean;
  applicableCategories?: string[];
}
export interface CouponCreateRequest {
  code: string; discountType: CouponDiscountType; discountValue: number;
  expiryDate: string; maxUses: number; minOrderValue?: number;
  applicableCategories?: string[];
}
```

> **Note for backend:** The coupon validation logic (item #2) also needs a customer-facing endpoint
> `POST /checkout/apply-coupon` that the checkout flow will call — that is NOT part of this admin
> branch but should be built in parallel.

---

## Full Directory Layout (target state)

```
features/
├── consumer-shell/
│   ├── consumer-shell.component.ts
│   ├── consumer-shell.component.html
│   └── consumer-shell.component.scss
└── admin/
    ├── admin-shell/
    │   ├── admin-shell.component.ts
    │   ├── admin-shell.component.html
    │   └── admin-shell.component.scss
    ├── dashboard/
    │   ├── dashboard.component.ts
    │   ├── dashboard.component.html
    │   └── dashboard.component.scss
    ├── orders/
    │   ├── order-list/
    │   └── order-edit/
    ├── users/
    │   ├── user-list/
    │   └── user-detail/
    ├── catalog/
    │   ├── product-list/
    │   ├── product-form/
    │   └── product-reviews/
    ├── categories/
    │   └── category-list/
    └── coupons/
        ├── coupon-list/
        └── coupon-form/

core/
├── services/admin/
│   ├── admin-stats.service.ts
│   ├── admin-order.service.ts
│   ├── admin-user.service.ts
│   ├── admin-product.service.ts
│   └── admin-coupon.service.ts
└── models/
    ├── admin-stats.ts
    ├── admin-order.ts
    ├── admin-user.ts
    ├── admin-product.ts
    └── admin-coupon.ts
```

---

## Required Backend Endpoints

### Existing endpoints confirmed from frontend services

| Method | Path | Used by |
|--------|------|---------|
| `POST` | `/auth/login` | `AuthService.login()` |
| `POST` | `/auth/register` | `AuthService.register()` |
| `POST` | `/auth/confirm/:phone/:otp` | `AuthService.confirmOtp()` |
| `POST` | `/auth/refresh` | `AuthService.refreshToken()` |
| `GET` | `/products` | `ProductService.loadProducts()` |
| `GET` | `/products/:id` | `ProductService.fetchProductById()` |
| `GET` | `/order/user/:userId` | `OrderService` — load user orders |
| `GET` | `/order/:userId/:orderId` | `OrderService.loadOrderById()` |
| `GET` | `/order/:userId/:orderId/track` | `OrderService.loadTrackingData()` |
| `POST` | `/order/:userId/:orderId/cancel` | `OrderService.cancelOrder()` |
| `GET` | `/order/admin/statistics` | ✅ Confirmed — order counts by status |
| `GET` | `/order/admin/all` | ✅ Confirmed — all orders cross-user; no pagination yet |
| `DELETE` | `/admin/products/:productId/reviews/:reviewId` | ⚠️ Owner-scoped delete confirmed; admin delete-any needs role check on same or separate endpoint |
| `POST/PUT/DELETE` | `/admin/lookup` | ✅ Confirmed — generic managed reference-data resource; candidate for category management |

---

### New admin endpoints needed (all require `@PreAuthorize("hasRole('ADMIN')")`)

#### Stats & Analytics

| Method | Path | Body / Params | Returns | Branch | Backend status |
|--------|------|---------------|---------|--------|----------------|
| `GET` | `/admin/stats` | — | `PlatformStats` | ② | ❌ New |
| `GET` | `/admin/analytics/sales` | `?period=daily\|weekly\|monthly` | `SalesTrendPoint[]` | ② | ❌ New |
| `GET` | `/admin/analytics/top-products` | `?limit=5` | `TopSellingProduct[]` | ② | ❌ New |
| `GET` | `/admin/analytics/customers` | — | `CustomerAnalytics` | ② | ❌ New |

#### Orders

| Method | Path | Body / Params | Returns | Branch | Backend status |
|--------|------|---------------|---------|--------|----------------|
| `GET` | `/order/admin/all` | `?page&size&status&search&dateFrom&dateTo` | Paged `AdminOrderSummary[]` | ③ | ⚠️ Exists (no pagination, path is `/order/admin/all` not `/admin/orders`) |
| `GET` | `/admin/orders/:orderId` | — | `OrderApi` | ③ | ❌ New |
| `PATCH` | `/admin/orders/:orderId/status` | `{ status, notes? }` | Updated `OrderApi` | ③ | ❌ New |
| `PATCH` | `/admin/orders/:orderId/pricing` | `{ discount?, totalAmount?, reason }` | Updated `OrderApi` | ③ | ❌ New |
| `POST` | `/admin/orders/:orderId/rebook` | — | New `OrderApi` | ③ | ❌ New |
| `POST` | `/admin/orders/:orderId/refund` | `RefundRequest` | `RefundRecord` | ③ | ❌ New |
| `GET` | `/admin/orders/:orderId/refunds` | — | `RefundRecord[]` | ③ | ❌ New |
| `DELETE` | `/admin/orders/stale` | `?olderThanDays=N` | `{ deletedCount }` | ③ | ❌ New |

#### Users

| Method | Path | Body / Params | Returns | Branch | Backend status |
|--------|------|---------------|---------|--------|----------------|
| `GET` | `/admin/users` | `?page&size&status&search` | Paged `AdminUserSummary[]` | ④ | ❌ New |
| `GET` | `/admin/users/:userId` | — | `AdminUserSummary` | ④ | ❌ New |
| `GET` | `/admin/users/:userId/orders` | — | `OrderApi[]` | ④ | ❌ New |
| `PATCH` | `/admin/users/:userId/block` | `{ blocked: boolean, reason? }` | Updated user | ④ | ❌ New |
| `PATCH` | `/admin/users/:userId/reset` | `{ name?, email?, phone? }` | Updated user | ④ | ❌ New |
| `POST` | `/admin/users/:userId/reset-password` | — | `{ message }` | ④ | ❌ New |

#### Products / Catalog

| Method | Path | Body / Params | Returns | Branch | Backend status |
|--------|------|---------------|---------|--------|----------------|
| `POST` | `/admin/products` | `ProductCreateRequest` | New `Product` | ⑤ | ❌ New |
| `PUT` | `/admin/products/:productId` | `ProductUpdateRequest` | Updated `Product` | ⑤ | ❌ New |
| `DELETE` | `/admin/products/:productId` | — | `{ message }` | ⑤ | ❌ New |
| `GET` | `/admin/products/:productId/reviews` | — | `AdminReview[]` | ⑤ | ⚠️ Owner-scoped CRUD exists (user manages own review by userId); admin read-all path needs confirmation |
| `DELETE` | `/admin/products/:productId/reviews/:reviewId` | — | `{ message }` | ⑤ | ⚠️ Owner-scoped delete exists; admin delete-any-review needs separate endpoint or role check |
| `PATCH` | `/admin/products/:productId/reviews/:reviewId/flag` | `{ flagged: boolean, visible?: boolean }` | Updated review | ⑤ | ❌ New — admin moderation (hide/approve/flag any review) is what's genuinely missing |

#### Categories

| Method | Path | Body / Params | Returns | Branch | Backend status |
|--------|------|---------------|---------|--------|----------------|
| `GET` | `/admin/categories` | — | `{ id, name, productCount }[]` | ⑥ | ❌ New |
| `POST` | `/admin/categories` | `{ name, description? }` | New category | ⑥ | ❌ New |
| `PUT` | `/admin/categories/:categoryId` | `{ name, description? }` | Updated category | ⑥ | ❌ New |
| `DELETE` | `/admin/categories/:categoryId` | — | `{ message }` or 409 conflict | ⑥ | ❌ New |

#### Coupons

| Method | Path | Body / Params | Returns | Branch | Backend status |
|--------|------|---------------|---------|--------|----------------|
| `GET` | `/admin/coupons` | — | `Coupon[]` | ⑦ | ❌ New |
| `GET` | `/admin/coupons/:couponId` | — | `Coupon` | ⑦ | ❌ New |
| `POST` | `/admin/coupons` | `CouponCreateRequest` | New `Coupon` | ⑦ | ❌ New |
| `PUT` | `/admin/coupons/:couponId` | `CouponCreateRequest` | Updated `Coupon` | ⑦ | ❌ New |
| `PATCH` | `/admin/coupons/:couponId/deactivate` | — | Updated `Coupon` | ⑦ | ❌ New |
| `DELETE` | `/admin/coupons/:couponId` | — | `{ message }` | ⑦ | ❌ New |
| `POST` | `/checkout/apply-coupon` | `{ code, orderTotal }` | `{ valid, discountAmount }` | — (checkout) | ❌ New |

---

## API envelope pattern

All responses follow the existing backend envelope:

```typescript
// Single item
{ data: T; message: string; status: string; statusCode: number }

// Paginated — use the new PagedApiResponse<T> added in branch ①
{ data: { items: T[]; totalCount: number; page: number; size: number };
  message: string; status: string; statusCode: number }
```

The existing `ApiResponse<T>` in `core/models/api-response.ts` covers single items.
`PagedApiResponse<T>` (new in branch ①) covers paginated lists.

---

## Backend gap summary

Items to raise with the backend team. Grouped by priority matching the branch build order.

| Priority | Gap | Needed for branch |
|----------|-----|-------------------|
| 🔴 High | `GET /admin/stats` — platform-wide aggregation | ② Dashboard |
| 🔴 High | `GET /admin/analytics/sales\|top-products\|customers` — trend data | ② Dashboard |
| 🔴 High | `GET /order/admin/all` — exists but has no pagination; request backend adds `page`/`size` params | ③ Orders |
| 🔴 High | `PATCH /admin/orders/:id/status` and `/pricing` | ③ Orders |
| 🔴 High | `POST /admin/orders/:id/refund` + `GET .../refunds` | ③ Orders |
| 🔴 High | `POST /admin/orders/:id/rebook` | ③ Orders |
| 🔴 High | `DELETE /admin/orders/stale` | ③ Orders |
| 🟡 Medium | `GET /admin/users` + `/users/:id` + `/users/:id/orders` | ④ Users |
| 🟡 Medium | `PATCH /admin/users/:id/block\|reset` + `POST .../reset-password` | ④ Users |
| 🟡 Medium | Product CRUD: `POST/PUT/DELETE /admin/products/:id` | ⑤ Catalog |
| 🟡 Medium | Admin review moderation endpoints — owner-scoped CRUD exists per userId; need admin-scoped hide/approve/flag on any review | ⑤ Catalog |
| 🟡 Medium | Confirm read path for all reviews on a product under admin role (owner-scoped path confirmed; admin-read-all path unknown) | ⑤ Catalog |
| 🟢 Low | Category management — categories are a fixed enum today; confirm whether to migrate via existing `AdminLookupAPI` (`POST/PUT/DELETE /admin/lookup`) or build new `/admin/categories` resource | ⑥ Categories |
| 🟢 Low | Full coupon CRUD + `POST /checkout/apply-coupon` | ⑦ Coupons |
| 🟢 Low | Admin email for low-stock alerts (backend notification — no frontend component needed) | — |
| 🟢 Low | Conversion rate tracking (requires visit/session logging on backend) | ② (last) |
