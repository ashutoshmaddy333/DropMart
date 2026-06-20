# DropMart — Full Stack Platform

Dropshipping marketplace with separate backend API, master tables, RBAC, supplier portal, and live delivery tracking.

## Architecture

```
Cloudflare (DNS + CDN + DDoS + SSL)
  → NGINX Ingress (K8s path routing)
    → web-service (Next.js :3000)
    → api-service (NestJS :4000)
      → PostgreSQL (master tables + data)
      → Redis (sessions/cache)
      → WebSocket (/tracking namespace)
```

**No separate API gateway product needed** — K8s Service + NGINX Ingress + Cloudflare = complete load balancing.

## Quick Start

```bash
docker compose up -d
cd apps/api && npx prisma migrate dev --name init && npm run prisma:seed
cd ../web && cp .env.example .env.local
cd ../.. && npm run dev
```

- Storefront: http://localhost:3000
- API: http://localhost:4000/api/v1
- Login: http://localhost:3000/login

## Demo Accounts (password: password123)

| Role | Email | Portal |
|------|-------|--------|
| Super Admin | priya@dropmart.in | /admin |
| Customer | arjun@gmail.com | / |
| Supplier (verified) | meera@supplier.in | /supplier |
| Supplier (pending) | new@supplier.in | /supplier/pending |
| Delivery | ravi@delivery.in | /delivery |

## Master Tables

All roles, permissions, order/payment/delivery statuses are in DB — not hardcoded.
Fetch via `GET /api/v1/masters`

## Supplier Flow

1. Register at `/register/supplier`
2. Admin verifies at `/admin/suppliers`
3. Supplier adds products at `/supplier/products/new`
4. Admin approves products
5. Customers see approved products on storefront

## Live Tracking

Track orders at `/track/[orderId]` with WebSocket live updates (Rapido-style).
