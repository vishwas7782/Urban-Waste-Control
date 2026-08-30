# 🗑️ Urban Waste Control System (MERN)

A full-stack waste-management platform that connects residents with municipal bodies for timely
garbage collection, issue reporting, and schedule management. This repository was upgraded from a
plain HTML/CSS/JS + monolithic Express app into a **MERN** stack with a **React (Vite)** frontend and
a **modular Express/MongoDB** backend, cleanly separated into two apps.

## 🧱 Project structure

```
Urban-Waste-Control/
├── backend/          # Express + MongoDB REST API (modular: models, routes, controllers, middleware)
│   ├── src/
│   │   ├── config/       # DB connection
│   │   ├── models/       # Mongoose schemas
│   │   ├── middleware/   # auth, upload (multer), error handler
│   │   ├── controllers/  # request handlers
│   │   ├── routes/       # route definitions
│   │   ├── utils/        # email + token helpers
│   │   └── app.js        # express app wiring
│   ├── uploads/          # uploaded garbage images (served at /uploads)
│   └── server.js         # entry point
├── frontend/         # React (Vite) SPA — interactive UI, react-router, axios, toasts
│   └── src/
│       ├── api/          # axios client + auth interceptor
│       ├── context/      # AuthContext
│       ├── components/   # Navbar, Footer, ProtectedRoute, Loader, ...
│       ├── pages/        # Home, About, Services, Contact, Login, Signup, dashboards, ...
│       └── styles/       # global + page styles
└── package.json      # workspace root with convenience scripts
```

## ✨ Features

- **Authentication** — signup with email verification (Nodemailer), JWT login, role-based access
  (`user` vs `municipal`).
- **Residents (user)** — raise concerns, track their own concerns, report public garbage with photos,
  view collection schedules.
- **Municipal staff** — dashboard with summary stats, manage concerns / garbage reports / anonymous
  public reports (mark resolved, delete), publish collection schedules.
- **Anonymous public** — report garbage without an account, browse public collection schedules.
- **Contact** — messages delivered by email.

## 🚀 Getting started

### Prerequisites
- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas URI)

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Configure environment
Create `backend/.env` from the example and fill in values:
```bash
cp backend/.env.example backend/.env
```
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/UrbanWaste-db
JWT_SECRET=replace_with_a_long_random_secret
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:3000
```
Optionally create `frontend/.env` (defaults to `http://localhost:3000` if omitted):
```
VITE_API_URL=http://localhost:3000
```

### 3. Run both apps (from the repo root)
```bash
npm run dev
```
- Backend API → http://localhost:3000
- Frontend → http://localhost:5173

Or run them separately: `npm run dev:backend` and `npm run dev:frontend`.

## 🔌 API overview

All endpoints are served from the backend root (no `/api` prefix). Authenticated requests send
`Authorization: Bearer <token>`.

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/signup` | public | Register + send verification email |
| GET | `/verify-email?token=` | public | Verify email |
| POST | `/login` | public | Login, returns JWT + role |
| POST | `/send-contact-mail` | public | Contact form |
| POST | `/raise-concern` | user | Raise a concern |
| GET | `/view-user-concerns` | user | List own concerns |
| GET | `/view-concerns` | municipal | List all concerns |
| PATCH | `/mark-solved/:id` | municipal | Resolve a concern |
| DELETE | `/delete-concern/:id` | municipal | Delete a concern |
| POST | `/update-schedule` | municipal | Publish a schedule |
| GET | `/view-schedule?area=` | auth | Search schedules |
| GET | `/public-schedule?area=` | public | Search schedules (no login) |
| POST | `/report-public-garbage` | user | Report garbage (with image) |
| GET | `/view-garbage-reports` | municipal | List garbage reports |
| POST | `/report-public-garbage-no-login` | public | Anonymous garbage report |
| GET | `/view-public-garbage-reports` | municipal | List anonymous reports |

(Plus `mark-solved`/`delete` variants for garbage and public-garbage reports, and `GET /health`.)

## 🛡️ Notes
- Never commit `backend/.env` — it contains secrets. It is git-ignored.
- Uploaded images are stored in `backend/uploads/` and served statically.
