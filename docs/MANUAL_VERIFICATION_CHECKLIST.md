# Manual Verification Checklist

Use this as a full manual QA pass for the app. The goal is to verify every user-facing route, shared component, critical API-backed flow, admin workflow, and the operational work added in the recent phase.

## 1. Test Setup

- Start the app in the same mode you expect to deploy.
- Run one pass with the database enabled.
- Run one pass with the fallback mode enabled if you still support it.
- Test on desktop and mobile widths.
- Test with JavaScript enabled.
- Test as:
  - Anonymous shopper
  - Logged-in customer
  - Logged-in admin
- Keep browser devtools open for:
  - Console errors
  - Failed network requests
  - Layout shifts
  - Metadata and structured data inspection

## 2. Environment Matrix

### Database-backed mode

- Verify all pages render with real data.
- Verify admin CRUD writes persist after refresh.
- Verify account/auth flows use real stored users and orders.
- Verify analytics, audit logs, and operational alerts are written.

### Fallback mode

- Enable the fallback path you currently use for non-database builds.
- Verify catalog pages still render.
- Verify pages do not crash because a DB-only code path leaked through.
- Verify any admin or checkout area that requires the DB fails gracefully with clear messaging.

### Screen sizes

- Desktop: wide viewport
- Tablet: around 768px to 1024px
- Mobile: around 320px to 430px

## 3. Global App Shell

### `app/layout.tsx`

- Page loads without hydration warnings.
- Skip link moves focus to main content.
- Global font, theme, and providers initialize without flash or console errors.
- Scroll progress indicator appears and updates during scroll.

### Navigation

Components:
- `Navbar`
- `SearchOverlay`
- `ThemeSwitcher`
- `BrandLogo`

What to test:
- Brand logo returns to home.
- Primary nav links go to the right routes.
- Mega menu opens and closes correctly on desktop.
- Mobile menu opens, traps interaction correctly, and closes cleanly.
- Search button opens overlay.
- `Ctrl+K` or `Cmd+K` opens search overlay.
- Search overlay closes with escape, close button, and route change.
- Theme toggle switches theme and persists after refresh.
- Account, wishlist, compare, and cart entry points are visible and accurate.

### Footer

Components:
- `Footer`

What to test:
- All footer links resolve correctly.
- Newsletter form accepts input and gives visible feedback.
- Social/contact links are correct.
- Footer layout is readable on mobile.

### Shared UI / Motion

Components:
- `PageShell`
- `PageTransition`
- `Reveal`
- `ScrollReveal`
- `Tilt3D`
- `LoadingSkeleton`
- `ToastProvider`
- `SafeImage`

What to test:
- Page transitions do not flash or break scroll position unexpectedly.
- Skeletons appear only while loading and resolve to real content.
- Reveal and scroll animations trigger once and do not jitter.
- Tilt interaction feels stable on desktop and does not break mobile.
- Toasts appear for success/error states and dismiss correctly.
- Broken or missing images fall back gracefully with no collapsed layout.

## 4. Home Page

Route:
- `/`

Components commonly surfaced:
- `FeaturedProductsGrid`
- `LatestProductsCarousel`
- `BentoProductCard`
- `CategoryFiltersServer`
- `RecentlyViewedRail`

What to test:
- Home page metadata is specific to the home page.
- Hero and featured sections load without empty states unless data is truly missing.
- Product cards show title, price, image, and call-to-action correctly.
- Carousel arrows/swipe work.
- Recently viewed rail appears only after viewing products.
- Any category or collection filter on the home page updates results correctly.
- Home page is fast, visually stable, and free of broken images.

## 5. Catalog Browsing

### Category page

Route pattern:
- `/category/[id]`

Components:
- `CategoryFilters`
- `CategorySort`
- `ProductGridMotion`
- `BentoProductCard`

What to test:
- Category metadata is dynamic for the selected category.
- Correct products load for the chosen category.
- Pagination works:
  - Next page
  - Previous page
  - Direct page load from URL params
- Sorting updates product order correctly.
- Filters narrow the dataset correctly.
- Empty-state behavior is clear when no products match.
- Invalid category slug/id fails cleanly.

### Brand page

Route pattern:
- `/brand/[id]`

