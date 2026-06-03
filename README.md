# Ecommerce Cart API

Backend APIs for an in-memory ecommerce cart, checkout, and nth-order discount code system. Built as a TypeScript assignment-style service with explicit domain rules and unit tests.

## Tech stack

- Node.js 20+
- TypeScript (strict)
- Fastify
- Vitest
- In-memory store (no database)

## Business rules (summary)

- Products are seeded in memory; prices are integer cents.
- Carts are keyed by `customerId` (path param); no auth.
- Adding the same product merges quantities.
- Checkout creates an immutable order snapshot and clears the cart.
- Every `NTH_ORDER` completed orders unlocks admin coupon generation for that milestone.
- Admin must call generate; checkout never auto-creates coupons.
- Missed milestones can still be issued later (e.g. milestone 3 after 4 orders).
- Discount codes are single-use; unknown → 404, used → 400.
- Discount math: `Math.floor(subtotalCents * percentOff / 100)`.

## Setup

```bash
npm install
npm test
npm run dev
npm run build
npm start
```

Dev server: `http://localhost:3000` (default).

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP port |
| `NTH_ORDER` | `3` | Completed orders between coupon milestones |
| `DISCOUNT_PERCENT` | `10` | Percent off generated coupons |

Example:

```bash
NTH_ORDER=3 DISCOUNT_PERCENT=10 npm run dev
```

## In-memory limitation

All carts, orders, and discount codes live in process memory. Restarting the server wipes state. This is intentional for the assignment scope.

## API examples

### Health

```bash
curl http://localhost:3000/health
```

### List products

```bash
curl http://localhost:3000/products
```

### Add item to cart

```bash
curl -X POST http://localhost:3000/customers/cust_1/cart/items \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod_1","quantity":2}'
```

### View cart

```bash
curl http://localhost:3000/customers/cust_1/cart
```

### Checkout

```bash
curl -X POST http://localhost:3000/customers/cust_1/checkout \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Checkout with discount code

```bash
curl -X POST http://localhost:3000/customers/cust_1/checkout \
  -H "Content-Type: application/json" \
  -d '{"discountCode":"SAVE10-ABCD1234"}'
```

### Admin: generate discount code

```bash
curl -X POST http://localhost:3000/admin/discount-codes/generate \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Admin: stats

```bash
curl http://localhost:3000/admin/stats
```

## Full happy path

```bash
# 1. List products
curl http://localhost:3000/products

# 2. Add item
curl -X POST http://localhost:3000/customers/cust_1/cart/items \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod_1","quantity":1}'

# 3. Checkout 3 orders (re-add item between each)
for i in 1 2 3; do
  curl -X POST http://localhost:3000/customers/cust_1/checkout \
    -H "Content-Type: application/json" -d '{}'
  curl -X POST http://localhost:3000/customers/cust_1/cart/items \
    -H "Content-Type: application/json" \
    -d '{"productId":"prod_1","quantity":1}'
done

# 4. Generate coupon (milestone 3)
curl -X POST http://localhost:3000/admin/discount-codes/generate \
  -H "Content-Type: application/json" -d '{}'

# 5. Checkout with coupon (use code from step 4 response)
curl -X POST http://localhost:3000/customers/cust_1/checkout \
  -H "Content-Type: application/json" \
  -d '{"discountCode":"SAVE10-REPLACE_ME"}'

# 6. View admin stats
curl http://localhost:3000/admin/stats
```

## Error shape

```json
{
  "error": "Human readable message",
  "code": "MACHINE_READABLE_CODE"
}
```

## Project layout

```
src/
  app.ts              # Fastify app factory
  server.ts           # Entry point
  config.ts           # Env config
  domain/             # Types and errors
  store/              # In-memory persistence
  services/           # Business logic
  routes/             # HTTP routes
  schemas/            # Fastify JSON schemas
  tests/              # Vitest tests
```

See [DECISIONS.md](./DECISIONS.md) for design trade-offs.
