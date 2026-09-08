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

## Verification

```powershell
cd frontend
npm run check

cd ..\backend
.\venv\Scripts\Activate.ps1
ruff check .
pytest
```

Development work must be made on feature branches. Pull requests target
`develop`; `main` is reserved for stable releases.
