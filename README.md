# School Timetable Management System

> **🇬🇧 English Version** | **[🇹🇭 เวอร์ชันภาษาไทย](README.th.md)**

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.18-2D3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1)](https://www.postgresql.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-7.3-007FFF)](https://mui.com/)
[![CI](https://github.com/yukimura-ixa/school-timetable-senior-project/actions/workflows/ci.yml/badge.svg)](https://github.com/yukimura-ixa/school-timetable-senior-project/actions/workflows/ci.yml)
[![E2E Tests](https://github.com/yukimura-ixa/school-timetable-senior-project/actions/workflows/e2e-tests.yml/badge.svg)](https://github.com/yukimura-ixa/school-timetable-senior-project/actions/workflows/e2e-tests.yml)

---

## 📋 Project Overview

A comprehensive web application designed to streamline the process of creating and managing class and teaching schedules for secondary schools. This system addresses the complexity of coordinating teacher assignments, classroom allocations, and student timetables while preventing scheduling conflicts.

### Authors

- **Napat Phobutdee** (นายณภัทร พ่อบุตรดี) - Student ID: 63070046
- **Natapon Wangkham** (นายณัฐพล วังคำ) - Student ID: 63070056

**Advisors:**

- Asst. Prof. Dr. Pattanapong Chantamit-O-Pas (ผศ.ดร.พัฒนพงษ์ ฉันทมิตรโอภาส)
- Asst. Prof. Dr. Supannada Chotipant (ผศ.ดร.สุพัณณดา โชติพันธ์)

**School of Information Technology**  
**King Mongkut's Institute of Technology Ladkrabang**  
**Academic Year 2023**

---

## 🎯 Objectives

1. Develop an online timetable management system that facilitates efficient scheduling
2. Reduce the time required for creating class and teaching schedules
3. Provide accessible online viewing of schedules for teachers and students
4. Enable data backup, retrieval, and export functionality
5. Implement conflict detection to prevent double-booking

---

## ✨ Key Features

### 🔧 Management Tools

- **Teacher Management**: Add, edit, and delete teacher information including name, department, and teaching responsibilities
- **Subject Management**: Organize subjects with course codes, credits, and categories
- **Classroom Management**: Manage classroom information including building, floor, and room names
- **Grade Level Management**: Configure grade levels, programs, and class sections
- **Curriculum Management**: Define curriculum structure for each grade level and semester

### 📅 Scheduling Features

- **Timetable Configuration**: Set up academic year, semester, class periods, break times, and daily schedules
- **Teaching Assignment**: Assign subjects and classes to teachers
- **Locked Timeslots**: Create fixed periods for activities involving multiple classes (e.g., assemblies, club activities)
- **Drag-and-Drop Interface**: Intuitive scheduling with visual conflict detection
- **Conflict Prevention**: Automatic checking to prevent overlapping schedules for teachers and classrooms
- **Schedule Copying**: Reuse and modify schedules from previous semesters

### 📊 Reporting & Viewing

- **Teacher Timetables**: Individual teaching schedules with room assignments
- **Student Timetables**: Class schedules organized by grade and section
- **Summary Tables**: Consolidated view of all teachers' schedules
- **Curriculum Overview**: Summary of subjects and credits by grade level
- **Export Functionality**: Generate schedules in Excel (.xlsx) and PDF formats
- **Online Access**: View schedules anytime via web browser (desktop and mobile)

### 👥 User Roles

- **Admin**: Full access to all management and scheduling features
- **Teacher**: View personal teaching schedule and student timetables
- **Student**: View class timetables

---

## 🏗️ System Architecture

![System Architecture](systemarch.png)

### Technology Stack

**Frontend:**

- Next.js 16 (React Framework with React Compiler)
- React 19.2 (UI Library)
- Material-UI 7.3 (Component Library)
- Tailwind CSS 4.1 (Styling)
- TypeScript (Type Safety)

**Backend:**

- Next.js Server Actions & API Routes
- Prisma ORM 6.18
- NextAuth.js v5 (Authentication with Google OAuth)
- Valibot (Runtime Validation)

**Database:**

- PostgreSQL 16
- Cloud-hosted PostgreSQL (Production)

**State Management & Data:**

- Zustand (UI State Management)
- SWR (Server State & Data Fetching)

**Additional Libraries:**

- ExcelJS (Excel export)
- React-to-Print (PDF generation)
- DnD Kit (Drag and drop)
- Recharts (Analytics & Charts)
- Notistack (Notifications)

---

## 📊 Database Schema

The system uses a relational database with the following main entities:

- **Teacher**: Teacher information and department assignments
- **Subject**: Course details including code, name, category, and credits
- **GradeLevel**: Class sections organized by year and program
- **Room**: Classroom locations and details
- **TimeSlot**: Time periods including day, start/end times, and break indicators
- **ClassSchedule**: Core scheduling data linking teachers, subjects, classrooms, and timeslots
- **TeacherResponsibility**: Teaching assignments for each semester
- **Program**: Curriculum structure for each grade level
- **TableConfig**: Timetable configuration settings per semester

**Entity-Relationship Diagram:** See `/database/er-diagram.mwb` for complete schema

---

## 📖 Documentation

**All project documentation has been organized in the `/docs` folder.**

### Getting Started

- **[Development Guide](docs/DEVELOPMENT_GUIDE.md)** ⭐ **START HERE** - Setup with OAuth bypass for local testing
- **[Environment Setup](docs/ENVIRONMENT_SETUP.md)** 🔧 **CONFIGURATION** - Local, CI, and production environment setup
- **[OAuth Bypass Summary](docs/OAUTH_BYPASS_SUMMARY.md)** - Complete technical summary of dev bypass
- **[Quickstart](docs/QUICKSTART.md)** - Quick setup guide

### For AI Agents & Contributors

- **[AGENTS.md](AGENTS.md)** 🤖 **AI Agent Handbook** - Operating manual for Codex/AI coding agents with MCP-first workflow, coding standards, and future roadmap

### Core Documentation

- **[Documentation Index](docs/INDEX.md)** - Complete documentation catalog
- **[Project Context](docs/PROJECT_CONTEXT.md)** - High-level project goals
- **[Database Overview](docs/DATABASE_OVERVIEW.md)** - Schema and data model

### Testing

- **[Test Plan](docs/TEST_PLAN.md)** - 29 comprehensive test cases
- **[E2E Test Execution Guide](docs/E2E_TEST_EXECUTION_GUIDE.md)** - How to run E2E tests
- **[Test Results Summary](docs/TEST_RESULTS_SUMMARY.md)** - Latest test status

### Migrations & Architecture

- **[Next.js 16 Migration](docs/LINTING_MIGRATION_NEXTJS16.md)** - Next.js 16 changes (no more `next lint`)
- **[MUI v7 Migration](docs/MUI_MIGRATION_COMPLETE.md)** - Material-UI v7 upgrade summary
- **[Architecture Decisions](docs/adr/)** - ADRs for key technical decisions

---

## 🚀 Getting Started

**👉 For detailed setup instructions with OAuth bypass, see [docs/DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md)**

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 16 or higher
- pnpm package manager

### Quick Start

1. **Clone the repository**

```bash
git clone https://github.com/yukimura-ixa/school-timetable-senior-project.git
cd school-timetable-senior-project
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

Copy the example file and configure:

```bash
cp .env.example .env
```

**For local development (OAuth Bypass):**

```env
# Enable dev bypass (local testing only - NEVER in production)
ENABLE_DEV_BYPASS="true"
DEV_USER_EMAIL="admin@test.com"
DEV_USER_ROLE="admin"

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/school-timetable-db-dev"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

**For production or Google OAuth:**

```env
# Disable dev bypass
ENABLE_DEV_BYPASS="false"

# Google OAuth credentials
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

📖 See [Development Guide](docs/DEVELOPMENT_GUIDE.md) for complete OAuth bypass setup

4. **Set up PostgreSQL database**

```sql
CREATE DATABASE "school-timetable-db-dev";
```

5. **Run database migrations**

```bash
pnpm db:migrate     # Run migrations
pnpm db:studio      # Open Prisma Studio (optional)
```

6. **Seed test data** (Recommended for development)

```bash
# Clean seed with sample data
pnpm db:seed:clean
```

The system will create mock data for a medium-sized school:

- 60 teachers, 18 classes, 40 rooms, 42+ subjects
- Sample schedules with edge cases for testing

7. **Start development server**

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

**First-time setup:** Click "เข้าสู่ระบบ (Dev Bypass)" to log in with admin access

### Building for Production

```bash
pnpm build
pnpm start
```

### Development Scripts

```bash
# Development
pnpm dev                    # Start dev server
pnpm lint                   # Run ESLint
pnpm lint:fix               # Auto-fix linting issues
pnpm format                 # Format with Prettier

# Testing
pnpm test                   # Run unit tests
pnpm test:watch             # Watch mode
pnpm test:e2e               # Run E2E tests
pnpm test:e2e:ui            # E2E tests with UI
pnpm test:report            # View test report

# Database
pnpm db:migrate             # Run migrations (dev)
pnpm db:deploy              # Deploy migrations (prod)
pnpm db:seed                # Seed database
pnpm db:seed:clean          # Clean seed
pnpm db:studio              # Open Prisma Studio

# Admin tools
pnpm admin:create           # Create admin user
pnpm admin:verify           # Verify admin access
```

### ⚠️ Known Issues

#### Next.js 16 + Jest Stack Overflow

**Status**: Workaround Implemented ✅

Jest tests pass successfully but the process does not exit cleanly due to a known incompatibility between Next.js 16.0.1 and Jest 29.7.0. The `forceExit: true` flag has been added to `jest.config.js` as a workaround.

- **Issue**: [#46](https://github.com/yukimura-ixa/school-timetable-senior-project/issues/46)
- **Impact**: Tests pass (50/50), but Jest exits with `forceExit` flag
- **Root Cause**: Next.js unhandled rejection handler causes infinite `setImmediate` recursion
- **Workaround**: Automatic (configured in `jest.config.js`)
- **Long-term**: Waiting for Next.js 16.1+ fix

For more details, see the `nextjs_16_jest_stack_overflow_issue` memory file.

---

## 📖 Usage Guide

### Initial Setup

1. **Setup Database**: Run migrations and seed sample data

   ```bash
   pnpm db:deploy        # Apply migrations
   pnpm db:seed:clean    # Populate sample data (clean mode)
   # OR
   pnpm db:seed          # Create admin only (safe - no data deletion)
   ```

   📚 See details: [docs/SEED_SAFETY_GUIDE.md](docs/SEED_SAFETY_GUIDE.md)

2. **Login**:
   - **Admin**: `admin@school.local` / `admin123` (change password in production!)
   - **Google OAuth**: Authenticate with Google account (Admin/Teacher only)

3. **Configure Timetable Settings**:
   - Select academic year and semester
   - Set number of periods per day
   - Define class duration and break times
   - Configure school days

### 🌐 Production Setup (Vercel)

**Seeding Production Database:**

If you need to create semester records in production (e.g., 2567-2568):

```pwsh
# 1. Add SEED_SECRET to Vercel environment variables (one-time setup)
pnpm seed:setup

# 2. Run the production seed script (basic - semesters only)
pnpm seed:prod

# OR run with full data seeding (semesters + timeslots + config)
.\scripts\seed-production.ps1 -SeedData
```

📖 **Quick Guide**: [docs/QUICK_SEED_SETUP.md](docs/QUICK_SEED_SETUP.md)  
📚 **Full Documentation**: [docs/PRODUCTION_SEED_GUIDE.md](docs/PRODUCTION_SEED_GUIDE.md)  
🧪 **Testing Guide**: [docs/SEEDING_AND_TESTING_GUIDE.md](docs/SEEDING_AND_TESTING_GUIDE.md)

This will:

- ✅ Create missing semester records (idempotent - safe to run multiple times)
- ✅ Optionally create baseline timeslots and table config (with `-SeedData` flag)
- ✅ Enable access to routes like `/dashboard/1-2567/all-timeslot`
- ✅ Prevent redirect loops for valid semesters

### Data Management

1. **Add Basic Data**:
   - Teachers (name, department)
   - Subjects (code, name, credits, category)
   - Classrooms (name, building, floor)
   - Grade levels and class sections

2. **Set Up Curriculum**:
   - Define curriculum for each grade level
   - Assign subjects to each grade's program
   - Specify required subjects and electives

### Creating Schedules

1. **Assign Teaching Responsibilities**:
   - Select teacher
   - Choose classes they teach
   - Assign subjects with number of periods per week

2. **Lock Timeslots** (Optional):
   - Create fixed periods for school-wide activities
   - Assign multiple classes to the same timeslot

3. **Arrange Timetable**:
   - Select teacher to schedule
   - Drag subjects to available timeslots
   - System shows conflicts automatically
   - Assign classrooms for each period

### Viewing and Exporting

- Access summary views from the dashboard
- Select semester to view
- Export to Excel or PDF format
- Share online links with teachers and students

---

## 🧪 Testing

### Unit Tests

Run tests with Jest:

```bash
pnpm test
pnpm test:watch
```

### E2E Tests

Run E2E tests with Playwright:

```bash
# Run all E2E tests
pnpm test:e2e

# Run with interactive UI
pnpm test:e2e:ui

# View test report
pnpm test:report
```

**E2E Test Documentation:**

- **Test Plan**: See `e2e/TEST_PLAN.md` for 29 comprehensive test cases
- **Execution Guide**: See `E2E_TEST_EXECUTION_GUIDE.md` for detailed instructions
- **Test Results**: See `e2e/TEST_RESULTS_SUMMARY.md` for current status

**Test Coverage:**

- ✅ 29 E2E test cases covering all major workflows
- ✅ Authentication and authorization
- ✅ Data management (CRUD operations)
- ✅ Timetable configuration and arrangement
- ✅ Conflict detection
- ✅ Export functionality (Excel/PDF)
- ✅ Viewing schedules (teacher and student)
- ✅ Mobile responsiveness

---

## 📁 Project Structure

```
school-timetable-senior-project/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── management/        # Data management pages
│   │   ├── schedule/          # Scheduling pages
│   │   └── signin/            # Authentication
│   ├── components/            # React components
│   │   ├── elements/          # Reusable UI elements
│   │   └── templates/         # Page templates
│   ├── functions/             # Utility functions
│   ├── libs/                  # Third-party library configs
│   └── models/                # Data models and types
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── database/
│   ├── er-diagram.mwb         # ER diagram
│   └── *.sql                  # Database backups
├── public/                    # Static assets
└── __test__/                  # Test files
```

---

## 🔒 Authentication

The system uses NextAuth.js with Google OAuth for authentication:

- **Admin**: Full system access including all management features
- **Teacher**: Can view their teaching schedule and student timetables
- **Guest/Student**: Can view timetables without authentication

---

## 🎨 User Interface

The system features a modern, responsive interface designed for ease of use:

- Clean, intuitive layout with Material-UI components
- Color-coded schedules for easy visualization
- Drag-and-drop functionality for scheduling
- Real-time conflict detection with visual feedback
- Mobile-responsive design for viewing schedules on any device

---

## 📊 Evaluation Results

User satisfaction survey results (25 respondents: 20 teachers, 5 students):

- **Overall Satisfaction**: 4.53/5.00
- **Data Management**: 4.49/5.00
- **Report Summary**: 4.54/5.00
- **User Interface Design**: 4.56/5.00
- **Usefulness**: 4.61/5.00

**Key findings:**

- ✅ Reduces time spent on schedule creation
- ✅ Makes schedule management more convenient
- ✅ Provides clear overview of curriculum and schedules
- ✅ Easy to understand and use

---

## 🚧 Known Limitations

1. Requires internet connection for full functionality
2. Optimized for desktop and tablet use (scheduling features)
3. Currently supports single-school deployment
4. Does not include automatic schedule generation algorithm

---

## 🔮 Future Enhancements

1. **AI-Powered Auto-Scheduling**: Implement algorithm to suggest optimal schedules
2. **Mobile App**: Native mobile applications for iOS and Android
3. **Multi-School Support**: Enable system to manage multiple schools from one instance
4. **Advanced Analytics**: Teacher workload analysis and schedule optimization insights
5. **Integration**: Connect with school management systems and student information systems
6. **Notifications**: Push notifications for schedule changes
7. **Offline Mode**: Limited functionality when internet is unavailable

---

## 📄 License

This project was developed as a senior project at King Mongkut's Institute of Technology Ladkrabang.

Copyright © 2024 School of Information Technology, KMITL

---

## 🤝 Acknowledgments

Special thanks to:

- **Prasong Sammakee Wittaya School** for providing real-world insights and testing feedback
- **Khun Nongrak Phobutdee** (Teacher) for interviews and requirement gathering
- **Faculty of Information Technology, KMITL** for facilities and support
- Our advisors for guidance throughout the project

---

## 📞 Contact

### For questions or support:

**Napat Phobutdee (นายณภัทร พ่อบุตรดี)**

- Email: 63070046@kmitl.ac.th

**Natapon Wangkham (นายณัฐพล วังคำ)**

- Email: nataponball@hotmail.com

---

**Developed with ❤️ at KMITL**