What to test:
- Brand metadata is dynamic for the selected brand.
- Brand-specific products load correctly.
- Invalid brand slug/id fails cleanly.
- Breadcrumbs and brand heading reflect the current brand.

### Search page

Route:
- `/search`

What to test:
- Search overlay routes into the search page correctly.
- Query params populate the search input/result state.
- Very short queries show guidance rather than broken results.
- Relevant products appear for a valid query.
- No-results state is explicit and useful.
- Pagination works across results.
- Search event analytics fire.

## 6. Product Detail Page

Route pattern:
- `/product/[id]`

Components:
- `ProductDepthGallery`
- `AddToCartButton`
- `WishlistButton`
- `CompareButton`
- `StickyBottomCTA`
- `FrequentlyBoughtTogether`
- `ProductCommunityPanel`
- `RecentlyViewedTracker`

What to test:
- Product metadata is dynamic for the specific product.
- Structured data exists and matches the page content:
  - `Product`
  - `Offer`
  - `BreadcrumbList`
- Main image gallery switches images correctly.
- Gallery survives broken image URLs with fallback behavior.
- Price, stock, specs, and description match the source data.
- Add to cart works from PDP.
- Wishlist toggle works from PDP.
- Compare toggle works from PDP.
- Sticky bottom CTA appears when appropriate and works.
- Frequently bought together block behaves correctly.
- Recently viewed tracking updates the recently viewed rail.
- PDP engagement analytics fire.
- Out-of-stock state is obvious and prevents invalid purchase actions.
- Invalid product slug/id fails cleanly.

## 7. Cart, Wishlist, and Compare

### Cart

Components:
- `CartProvider`
- `CartWrapper`
- `CartDrawer`

What to test:
- Add item from home/category/PDP.
- Cart badge count updates instantly.
- Cart drawer opens from navbar and after add-to-cart when expected.
- Quantity increase/decrease works.
- Remove item works.
- Cart persists after refresh if designed to persist locally.
- Totals and currency display are correct.
- Broken images in cart do not break layout.
- Add-to-cart analytics fire.

### Wishlist

Routes:
- `/wishlist`

Components:
- `WishlistProvider`
- `WishlistWrapper`
- `WishlistDrawer`
- `WishlistButton`

What to test:
- Add/remove from product cards and PDP.
- Wishlist drawer reflects current state.
- Wishlist page shows saved products.
- State persists after refresh if intended.
- Logged-in customer sync works if supported.
- Empty state is useful.

### Compare

Routes:
- `/compare`

Components:
- `CompareProvider`
- `CompareFloatingBar`
- `CompareButton`
- `SpecComparison`

What to test:
- Add products from cards and PDP.
- Floating compare bar appears when items exist.
- Compare page shows selected products side by side.
- Removing one item updates comparison immediately.
- Clear all works.
- Maximum item limit is enforced cleanly.
- Compare page handles incompatible or incomplete product data without layout breakage.

## 8. Checkout and Payment

Routes:
- `/checkout`
- `/checkout/success`

Components:
- `ResumePaymentButton`
- `SuccessEventTracker`

What to test:
- Cart items flow into checkout correctly.
- Every required field shows field-level validation messages.
- Invalid email, phone, address, and required fields show the right errors.
- Generic disabled buttons are not the only feedback.
- Shipping calculation is correct for the chosen inputs.
- Checkout total updates correctly as shipping changes.
- Order creation succeeds with valid data.
- Paystack initialization succeeds with valid checkout state.
- Paystack initialization failure shows a clear error state and creates monitoring data.
- Payment redirect works.
- Returning from payment lands on the right success or recovery path.
- `ResumePaymentButton` works for interrupted payments.
- Success page shows the right order status and event tracking.
- Payment success analytics fire.
- Checkout drop-off analytics fire where expected.
- Cart is cleared only when payment/order flow is actually complete.

## 9. Customer Account

Routes:
- `/account`
- `/account/login`
- `/account/register`
- `/account/orders`
- `/account/logout`

Components:
- `CustomerLoginForm`
- `CustomerRegisterForm`

What to test:
- `/account` redirects correctly to the orders area.
- Registration succeeds with valid input.
- Registration field validation is clear and specific.
- Duplicate/invalid credential cases fail cleanly.
- Login succeeds with valid input.
- Login errors are specific enough to act on.
- Session persists after refresh.
- Protected account pages redirect unauthenticated users correctly.
- Orders page shows the customer’s orders correctly.
- Logout ends the session and redirects correctly.

