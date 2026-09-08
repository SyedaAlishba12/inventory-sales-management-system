# Inventory & Sales Management System

Full-stack inventory, point-of-sale, purchasing, customer, supplier, and
reporting application for small and medium-sized businesses.

## Technology

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Backend: FastAPI, SQLAlchemy 2, Alembic
- Database: PostgreSQL with asyncpg

## Local setup (Windows PowerShell)

### Frontend

```powershell
cd frontend
Copy-Item .env.example .env.local
npm install
npm run dev
```

The frontend runs at `http://localhost:3000`.

### Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
Copy-Item .env.example .env
uvicorn main:app --reload
```

The API runs at `http://localhost:8000`; interactive documentation is available
at `http://localhost:8000/docs`.

### PostgreSQL

Start the local PostgreSQL service from the project root:

```powershell
docker compose up -d postgres
cd backend
Copy-Item .env.example .env
.\venv\Scripts\Activate.ps1
python -m database.init_db
```

Docker Desktop is optional. If `docker` is not installed, skip this command and
use an existing local/cloud PostgreSQL server by updating `DATABASE_URL` in
`backend/.env`. The automated database tests use isolated SQLite and do not
require Docker.

The check command verifies connectivity without creating tables. Application
schema changes should normally be managed through Alembic rather than
`create_all`.

### Database migrations

Run migration commands from `backend`:

```powershell
alembic current
alembic revision --autogenerate -m "describe schema change"
alembic upgrade head
alembic downgrade -1
```

All SQLAlchemy models must inherit from `database.Base`. Alembic automatically
imports modules under `backend/models` before comparing metadata. Coordinate
model and relationship changes with Syeda before generating or merging a
migration.

## Verification

```powershell
cd frontend
npm run check

cd ..\backend
.\venv\Scripts\Activate.ps1
ruff check .
python -m pytest
```

Development work must be made on feature branches. Pull requests target
`develop`; `main` is reserved for stable releases.

## Shared UI system

Reusable controls are exported from `frontend/src/components/ui`. Responsive
application layout components are exported from `frontend/src/components/layout`.

During development, open `http://localhost:3000/ui-kit` to review component
variants, form controls, overlays, loading states, empty/error states, and the
responsive sidebar layout.

Open `http://localhost:3000/ui-kit/business` to review the shared data table,
filters, product/customer/notification cards, and POS building blocks.

```tsx
import { MainLayout, PageHeader } from "@/components/layout";
import { Button, Card } from "@/components/ui";
```

API helpers, formatting, validation, loading, and toast utilities are exported
from `frontend/src/utils`. Shared frontend contracts are exported from
`frontend/src/types`; these are client-side API/view contracts and do not
replace team-owned backend models.
