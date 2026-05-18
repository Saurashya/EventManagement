# EventPro Platform

EventPro is a production-grade Enterprise Event Management System built with Next.js 15, NestJS, and PostgreSQL.

## Architecture

* **Frontend:** Next.js 15 (App Router), Tailwind CSS v4, Shadcn UI, Zustand, Axios
* **Backend:** NestJS 11, Prisma ORM, PostgreSQL, JWT Authentication
* **Design System:** "Midnight Intelligence" (Glassmorphism, Indigo/Purple gradients)

## Getting Started

### 1. Database Setup

Ensure you have a PostgreSQL database running. You can use the provided `docker-compose.yml` if you have Docker Compose installed:

```bash
docker compose up -d
```

Update your `.env` in the `server` directory to match your database credentials:
`DATABASE_URL="postgresql://postgres:password@localhost:5432/eventpro?schema=public"`

### 2. Backend Initialization

```bash
cd server
npm install
npx prisma db push
npx prisma db seed
npm run start:dev
```

### 3. Frontend Initialization

```bash
cd client
npm install
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Default Seed Users

* Admin: `admin@eventpro.com` / `admin123`
* Organizer: `organizer@eventpro.com` / `organizer123`
* Attendee: `attendee@eventpro.com` / `attendee123`
