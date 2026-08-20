# Restaurant Management Backend

Task 3 of Sqrock IT Solutions Backend Internship — Project Phase 1.

Backend APIs for menu management and food ordering, similar to a Talabat/Zomato
style restaurant system.

## Tech Stack
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication

## Setup

1. `npm install`
2. `cp .env.example .env` and fill in `MONGO_URI` (uses its own database,
   `restaurant_management_db`, and port `5002`, so it runs alongside Tasks 1 and 2
   without conflicts) and `JWT_SECRET`.
3. `npm run dev`
4. Create your one admin account: `npm run create-admin`
   (creates `admin@restaurant.com` / `admin123456` by default — override with
   `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars if you want different credentials)

## Why signup can't create an admin

Unlike Task 2's job portal (where a role picked by the user is legitimate,
since being a "candidate" vs "employer" isn't a security-sensitive
distinction), **admin here means "can control the whole menu and see every
customer's orders."** If `/signup` accepted a `role` field, anyone could
register as `{"role": "admin"}` and get full control instantly.

So `/signup` always creates a `customer`, full stop. Admin accounts are
created through `npm run create-admin`, a script only someone with access to
the server/database can run — the same way a real restaurant would give
dashboard access to an actual manager, not let anyone self-promote.

## How order pricing works (the important part)

`POST /order` takes menu item IDs and quantities from the client — **never a
price.** The server looks each item up in the database itself and calculates
the total from there:

```js
const menuItem = await MenuItem.findById(menuItemId);
totalPrice += menuItem.price * quantity;
```

If the API trusted a price sent by the client, anyone could send
`{"price": 0.01}` in their request and get food for a cent. This is a general
rule worth remembering: **never trust a price, discount, or any money-related
number sent from the client.** Always compute it server-side from data you
control.

Each order also stores `priceAtOrder` per item — a snapshot of what the
price was at the moment of ordering. If the menu price changes next month,
old orders still correctly show what the customer actually paid.

## API Endpoints

All routes prefixed with `/api`.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /auth/signup | Public | Register (always creates a customer) |
| POST | /auth/login | Public | Login, returns JWT |
| GET | /menu | Public | Browse menu. Supports `?search=`, `?category=`, `?available=true` |
| POST | /menu | Admin | Add a menu item |
| PUT | /menu/:id | Admin | Update a menu item |
| DELETE | /menu/:id | Admin | Delete a menu item |
| POST | /order | Customer | Place an order (array of `{menuItemId, quantity}`) |
| GET | /my-orders | Customer | View your own order history |
| GET | /orders | Admin | View all orders. Supports `?status=` |
| PUT | /order/:id/status | Admin | Update an order's status |

## curl Examples

**Signup**
```bash
curl -X POST http://localhost:5002/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Ejlal","email":"customer@example.com","password":"password123"}'
```

**Add a menu item (as admin)**
```bash
curl -X POST http://localhost:5002/api/menu \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"name":"Chicken Shawarma","category":"Main Course","price":25,"description":"Grilled chicken wrap"}'
```

**Browse the menu**
```bash
curl "http://localhost:5002/api/menu?category=Main Course"
```

**Place an order (as customer)**
```bash
curl -X POST http://localhost:5002/api/order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -d '{"items":[{"menuItemId":"MENU_ITEM_ID","quantity":2}]}'
```

A ready-to-import `postman_collection.json` is included, with separate
`adminToken` and `customerToken` variables since you'll test both roles.

## Common mistakes this avoids

- **Trusting client-sent prices** — covered above, this is the big one for
  any e-commerce/ordering system.
- **Letting signup choose a security-sensitive role** — fine for
  candidate/employer (Task 2), not fine for customer/admin. The distinction
  is whether the role grants control over other people's data.
- **Floating-point money math** — JavaScript's `0.1 + 0.2` famously doesn't
  equal `0.3` exactly. Rounding the final total to 2 decimal places avoids
  totals like `19.999999999998` showing up in a response.

## Next steps (bonus ideas)
- Add a `preparationTimeMinutes` field per menu item and surface an ETA on orders
- WebSocket push so customers see live status updates without polling
- Daily sales report endpoint for admin (`GET /orders/analytics`)
- Image upload for menu items instead of a plain `imageUrl` string field
