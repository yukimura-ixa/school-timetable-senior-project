# Technology Stack: School Timetable Management System

## Frontend Framework
- **Next.js 16.0.0+ (App Router):** Leveraging React 19, Server Components, and Server Actions for a modern, high-performance web architecture.
- **TypeScript:** Ensuring type safety and maintainability across the codebase.

## UI & Styling
- **Material-UI (MUI) v7.3.4+:** Core component library for consistent, professional UI following Material Design.
- **Tailwind CSS v4.1.14+:** Utility-first CSS framework for rapid UI development and custom styling.
- **Emotion:** CSS-in-JS library supporting MUI styling.

## Backend & Data
- **Node.js 18+:** Server-side runtime.
- **PostgreSQL:** Primary relational database, hosted via Vercel Storage.
- **Prisma v6.18.0+:** Type-safe ORM for database modeling and access, using Prisma Client and Accelerate for connection pooling.

## Authentication
- **Better Auth:** Secure, modern authentication management.

## State & Data Management
- **Zustand v5.0.8+:** Lightweight state management for global client-side state.
- **SWR v2.3.6+:** React Hooks library for data fetching, caching, and synchronization.
- **ActionResult Pattern:** Standardized server-to-client response format for Server Actions.

## Validation
- **Valibot v1.1.0+:** Lightweight, modular schema validation for all inputs and data structures.

## Testing & Quality
- **Playwright v1.56.1+:** Robust end-to-end testing framework for critical user flows and conflict detection.
- **Vitest v4.0.16+:** Fast, modern unit testing framework for domain logic and utility functions.
- **GitHub Actions:** CI/CD pipeline for automated testing and deployment.

## Tooling
- **pnpm v10.18.3+:** Fast, disk space efficient package manager (REQUIRED).
- **ESLint & Prettier:** For code quality and consistent formatting.
