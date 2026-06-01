# CareTrack MRMS

CareTrack MRMS is a full-stack Medical Records Management System for a clinic environment. It supports role-based access for administrators, clinicians and receptionists, with modules for doctors, patients, diagnoses, dashboard statistics, staff accounts and user profile security.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios, React Router, Lucide React
- Backend: Node.js, Express, Supabase JavaScript client
- Database: Supabase PostgreSQL
- Authentication: JWT with bcrypt password hashing
- Deployment: Render for backend, Vercel for frontend

## Backend Setup

```bash
cd backend
npm install
copy .env.example .env
npm run seed
npm run dev
```

For production:

```bash
cd backend
npm install
npm start
```

Required environment variables are listed in [backend/.env.example](backend/.env.example).

## Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

For production build:

```bash
cd frontend
npm install
npm run build
```

Required frontend environment variables are listed in [frontend/.env.example](frontend/.env.example).

## Supabase Setup

1. Create a Supabase project.
2. Open SQL Editor in Supabase.
3. Run [backend/database/schema.sql](backend/database/schema.sql).
4. Copy the Project URL from Project Settings > API.
5. Copy the service role secret key from Project Settings > API.
6. Add those values to backend environment variables.
7. Run `npm run seed` from the backend folder to create sample records and login accounts.

## Render Deployment

Create a new Render Web Service connected to the repository:

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

Set these Render environment variables:

```env
PORT=5000
NODE_ENV=production
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_secret_key
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-vercel-url.vercel.app
```

The backend includes `GET /api/health` for uptime checks. Render free services may sleep after inactivity, so the first request after a sleep can take longer while the service wakes up.

## Vercel Deployment

Create a Vercel project connected to the repository:

- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

Set this Vercel environment variable:

```env
VITE_API_URL=https://your-render-api-url.onrender.com/api
```

After Vercel gives the final frontend URL, update the backend `CLIENT_URL` value on Render and redeploy/restart the backend service.

## Login Accounts

Seeded demo accounts use the password `Password123!`.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@caretrack.com` | `Password123!` |
| Clinician | `clinician@caretrack.com` | `Password123!` |
| Receptionist | `receptionist@caretrack.com` | `Password123!` |

## Role Permissions

| Role | Permissions |
| --- | --- |
| Admin | Full access to dashboard, doctors, patients, diagnoses, staff management, profile and security. |
| Clinician | View doctors, view/update own assigned patients, view/update diagnoses for own assigned patients, profile and security. |
| Receptionist | View doctors, create/view patients, dashboard, profile and security. No diagnoses or staff management access. |

## API Endpoints

Base URL: `/api`

| Endpoint | Methods | Roles |
| --- | --- | --- |
| `/health` | GET | Public |
| `/auth/login` | POST | Public |
| `/auth/me` | GET | Authenticated |
| `/auth/profile` | PUT | Authenticated |
| `/auth/change-password` | PUT | Authenticated |
| `/doctors` | GET, POST | GET: all authenticated roles, POST: admin |
| `/doctors/:id` | GET, PUT, DELETE | GET: all authenticated roles, PUT/DELETE: admin |
| `/patients` | GET, POST | GET: admin, clinician, receptionist; POST: admin, receptionist |
| `/patients/:id` | GET, PUT, DELETE | GET: admin, clinician, receptionist; PUT: admin, clinician; DELETE: admin |
| `/patients/:id/profile` | GET | admin, clinician |
| `/diagnoses` | GET, POST | GET: admin, clinician; POST: admin |
| `/diagnoses/:id` | GET, PUT, DELETE | GET/PUT: admin, clinician; DELETE: admin |
| `/dashboard/stats` | GET | admin, clinician, receptionist |
| `/users` | GET, POST | admin |
| `/users/:id/password` | PUT | admin |
| `/users/:id` | DELETE | admin |

## Submission Notes

Do not include `node_modules`, `frontend/dist`, `.git`, `backend/.env` or `frontend/.env` in the final ZIP submission. Keep `.env.example` files so assessors can see the required configuration.