## 10. Static Information Pages

Routes:
- `/about`
- `/contact`
- `/privacy`
- `/returns`
- `/shipping`
- `/terms`
- `/warranty`

### Contact page

Components:
- `ContactPageClient`

What to test:
- Contact form accepts valid input.
- Validation is visible for invalid input.
- Query-param prefill works for:
  - product context
  - order context
- Success feedback appears after submission.
- The page does not imply a backend workflow if none exists.

### Informational pages

What to test:
- Content renders without layout issues.
- Links inside policies work.
- Typography is readable on mobile.
- Metadata is sensible and not duplicated from unrelated pages.

## 11. Admin Authentication and Setup

Routes:
- `/admin/setup`
- `/admin/login`
- `/admin/logout`

Components:
- `AdminSetupForm`

What to test:
- First-run setup works only when no admin exists.
- Setup is blocked once an admin already exists.
- Admin login succeeds with valid credentials.
- Admin login failure is explicit.
- Protected admin routes redirect unauthenticated access to login.
- Admin logout ends the session.

## 12. Admin Product Management

Routes:
- `/admin/products`

Components:
- `ProductAdminConsole`

What to test:
- Product list loads with pagination.
- Create product works with valid input.
- Edit product works and persists.
- Delete product works and removes it from the list.
- Field-level validation appears for invalid admin input.
- Price, stock, description, specs, category, and brand save correctly.
- Audit log entry is created for create/edit/delete.
- Media library integration works during create/edit.
- Import/export is available and usable.

### Bulk import/export

What to test:
- Export produces a valid file with expected columns.
- Import valid file creates or updates products correctly.
- Import invalid rows produces usable error feedback.
- Import does not silently corrupt existing products.

### Media management

What to test:
- Upload image file succeeds.
- Uploaded image appears in selectable media list.
- Selecting uploaded media attaches it to a product.
- Deleting media removes it from the admin library.
- Broken upload or unsupported file type fails clearly.

## 13. Admin Category and Brand Management

Routes:
- `/admin/catalog`

Components:
- `CatalogTaxonomyConsole`

What to test:
- Create category works.
- Edit category works.
- Delete category works or is safely blocked when in use.
- Create brand works.
- Edit brand works.
- Delete brand works or is safely blocked when in use.
- Category and brand changes propagate to product forms and storefront pages.
- Audit log entry is created for taxonomy changes.

## 14. Admin Orders and Audit

Routes:
- `/admin/orders`
- `/admin/audit`

Components:
- `OrderAdminConsole`

What to test:
- Orders list loads correctly.
- Order status updates persist.
- Stock and payment state remain consistent after admin actions.
- Failed or incomplete payments are distinguishable from successful ones.
- Audit page shows who changed what and when.
- Audit entries exist for important changes:
  - price
  - stock
  - specs
  - media
  - categories
  - brands

## 15. Image Handling

What to test everywhere images appear:
- Home cards
- Category cards
- Search results
- PDP gallery
- Wishlist
- Compare
- Cart
- Checkout
- Admin media list

Expected behavior:
- Valid images load at correct aspect ratio.
- Missing images fall back cleanly.
- Slow images do not collapse layout.
- Broken images do not create console noise loops or infinite reload attempts.

## 16. SEO and Metadata

Routes to inspect directly:
- `/`
- one category page
- one brand page
- one product page

What to test:
- Title is route-specific.
- Meta description is route-specific.
- Canonical URL is correct if implemented.
- Open Graph/Twitter tags are not obviously wrong or generic.
- Product page JSON-LD validates in a structured data checker.
- Breadcrumb structured data matches the visible route hierarchy.
- No page is inheriting obviously incorrect metadata from the global layout.

## 17. Analytics and Monitoring

### Analytics

What to test:
- Search usage event fires.
- Add-to-cart event fires.
- PDP engagement event fires.
- Checkout start/step/drop-off events fire where intended.
- Payment success event fires.
- Events contain sensible payloads and are not duplicated excessively.

### Monitoring and alerts

