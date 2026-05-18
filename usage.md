# Usage Guide

This guide explains how to launch both the frontend and backend of the EventPro Platform.

## Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Docker and Docker Compose (for database and Redis)
- PostgreSQL (via Docker or local)

## 1. Start Infrastructure (Database & Redis)

Run the provided Docker Compose setup:

```bash
docker compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379

## 2. Backend Setup and Launch

Navigate to the server directory:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Initialize the database:

```bash
npx prisma db push
npx prisma db seed
```

Start the development server:

```bash
npm run start:dev
```

The backend runs on `http://localhost:3001` (default NestJS port).

Other useful commands:
- `npm run start:prod` - Production build and run
- `npm run build` - Build for production
- `npm run lint` - Run linter

## 3. Frontend Setup and Launch

In a new terminal, navigate to the client directory:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend runs on `http://localhost:3000`.

Other useful commands:
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run linter

## Accessing the Application

- Open your browser to `http://localhost:3000`
- Backend API available at `http://localhost:3001`

## Default Test Users (from seed)

- Admin: `admin@eventpro.com` / `admin123`
- Organizer: `organizer@eventpro.com` / `organizer123`
- Attendee: `attendee@eventpro.com` / `attendee123`

## Environment Configuration

- Backend: Configure `.env` in `server/` (DATABASE_URL, JWT secrets, etc.)
- Frontend: Uses Next.js env vars in `.env.local` if needed

## Stopping Services

- Stop Docker: `docker compose down`
- Stop backend/frontend: `Ctrl+C` in respective terminals

For production deployment, build both and use appropriate hosting (Vercel for frontend, etc.).
