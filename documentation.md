# EventPro: Enterprise Event Management Platform

**Academic Documentation**

**Version 1.0**  
**Date: May 2026**  
**Authors: Abhisekh Bista**

---

## Abstract

EventPro is a production-grade, full-stack Enterprise Event Management System designed to streamline the complete lifecycle of events—from creation and promotion to registration, payment processing, on-site check-in, and post-event analytics. Built using modern web technologies, EventPro demonstrates scalable microservices-inspired architecture within a monorepo structure, incorporating real-time capabilities, secure authentication, and third-party integrations including Stripe payments and QR-based check-ins.

This document provides a comprehensive academic overview of the system architecture, technology choices, data models, security mechanisms, and deployment strategies.

---

## 1. Introduction

Event management in enterprise settings involves complex coordination across multiple stakeholders: organizers, attendees, sponsors, and administrators. Traditional solutions often suffer from fragmented tools, poor real-time visibility, and limited scalability.

EventPro addresses these challenges by offering an integrated platform that supports:

- Role-based access control (Admin, Organizer, Attendee)
- End-to-end event lifecycle management
- Real-time notifications and engagement tools
- Secure payments and ticketing
- Data-driven analytics and check-in systems

The platform is developed as a monorepo containing a Next.js frontend and a NestJS backend, containerized for consistent deployment.

---

## 2. System Architecture

EventPro follows a modern full-stack architecture:

- **Frontend (Client):** Next.js 16 (App Router) with React Server Components, client-side state management via Zustand and TanStack Query.
- **Backend (Server):** NestJS 11 modular architecture with dependency injection, Prisma ORM, and WebSocket support via Socket.IO.
- **Data Layer:** PostgreSQL (primary) + Redis (caching, sessions, real-time).
- **Infrastructure:** Docker Compose orchestration for development and production parity.

The system is designed with clear separation of concerns, RESTful APIs, and event-driven patterns for notifications and check-ins.

---

## 3. Technology Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4, Shadcn/UI components
- **State Management:** Zustand, TanStack React Query
- **Forms & Validation:** React Hook Form + Zod
- **Real-time:** Socket.IO Client
- **Payments & QR:** Stripe integration, qrcode.react

### Backend
- **Framework:** NestJS 11
- **ORM:** Prisma with PostgreSQL
- **Authentication:** JWT + Passport.js (Local + Google OAuth)
- **Real-time:** @nestjs/websockets + Socket.IO
- **Payments:** Stripe SDK
- **Caching/Queues:** ioredis
- **Security:** Helmet, CORS, Rate limiting

### DevOps & Tooling
- Docker & Docker Compose
- Prisma Migrations & Seeding
- ESLint + Prettier
- TypeScript throughout

---

## 4. Core Features

- **Event Management:** Create, publish, edit, and manage events with visibility controls (Public/Private) and status workflows.
- **Ticketing & Registration:** Support for free and paid tickets, registration workflows, and capacity management.
- **Payments:** Multi-provider support (Stripe, Khalti, eSewa) with webhook handling.
- **Check-in System:** QR code generation and scanning for fast on-site verification.
- **Analytics Dashboard:** Real-time insights into registrations, revenue, engagement, and attendance.
- **Notifications & Engagement:** In-app and real-time notifications, polls, and announcements.
- **User Roles:** Granular permissions for Admins, Organizers, and Attendees.

---

## 5. Database Design

The system uses a normalized relational schema with the following primary entities:

- **User** — Core identity with role-based attributes and OAuth support.
- **Event** — Central entity with organizer relation, status, visibility, and capacity.
- **Ticket** — Linked to events; supports free/paid types and pricing.
- **Registration** — Tracks attendee sign-ups with status lifecycle.
- **Payment** — Records transactions with provider and status.
- **CheckIn** — Logs attendance via QR or manual methods.
- **Notification**, **Poll**, **PollVote** — Engagement and communication modules.

Full Prisma schema defines enums for status management and relations for data integrity.

---

## 6. Authentication & Security

- JWT-based stateless authentication with refresh token support.
- Role-based access control using custom decorators and guards.
- Password hashing with bcrypt.
- Google OAuth2 integration.
- Security headers via Helmet and strict CORS policies.

---

## 7. API Design

The backend exposes a well-structured REST API under `/api` prefix with modules for:

- `auth`
- `events`
- `registrations`
- `tickets`
- `payments`
- `checkin`
- `analytics`
- `notifications`

All endpoints are documented via Swagger (NestJS Swagger module).

---

## 8. Deployment & Containerization

EventPro is fully containerized:

- Separate Dockerfiles for optimized production builds of client and server.
- Single `docker-compose.yml` orchestrating PostgreSQL, Redis, API, and Web services.
- Health checks and dependency ordering ensure reliable startup.
- Environment variables manage configuration across environments.

---

## 9. Conclusion

EventPro exemplifies a modern, scalable approach to enterprise event management software. By leveraging TypeScript, modular backend design, and a component-driven frontend, the platform achieves high maintainability and developer productivity while delivering rich user experiences through real-time features and secure financial workflows.

Future enhancements may include mobile applications, advanced AI-driven recommendations, and multi-tenant SaaS capabilities.

---

**End of Documentation**
