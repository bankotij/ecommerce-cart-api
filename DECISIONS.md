# Design Decisions

## Decision: TypeScript + Fastify instead of Express/raw Node

**Context:** The assignment targets a TypeScript/Node backend that reviewers can run quickly and read without framework noise.

**Options Considered:**
- Option A: Express with manual middleware and validation
- Option B: Fastify with built-in JSON schema validation and inject-based testing

**Choice:** TypeScript strict mode with Fastify.

**Why:** Fastify keeps route wiring small while enforcing request/response shapes at the HTTP boundary. Inject tests map cleanly to the same app factory. Express would work but needs more glue for validation and consistent error handling.

---

## Decision: Integer cents for money

**Context:** Cart totals, discounts, and admin revenue must be exact and easy to test.

**Options Considered:**
- Option A: Floating-point dollars in JSON
- Option B: Integer cents everywhere in domain logic

**Choice:** Integer cents only.

**Why:** Avoids binary floating-point drift in totals and discounts. Reviewers can reason about 999 cents at 10% yielding 99 discount with a single Math.floor rule.

---

## Decision: In-memory store with explicit domain services

**Context:** The assignment allows in-memory persistence and expects clear separation of HTTP, rules, and storage.

**Options Considered:**
- Option A: Global mutable module state accessed from routes
- Option B: MemoryStore plus focused services (CartService, CheckoutService, etc.)

**Choice:** MemoryStore for persistence; services own business rules.

**Why:** Routes stay thin. Tests create a fresh store per case without a database or repository abstraction theater. State is still process-local, which matches assignment constraints.

---

## Decision: Monotonic orderNumber for nth-order eligibility

**Context:** Coupon milestones are defined on completed order count (every nth order).

**Options Considered:**
- Option A: UUID-only orders; derive milestone eligibility from array length only
- Option B: Monotonic orderNumber starting at 1 plus UUID id

**Choice:** Both UUID id and integer orderNumber.

**Why:** orderNumber makes milestone semantics explicit in API responses and tests (milestoneOrderNumber: 3). UUIDs remain suitable for external references without leaking sequence assumptions.

---

## Decision: Admin-triggered coupon generation instead of auto-generation

**Context:** The assignment requires an admin API to generate codes when the nth-order condition is satisfied, without checkout creating coupons automatically.

**Options Considered:**
- Option A: Auto-generate a coupon immediately when order count hits a milestone
- Option B: Admin POST /admin/discount-codes/generate only

**Choice:** Admin-triggered generation only.

**Why:** Matches the spec and keeps checkout idempotent and simple. Operations can batch or audit coupon creation separately from customer checkout.

---

## Decision: Single-use discount codes

**Context:** Discount codes must be validated at checkout and tracked in admin stats.

**Options Considered:**
- Option A: Reusable codes until expiry
- Option B: Single-use codes marked used and linked to an order

**Choice:** Single-use codes.

**Why:** Simpler fraud model for an assignment store, clear test cases (reuse fails), and straightforward stats (discountCentsApplied per code). Fits coupon-for-nth-order as a one-time reward.

---

## Decision: Next unissued milestone generation logic

**Context:** Admins may generate late: e.g. four orders completed but milestone 3 never issued.

**Options Considered:**
- Option A: Only allow generation when completedOrderCount exactly equals a milestone
- Option B: Scan milestones n, 2n, 3n... up to current count and issue the lowest unissued

**Choice:** Scan and issue the lowest unissued eligible milestone.

**Why:** Matches the clarified business rules and avoids punishing delayed admin action. Duplicate issuance for the same milestone is still blocked via issuedMilestones.

---

## Decision: Gross and net revenue in stats

**Context:** Admin stats must report revenue and total discounts in a way reviewers can reconcile.

**Options Considered:**
- Option A: Single revenueCents field (ambiguous after discounts)
- Option B: grossRevenueCents (sum of subtotals) and netRevenueCents (sum of totals after discount)

**Choice:** Report both gross and net, plus totalDiscountCents.

**Why:** Gross shows pre-discount demand; net shows total collected in this simulated store. Together they explain discount impact without recomputing from orders.

---

## Decision: Route schemas at HTTP boundary

**Context:** Invalid quantities and malformed bodies should fail before service logic with consistent status codes.

**Options Considered:**
- Option A: Manual if checks in every route handler
- Option B: Fastify JSON Schema on params/body/response

**Choice:** Fastify JSON Schema in src/schemas/.

**Why:** Centralizes HTTP validation, returns 400 for bad shapes (e.g. decimal quantity) and keeps services focused on domain rules (unknown product, empty cart, coupon state). Service tests still cover rules even when not expressible in schema alone.
