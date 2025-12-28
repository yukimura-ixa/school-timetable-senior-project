# Product Guide: School Timetable Management System

## Initial Concept
A comprehensive web application designed to streamline the process of creating and managing class and teaching schedules for secondary schools. This system addresses the complexity of coordinating teacher assignments, classroom allocations, and student timetables while preventing scheduling conflicts.

## Target Audience
- **School Administrators:** The primary power users who manage master data (teachers, rooms, subjects), configure semesters, and orchestrate the overall scheduling process to ensure curriculum coverage and compliance.
- **Teachers:** Need access to their personal teaching schedules and tools to manage their subject assignments and view their load.
- **Students & Parents:** Require simple, read-only access to view class timetables.

## Core Objectives
- **Conflict Prevention:** The system must guarantee integrity by ensuring no teacher or classroom is double-booked.
- **Efficiency:** Significantly reduce the manual labor and time required to generate a valid semester schedule.
- **Regulatory Compliance:** Automate validation against Thai Ministry of Education standards (subject codes, credits, hours) to ensure legal and academic validity.
- **Modernization:** Replace manual/legacy processes with a robust, web-based platform using modern technologies (Next.js 16, React 19).

## Key Features (Current Status)
- **Schedule Management (Production-Ready):**
    - **Assignment:** Assign subjects to classes.
    - **Arrangement:** Visual drag-and-drop interface for timetable creation using `@dnd-kit`.
    - **Configuration:** Manage semester settings and timeslot structures.
    - **Locks:** Mechanism to lock specific schedule slots.
- **Dashboard & Visualization:**
    - **Views:** Comprehensive views for All Timeslots, Teacher Tables, Student Tables, and All Programs.
    - **Exports:** Functionality to export schedules to Excel (`exceljs`) and PDF (`react-to-print`, `jspdf`).
- **Master Data Management:**
    - Complete management for Teachers, Subjects, Rooms, Grade Levels, and Programs.
- **Authentication:** Secure authentication via Better Auth.

## Technical Architecture
- **Framework:** Next.js 16 (App Router) with React 19.
- **Pattern:** Clean Architecture with Server Actions for all data mutations (100% migrated from API routes).
- **State Management:**
    - **Global:** Zustand (e.g., `semester-store` for global semester state).
    - **Data Fetching:** SWR for caching and revalidation.
- **Database:** PostgreSQL (Vercel Storage) accessed via Prisma ORM with Accelerate extension.
- **UI/UX:** Material-UI (MUI) v7 + Tailwind CSS v4.

## Constraints & Requirements
- **Strict ID Formats:**
    - **ConfigID:** `SEMESTER-YEAR` (e.g., `1-2567`).
    - **TimeslotID:** `SEMESTER-YEAR-DAYPERIOD` (e.g., `1-2567-MON1`).
- **Platform Optimization:**
    - **Management (Admin/Teacher):** Optimized primarily for **Desktop/PC** usage to handle complex data entry and grid manipulation.
    - **Public Views:** Responsive design to ensure schedules are accessible on mobile devices.
- **Validation:** Strict schema validation using `Valibot` for all inputs.