What to test:
- Checkout failure path creates an operational alert.
- Paystack initialization failure creates an operational alert.
- Webhook failure creates an operational alert.
- Alert payloads contain enough context to investigate.

## 18. Webhook and Background Operations

Endpoints / flows:
- Paystack webhook
- Order cleanup endpoint

What to test:
- Valid Paystack webhook marks the right order as paid.
- Duplicate webhook delivery is idempotent.
- Invalid signature is rejected.
- Webhook failure path is logged and alerted.
- Cleanup endpoint cancels only expired pending orders.
- Cleanup endpoint restores stock correctly.
- Cleanup endpoint does not touch paid orders.

## 19. Caching, Freshness, and Revalidation

What to test:
- Home/category/brand/product content updates according to the intended cache policy.
- Admin edits appear on storefront after the expected revalidation window or invalidation action.
- No route appears permanently stale.
- No route refetches excessively on every view if caching was intended.
- Pagination pages cache consistently.

## 20. Accessibility

What to test:
- Full keyboard navigation across nav, drawers, overlays, modals, forms, and admin tables.
- Visible focus states on all interactive controls.
- Labels exist for all inputs.
- Validation messages are visible and understandable.
- Color contrast is adequate in both themes if multiple themes exist.
- Modals and drawers:
  - focus moves into them
  - escape closes them
  - focus returns to trigger
- Images have meaningful alt text or decorative handling.

## 21. Responsive and Cross-Browser Pass

What to test:
- Chrome desktop
- Chrome mobile emulation
- Firefox desktop
- Safari if available

Focus areas:
- Navbar and drawers
- Carousels
- Product gallery
- Sticky bottom CTA
- Checkout forms
- Admin tables and long forms
- Compare table overflow

## 22. Failure and Edge Cases

Run these deliberately:
- Open invalid product/category/brand URLs.
- Use empty datasets if possible.
- Set stock to zero and verify purchase prevention.
- Set malformed image URLs and verify fallback behavior.
- Try CSV import with missing required columns.
- Trigger payment with stale cart or invalid order reference.
- Refresh midway through checkout.
- Log out in another tab and revisit protected account/admin pages.
- Use browser back/forward repeatedly after search, filters, and pagination changes.

## 23. Component Coverage Checklist

Mark each as covered when its parent flow passes:

### Account

- `CustomerLoginForm`
- `CustomerRegisterForm`

### Admin

- `AdminSetupForm`
- `CatalogTaxonomyConsole`
- `OrderAdminConsole`
- `ProductAdminConsole`

### Cart / Checkout

- `CartProvider`
- `CartWrapper`
- `CartDrawer`
- `ResumePaymentButton`
- `SuccessEventTracker`

### Contact

- `ContactPageClient`

### Product

- `AddToCartButton`
- `BentoProductCard`
- `CompareButton`
- `CompareFloatingBar`
- `CompareProvider`
- `FrequentlyBoughtTogether`
- `ProductCommunityPanel`
- `ProductDepthGallery`
- `QuickViewModal`
- `SpecComparison`
- `StickyBottomCTA`
- `WishlistButton`
- `WishlistDrawer`
- `WishlistProvider`
- `WishlistWrapper`

### UI

- `BrandLogo`
- `CategoryFilters`
- `CategoryFiltersServer`
- `CategorySort`
- `FeaturedProductsGrid`
- `Footer`
- `LatestProductsCarousel`
- `LoadingSkeleton`
- `Navbar`
- `PageShell`
- `PageTransition`
- `ProductGridMotion`
- `RecentlyViewedRail`
- `RecentlyViewedTracker`
- `Reveal`
- `SafeImage`
- `ScrollProgress`
- `ScrollReveal`
- `SearchOverlay`
- `ThemeSwitcher`
- `Tilt3D`
- `ToastProvider`

## 24. Sign-off Checklist

Only mark the app ready after all of these are true:

- No blocking console errors in primary flows.
- No broken critical links.
- No broken images in critical flows.
- Checkout works end to end.
- Payment success and webhook confirmation work end to end.
- Admin can manage products, categories, brands, media, and orders.
- Audit logs are written for admin changes.
- Analytics events are visible for core commerce events.
- Metadata and structured data are route-correct.
- Mobile layout is usable across storefront and admin.
- Fallback mode behaves intentionally rather than accidentally.

