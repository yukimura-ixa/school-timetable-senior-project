# School Timetable Management System

> **🇬🇧 English Version** | **[🇹🇭 เวอร์ชันภาษาไทย](README.th.md)**


[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.18-2D3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1)](https://www.postgresql.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-7.3-007FFF)](https://mui.com/)

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

- Next.js 16 (React Framework)
- Material-UI 7.3 (Component Library)
- Tailwind CSS 4.1 (Styling)
- TypeScript (Type Safety)

**Backend:**

- Next.js API Routes
- Prisma ORM
- NextAuth.js (Authentication with Google OAuth)

**Database:**

- PostgreSQL 16
- Cloud-hosted PostgreSQL (Production)

**Additional Libraries:**

- ExcelJS (Excel export)
- React-to-Print (PDF generation)
- DnD Kit (Drag and drop)
- SWR (Data fetching)
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

### Core Documentation
- **[Development Guide](docs/DEVELOPMENT_GUIDE.md)** - Setup instructions with OAuth bypass for testing
- **[Documentation Index](docs/INDEX.md)** - Complete documentation catalog
- **[Test Plan](docs/TEST_PLAN.md)** - 29 comprehensive test cases
- **[Database Overview](docs/DATABASE_OVERVIEW.md)** - Schema and data model

### Operations & Testing
- **[Seeding and Testing Guide](docs/SEEDING_AND_TESTING_GUIDE.md)** - Production seeding and test workflows
- **[ConfigID Format Migration](docs/CONFIGID_FORMAT_MIGRATION.md)** - ConfigID standardization plan

---

## 🚀 Getting Started

**👉 For detailed setup instructions with OAuth bypass, see [docs/DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md)**

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 16 or higher
- pnpm package manager

### Installation



1. **Clone the repository**

```bash
git clone https://github.com/yukimura-ixa/school-timetable-senior-project.git
cd school-timetable-senior-project
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up PostgreSQL database**

```sql
CREATE DATABASE "school-timetable-db-dev";
```

4. **Configure environment variables**

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/school-timetable-db-dev"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth (for authentication)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Firebase (optional, if using Firebase services)
NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-firebase-auth-domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-firebase-project-id"
```

5. **Run database migrations**

```bash
pnpm prisma migrate dev --name init
pnpm prisma generate
```

6. **Seed test data (Optional)**

```bash
# Seed database with mock Thai school data
pnpm prisma db seed
```

The system will create mock data for a medium-sized school:
- 60 teachers, 18 classes, 40 rooms, 42+ subjects
- Sample schedules with edge cases for testing

📖 [See details](./prisma/QUICKSTART.md)

7. **Start development server**

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
pnpm build
pnpm start
```

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

### การจัดการข้อมูล | Data Management

**ภาษาไทย:**

1. **เพิ่มข้อมูลพื้นฐาน**:
   - ครู (ชื่อ กลุ่มสาระ)
   - วิชา (รหัสวิชา ชื่อ หน่วยกิต หมวดหมู่)
   - ห้องเรียน (ชื่อ อาคาร ชั้น)
   - ระดับชั้นและห้องเรียน

2. **ตั้งค่าหลักสูตร**:
   - กำหนดหลักสูตรสำหรับแต่ละระดับชั้น
   - กำหนดวิชาให้กับหลักสูตรของแต่ละชั้น
   - ระบุวิชาบังคับและวิชาเลือก

**English:**

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
