# Cafeteria menu app

A website for a cafeteria. Guests can see today's dish, hot snacks and the weekly menu,
each with price and allergens. Admins manage dishes, hot snacks and allergens and schedule
the weekly menu.

**Status: v1 backend.** The admin API works, but **there is no authentication yet**
(see Security)

## Tech stack
- Next.js 16 (App Router) with React and TypeScript
- PostgreSQL, via the `postgres` (Postgres.js) driver
- Zod for input validation

## Requirements
- Node.js v26.12.1
- PostgreSQL version 12.1.0
- A client for testing the API. Ex. Postman

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a PostgreSQL database named `cafeteria`
3. Run the SQL files in `db/` on that database, in this order:
   1. `schema.sql`: tables and indexes
   2. `seed.sql`: the 14 allergens
   3. `roles.sql`: a restricted app user (local development only)
   4. `dev-data.sql`: sample dishes, snacks and a weekly schedule (local development only)

   Run them as the `postgres` user. `schema.sql` fails with "already exists" if run twice,
   so to start over, drop and recreate the database.
4. Copy `.env.example` to `.env.local` and fill in the values.
5. Start the dev server:
   ```bash
   npm run dev
   ```
   Restart it whenever `.env.local` changes. Environment files are read only at startup.

## Environment variables
| Variable       | Description |
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgres://user:password@localhost:5432/cafeteria` |

Note: Special characters in the password must be URL-encoded (`@` becomes `%40`, `%` becomes
`%25`, and so on). Never commit `.env.local`.

## Project structure

```
app/                    Next.js routes. The route files under app/api/ only forward to controllers.
src/backend/
  config/               Environment validation
  controllers/          Request handling: authorize, validate, call a service, map to status codes
  lib/                  db.ts, schemas.ts (all Zod rules), dates.ts, menu-types.ts, require-admin.ts
  middleware/           AdminGuard (authorization, currently a placeholder)
  models/               Domain classes (Allergen, Dish, HotSnack, ScheduleEntry)
  services/             Business logic and SQL
  container.ts          Creates the objects and connects them
src/frontend/           UI (owned by the frontend developer)
db/                     SQL files (schema, seed, local-only dev data and roles)
```

Rules the code follows:
- Controllers contain no SQL and no validation rules. They call schemas and services.
- All validation rules live in `src/backend/lib/schemas.ts`.
- Server files import `server-only`, so they can't end up in the browser bundle.
- Data passed to client components must be plain objects. Class instances lose their methods.

## Data model
- **allergens**: the allergen list. Names are unique, ignoring case.
- **dishes** and **hot_snacks**: libraries of items, each with a name (unique within its table,
  ignoring case), a description, a price and a set of allergens.
- **scheduled_dishes** and **scheduled_hot_snacks**: which weekday (1 = Monday ... 7 = Sunday)
  an item is served. The same item can't be on the same weekday twice, but a day can have
  several items. The schedule has no dates: it is a weekly template that repeats until changed.
- Prices are stored as `NUMERIC(8,2)`. The driver returns them as strings such as `"129.00"`.

## Admin API

Responses are JSON. Errors look like `{ "error": "message" }`.

| Endpoint | Methods |
|---|---|
| `/api/admin/allergens` | `GET`, `POST` |
| `/api/admin/allergens/[id]` | `PUT`, `DELETE` |
| `/api/admin/dishes` | `GET`, `POST` |
| `/api/admin/dishes/[id]` | `GET`, `PUT`, `DELETE` |
| `/api/admin/hot-snacks` | `GET`, `POST` |
| `/api/admin/hot-snacks/[id]` | `GET`, `PUT`, `DELETE` |
| `/api/admin/schedule` | `GET` (the whole weekly plan), `DELETE` (clear the week) |
| `/api/admin/schedule/dishes` | `POST` `{ "dishId", "weekday" }` |
| `/api/admin/schedule/dishes/[id]` | `PUT` `{ "weekday" }`, `DELETE` (`id` is the scheduled entry's id) |
| `/api/admin/schedule/snacks` | `POST` `{ "hotSnackId", "weekday" }` |
| `/api/admin/schedule/snacks/[id]` | `PUT` `{ "weekday" }`, `DELETE` |

Create and update bodies for dishes and snacks:

```json
{ "name": "Fiskegrateng", "description": "Med gulrøtter", "price": 129, "allergenIds": [3, 4] }
```

Status codes: `200` OK, `201` created, `204` deleted, `400` invalid input, `401` unauthorized,
`404` not found, `409` conflict (duplicate name, already scheduled, allergen in use, or a
confirmation is required).

**Confirmation pattern.** Deleting a dish or snack that is on the weekly menu, and clearing
the week, should first return `409` with `requiresConfirmation: true`. Repeat the request by entering `?confirm=true` in the url to go through with it. Removing a single entry from the weekly menu never asks.

## Testing
Use Postman against `http://localhost:3000/api/admin/...`. Rerun `db/dev-data.sql` (as `postgres`)
to reset the sample data between test rounds. It empties the dish and snack tables, so
use it on a local database only. Server Actions can't be tested this way, but the admin API
routes can.

## Security
- **No authentication yet.** In development, `requireAdmin()` does nothing. In
  production it should throw, so a deployed build refuses admin writes by design.
- Every controller method that changes data calls `AdminGuard`. Real authentication
  only needs to replace `requireAdmin()`. The plan is Better Auth with a seeded admin
  account and public sign-up disabled.
- Do not deploy, share a tunnel to, or point a shared copy at real data until this is done.

## Handoff to the database team
See `docs/database-handoff.md` for what the real database needs.

## Known gaps / next steps
- Real authentication and the login and logout pages
- The guest page/ screen (`app/page.tsx`), will show today's items and the weekly menu
- Fix bugs in admin interface in regards to repo merger
- Make a clickable UI planner for scheduling dishes and the "clear the week" button.
