# RestoAudit

RestoAudit is a full-stack restaurant management and food-quality monitoring system for a multi-branch restaurant chain. Admins, branch managers, kitchen staff and customers each get their own dashboard, and database triggers record every change to the data in an audit log.

Built as a mini project for the Database Management Systems course (21CSC205P) at SRM Institute of Science and Technology.

## Features

**Customer**
- Browse the menu and place orders at their registered branch.
- Order history and loyalty points (1 point per ₹10 spent).
- Feedback on food quality and service.

**Staff**
- Live order queue for the branch, with order status updates.
- Ingredient stock view for the kitchen.

**Branch manager**
- Branch dashboard: orders, revenue and guests.
- Staff, inventory, feedback and finance pages for their branch.

**Admin**
- Chain-wide dashboard across all branches.
- Manage branches, menu items, users and inventory.
- Finance reports, customer feedback, and the audit log of every insert, update and delete.

**Under the hood**
- Placing an order deducts each dish's ingredients from stock using its recipe, and awards loyalty points, in one transaction.
- The server rejects orders placed at a branch other than the customer's registered branch.
- MySQL `AFTER INSERT / UPDATE / DELETE` triggers write every change on every table to `audit_log`.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui (Radix UI), Recharts |
| Backend | Java 17, Spring Boot 3.3, Spring Data JPA (Hibernate), Maven |
| Database | MySQL (schema, seed data, audit triggers) |
| Testing | Playwright end-to-end tests |

## Architecture

```
Next.js frontend (localhost:3000)
   └─ lib/api.ts ──HTTP/JSON──▶ Spring Boot REST API (localhost:8080/api)
                                    controller ─▶ service ─▶ JPA repository
                                                                  │
                                                                  ▼
                                                     MySQL food_quality_db
                                                     (+ audit triggers → audit_log)
```

The backend follows a layered design. Controllers expose REST endpoints, services hold the business logic and transactions, and Spring Data JPA repositories persist `@Entity` classes. The frontend sends every call through one API module, `frontend/lib/api.ts`.

### REST API

Each resource supports `GET` (list and by id), `POST`, `PUT /{id}` and `DELETE /{id}`:

`/api/users` · `/api/orders` · `/api/menu-items` · `/api/ingredients` · `/api/branches` · `/api/departments` · `/api/feedbacks` · `/api/complaint-logs` · `/api/audit-logs`

### Data model

`Department`, `Branch`, `User` (with role and branch), `MenuItem`, `Ingredient`, `Order`, `OrderDetail`, `Feedback`, `ComplaintLog` and `AuditLog` are JPA entities. A `recipe` table links menu items to the ingredients and quantities they use.

## Getting started

Prerequisites: Java 17, Maven, Node.js 18 or later, and MySQL 8.

**1. Database**

```sql
CREATE DATABASE IF NOT EXISTS food_quality_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Set the connection in `backend/src/main/resources/application.properties`. Use your own MySQL user and password, ideally from an environment variable rather than a committed value:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/food_quality_db
spring.datasource.username=root
spring.datasource.password=${DB_PASSWORD}
```

**2. Backend**

```bash
cd backend
mvn spring-boot:run
```

On first start, Hibernate (`ddl-auto=update`) creates the tables for the entities. The API runs at http://localhost:8080/api.

**3. Seed data and audit triggers**

Run these against `food_quality_db`, in order:

```bash
mysql -u root -p food_quality_db < database/populate_db.sql
mysql -u root -p food_quality_db < database/populate_more_data.sql
mysql -u root -p food_quality_db < database/setup_audit_all_tables.sql
```

The seed scripts also fill the `recipe` and payment tables, which are not JPA entities. Create those tables first if your schema doesn't have them yet.

**4. Frontend**

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000, choose a role and sign in. The login page lists demo accounts for each role. Managers and staff also enter their branch ID.

**End-to-end tests** (with both servers running):

```bash
cd frontend
npm run test:e2e
```

## Project structure

```
backend/     Spring Boot API: controller/, service/, repository/, model/, config/
frontend/    Next.js app: app/{admin,manager,staff,customer}/, components/, lib/api.ts, e2e/
database/    Seed data and audit-trigger SQL scripts
docs/        Project guide, study report and security notes
scripts/     Local helper scripts (PowerShell)
```

## Limitations

RestoAudit is a course project, not production software:

- Sign-in happens in the browser. The backend has no authentication, so its endpoints are open to anyone who can reach them, and passwords are stored and returned in plain text.
- Branch isolation is enforced only when orders are created; other reads and updates are not checked by branch.
- CORS allows every origin.

`docs/SECURITY_AUDIT.md` and `docs/SECURITY_FIX_GUIDE.md` describe these issues and how to fix them: Spring Security with hashed passwords and tokens, server-side branch checks, and restricted CORS.
