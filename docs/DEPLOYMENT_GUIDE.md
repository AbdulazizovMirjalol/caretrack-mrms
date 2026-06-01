# Deployment Guide

## Supabase

1. Go to Supabase and create a new project.
2. Open Project Settings > API.
3. Copy the Project URL for `SUPABASE_URL`.
4. Copy the service role secret key for `SUPABASE_SERVICE_ROLE_KEY`.
5. Open SQL Editor and run `backend/database/schema.sql`.
6. Configure backend environment variables.
7. Run `npm run seed` from the backend folder if demo data is required.

Keep the service role key secret. It must only be used on the backend.

## Render Backend

Create a Render Web Service:

| Setting | Value |
| --- | --- |
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |

Render environment variables:

```env
PORT=5000
NODE_ENV=production
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_secret_key
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-vercel-url.vercel.app
```

Health check endpoint:

```text
GET https://your-render-api-url.onrender.com/api/health
```

Render free services may sleep after inactivity. The first request after sleep can be slower while the API wakes up.

## Vercel Frontend

Create a Vercel project:

| Setting | Value |
| --- | --- |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Vercel environment variable:

```env
VITE_API_URL=https://your-render-api-url.onrender.com/api
```

## CLIENT_URL Update

After Vercel deployment:

1. Copy the final Vercel URL.
2. Open Render backend environment variables.
3. Set `CLIENT_URL` to the final Vercel URL.
4. Redeploy or restart the backend service.
5. Test login from the live frontend.

## Final Smoke Test

| Check | Expected Result |
| --- | --- |
| `/api/health` | Returns healthy JSON response. |
| Frontend login | Demo accounts can sign in. |
| Dashboard | Stats load without CORS errors. |
| Doctors | Admin can create/update/delete a doctor. |
| Patients | Role-based patient access works. |
| Diagnoses | Receptionist is blocked; admin/clinician access works as designed. |
