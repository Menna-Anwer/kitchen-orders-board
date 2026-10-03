# Kitchen Orders Board: Take-home Task

This folder contains:

| File | What it is |
|---|---|
| `Kitchen-Orders-Board-Task.pdf` | Full task description, requirements and review criteria. Read this first. |
| `db.json` | Mock API data (menu and orders) for json-server. |
| `README.md` | This file: quick start. |

## Quick start

1. Create an Angular 17+ project (standalone, strict mode):

   ```bash
   npx @angular/cli@latest new kitchen-orders-board --routing --style=scss --strict
   ```

2. Copy `db.json` into the project root.

3. Start the mock API (runs on http://localhost:3000):

   ```bash
   npx json-server@1.0.0-beta.3 db.json --port 3000
   ```

4. Try it:

   ```
   GET    http://localhost:3000/menu
   GET    http://localhost:3000/orders
   GET    http://localhost:3000/orders?status=new
   GET    http://localhost:3000/orders/1041
   PATCH  http://localhost:3000/orders/1041     body: { "status": "ready" }
   POST   http://localhost:3000/orders          body: a new order object
   ```

json-server saves changes to `db.json`. Keep a clean copy if you want to reset the data.

## Check your price calculation

| Order | Type | Subtotal | Service 12% | VAT 14% | Total |
|---|---|---:|---:|---:|---:|
| #1041 | dine-in | 450.00 | 54.00 | 70.56 | 574.56 |
| #1044 | delivery | 240.00 | 0.00 | 33.60 | 273.60 |

## Submitting

Reply to the message this task came with, and include:

- A link to your public GitHub repository
- Optional: a deployed link or a short screen recording (3 minutes or less)

Good luck!
