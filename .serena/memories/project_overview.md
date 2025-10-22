# Project Overview

## Project Name
School Timetable Management System (ระบบจัดตารางเรียนตารางสอน)

## Purpose
A comprehensive web application designed to streamline the creation and management of class and teaching schedules for secondary schools. The system addresses the complexity of coordinating teacher assignments, classroom allocations, and student timetables while preventing scheduling conflicts.

## Key Features
1. **Data Management**: Teachers, rooms, subjects, grade levels, and programs
2. **Subject Assignment**: Assign teachers to classes with weekly lesson counts
3. **Timetable Configuration**: Set academic year, semester, periods, breaks, and school days
4. **Timetable Arrangement**: Drag-and-drop interface with real-time conflict detection
5. **Lock Timeslots**: Create fixed periods for multi-class activities (assemblies, clubs)
6. **Views & Exports**: Teacher/class schedules, curriculum summaries in Excel and PDF formats
7. **Authentication**: Google OAuth for Admin/Teacher roles; public viewing for students

## Tech Stack
- **Framework**: Next.js 15.5.6 (App Router)
- **Runtime**: React 18.3.1
- **Language**: TypeScript (latest)
- **UI Libraries**: 
  - Tailwind CSS 4.1.14
  - Material-UI (MUI) 7.3.4
  - Emotion (styling engine)
- **Database**: MySQL 8.0 (Google Cloud SQL in production)
- **ORM**: Prisma 5.22.0
- **Authentication**: NextAuth.js 5.0.0-beta.29 (Google OAuth)
- **State Management**: SWR 2.3.6 (currently)
- **Testing**:
  - Jest 29.7.0 (unit tests)
  - Playwright 1.56.1 (E2E tests)
  - Testing Library (React)
- **Package Manager**: pnpm 10.18.3

## Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── arrange/       # Timetable arrangement endpoints
│   │   ├── assign/        # Subject assignment endpoints
│   │   ├── auth/          # Authentication endpoints
│   │   ├── class/         # Class management endpoints
│   │   ├── config/        # Timetable configuration endpoints
│   │   ├── gradelevel/    # Grade level endpoints
│   │   ├── lock/          # Lock timeslot endpoints
│   │   ├── program/       # Program endpoints
│   │   ├── room/          # Room endpoints
│   │   ├── subject/       # Subject endpoints
│   │   ├── teacher/       # Teacher endpoints
│   │   └── timeslot/      # Timeslot endpoints
│   ├── dashboard/         # Dashboard pages (viewing/exports)
│   ├── management/        # Data management pages
│   ├── schedule/          # Schedule management pages
│   ├── signin/            # Sign-in page
│   └── _hooks/            # Custom React hooks (SWR wrappers)
├── components/            # Reusable components
│   ├── elements/          # Basic UI elements
│   ├── mui/              # MUI wrapper components
│   └── templates/         # Layout templates
├── functions/             # Utility functions
├── libs/                  # Third-party library configurations
├── models/                # Static data models
└── types/                 # TypeScript type definitions

prisma/
├── schema.prisma          # Prisma schema (single source of truth)
├── migrations/            # Database migrations
└── seed.ts               # Database seeding script
```

## Current Architecture Issues (To Be Addressed)
1. **API Routes**: Mix HTTP concerns with Prisma queries and business logic
2. **Frontend Components**: Tightly coupled UI state, data fetching, and domain logic
3. **Data Fetching**: Inconsistent use of helper hooks, scattered SWR calls
4. **TypeScript**: Strict mode disabled (`strict: false`), widespread `any` usage
5. **Error Handling**: Inconsistent parsing/error handling across routes
6. **State Management**: No centralized state management solution
