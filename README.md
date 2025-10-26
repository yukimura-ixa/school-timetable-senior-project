# ระบบจัดตารางเรียนตารางสอนสำหรับโรงเรียน



[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1)](https://www.mysql.com/)
[![Material-UI](https://img.shields.io/badge/Material--UI-5.18-007FFF)](https://mui.com/)

> **[English Version](#english-version)** | **[เวอร์ชันภาษาอังกฤษ](#english-version)**

---

## 📋 ภาพรวมโครงการ | Project Overview

### ภาษาไทย

เว็บแอปพลิเคชันที่ครอบคลุมและออกแบบมาเพื่ออำนวยความสะดวกในการสร้างและจัดการตารางเรียนตารางสอนสำหรับโรงเรียนมัธยมศึกษา ระบบนี้แก้ไขความซับซ้อนในการประสานงานการมอบหมายงานสอนของครู การจัดสรรห้องเรียน และตารางเรียนของนักเรียน พร้อมทั้งป้องกันการชนกันของตารางเรียน

### English

A comprehensive web application designed to streamline the process of creating and managing class and teaching schedules for secondary schools. This system addresses the complexity of coordinating teacher assignments, classroom allocations, and student timetables while preventing scheduling conflicts.

### ผู้จัดทำ | Authors

- **นายณภัทร พ่อบุตรดี** (Napat Phobutdee) - รหัสนักศึกษา | Student ID: 63070046
- **นายณัฐพล วังคำ** (Natapon Wangkham) - รหัสนักศึกษา | Student ID: 63070056


**อาจารย์ที่ปรึกษา | Advisors:**

- ผศ.ดร.พัฒนพงษ์ ฉันทมิตรโอภาส (Asst. Prof. Dr. Pattanapong Chantamit-O-Pas)
- ผศ.ดร.สุพัณณดา โชติพันธ์ (Asst. Prof. Dr. Supannada Chotipant)

**คณะเทคโนโลยีสารสนเทศ | School of Information Technology**  
**สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง | King Mongkut's Institute of Technology Ladkrabang**  
**ปีการศึกษา 2566 | Academic Year 2023**

---

## 🎯 วัตถุประสงค์ | Objectives

### ภาษาไทย

1. พัฒนาระบบจัดตารางเรียนตารางสอนที่ใช้งานผ่านช่องทางออนไลน์
2. ลดเวลาที่ใช้ในการจัดตารางเรียนตารางสอนในโรงเรียน
3. ให้ครูและนักเรียนสามารถเข้าถึงและดูตารางเรียนตารางสอนออนไลน์ได้
4. รองรับการสำรองข้อมูล การเรียกคืนข้อมูล และการนำออกข้อมูล
5. ตรวจสอบและป้องกันการลงคาบเรียนซ้ำ

### English

1. Develop an online timetable management system that facilitates efficient scheduling
2. Reduce the time required for creating class and teaching schedules
3. Provide accessible online viewing of schedules for teachers and students
4. Enable data backup, retrieval, and export functionality
5. Implement conflict detection to prevent double-booking



---

## ✨ คุณสมบัติหลัก | Key Features

### 🔧 เครื่องมือจัดการข้อมูล | Management Tools

**ภาษาไทย:**

- **จัดการข้อมูลครู**: เพิ่ม แก้ไข และลบข้อมูลครู รวมถึงชื่อ กลุ่มสาระ และความรับผิดชอบในการสอน
- **จัดการวิชา**: จัดระเบียบวิชาพร้อมรหัสวิชา หน่วยกิต และหมวดหมู่
- **จัดการห้องเรียน**: จัดการข้อมูลห้องเรียน รวมถึงอาคาร ชั้น และชื่อห้อง
- **จัดการระดับชั้น**: กำหนดค่าระดับชั้น หลักสูตร และห้องเรียน
- **จัดการหลักสูตร**: กำหนดโครงสร้างหลักสูตรสำหรับแต่ละระดับชั้นและภาคเรียน

**English:**

- **Teacher Management**: Add, edit, and delete teacher information including name, department, and teaching responsibilities
- **Subject Management**: Organize subjects with course codes, credits, and categories
- **Classroom Management**: Manage classroom information including building, floor, and room names
- **Grade Level Management**: Configure grade levels, programs, and class sections
- **Curriculum Management**: Define curriculum structure for each grade level and semester

### 📅 ฟีเจอร์การจัดตาราง | Scheduling Features

**ภาษาไทย:**

- **ตั้งค่าตาราง**: กำหนดปีการศึกษา ภาคเรียน คาบเรียน เวลาพัก และตารางรายวัน
- **มอบหมายการสอน**: กำหนดวิชาและชั้นเรียนให้กับครู
- **ล็อกคาบเรียน**: สร้างช่วงเวลาคงที่สำหรับกิจกรรมที่มีหลายชั้นเรียนร่วมกัน (เช่น ชุมนุม กิจกรรมลูกเสือ)
- **อินเทอร์เฟซแบบลากและวาง**: การจัดตารางที่ใช้งานง่ายพร้อมการตรวจสอบความขัดแย้งแบบทันที
- **ป้องกันการชนกัน**: ตรวจสอบอัตโนมัติเพื่อป้องกันตารางซ้อนทับของครูและห้องเรียน
- **คัดลอกตาราง**: นำตารางจากภาคเรียนก่อนหน้ามาใช้และปรับแต่งใหม่

**English:**

- **Timetable Configuration**: Set up academic year, semester, class periods, break times, and daily schedules
- **Teaching Assignment**: Assign subjects and classes to teachers
- **Locked Timeslots**: Create fixed periods for activities involving multiple classes (e.g., assemblies, club activities)
- **Drag-and-Drop Interface**: Intuitive scheduling with visual conflict detection
- **Conflict Prevention**: Automatic checking to prevent overlapping schedules for teachers and classrooms
- **Schedule Copying**: Reuse and modify schedules from previous semesters

### 📊 การรายงานและการดูข้อมูล | Reporting & Viewing

**ภาษาไทย:**

- **ตารางสอนของครู**: ตารางสอนรายบุคคลพร้อมการกำหนดห้องเรียน
- **ตารางเรียนของนักเรียน**: ตารางเรียนจัดเรียงตามระดับชั้นและห้อง
- **ตารางสรุป**: มุมมองรวมของตารางสอนครูทั้งหมด
- **ภาพรวมหลักสูตร**: สรุปวิชาและหน่วยกิตตามระดับชั้น
- **ฟังก์ชันนำออก**: สร้างตารางในรูปแบบ Excel (.xlsx) และ PDF
- **การเข้าถึงออนไลน์**: ดูตารางได้ทุกเวลาผ่านเว็บเบราว์เซอร์ (คอมพิวเตอร์และมือถือ)

**English:**

- **Teacher Timetables**: Individual teaching schedules with room assignments
- **Student Timetables**: Class schedules organized by grade and section
- **Summary Tables**: Consolidated view of all teachers' schedules
- **Curriculum Overview**: Summary of subjects and credits by grade level
- **Export Functionality**: Generate schedules in Excel (.xlsx) and PDF formats
- **Online Access**: View schedules anytime via web browser (desktop and mobile)

### 👥 บทบาทผู้ใช้งาน | User Roles

**ภาษาไทย:**

- **ผู้ดูแลระบบ (Admin)**: เข้าถึงฟีเจอร์การจัดการและจัดตารางได้ทั้งหมด
- **ครู (Teacher)**: ดูตารางสอนส่วนตัวและตารางเรียนของนักเรียน
- **นักเรียน (Student)**: ดูตารางเรียนของชั้นเรียน

**English:**

- **Admin**: Full access to all management and scheduling features
- **Teacher**: View personal teaching schedule and student timetables
- **Student**: View class timetables

---

## 🏗️ สถาปัตยกรรมระบบ | System Architecture

![System Architecture](systemarch.png)

### เทคโนโลยีที่ใช้ | Technology Stack

**ส่วนหน้าบ้าน (Frontend):**

- Next.js 14.2 (React Framework)
- Material-UI 5.18 (Component Library)
- Tailwind CSS (Styling)
- TypeScript (Type Safety)

**ส่วนหลังบ้าน (Backend):**

- Next.js API Routes
- Prisma ORM
- NextAuth.js (Authentication with Google OAuth)

**ฐานข้อมูล (Database):**

- MySQL 8.0
- Google Cloud SQL (Production)

**ไลบรารีเสริม (Additional Libraries):**

- ExcelJS (Excel export)
- React-to-Print (PDF generation)
- React Beautiful DnD (Drag and drop)
- SWR (Data fetching)
- Notistack (Notifications)

---

## 📊 โครงสร้างฐานข้อมูล | Database Schema

### ภาษาไทย

ระบบใช้ฐานข้อมูลเชิงสัมพันธ์ที่ประกอบด้วยเอนทิตีหลักดังนี้:

- **Teacher (ครู)**: ข้อมูลครูและการจัดกลุ่มสาระ
- **Subject (วิชา)**: รายละเอียดวิชา ได้แก่ รหัสวิชา ชื่อ หมวดหมู่ และหน่วยกิต
- **GradeLevel (ระดับชั้น)**: ห้องเรียนที่จัดตามปีและหลักสูตร
- **Room (ห้องเรียน)**: ตำแหน่งและรายละเอียดห้องเรียน
- **TimeSlot (ช่วงเวลา)**: ช่วงเวลา รวมถึงวัน เวลาเริ่ม/สิ้นสุด และตัวบ่งชี้เวลาพัก
- **ClassSchedule (ตารางเรียน)**: ข้อมูลหลักของตารางที่เชื่อมโยงครู วิชา ห้องเรียน และช่วงเวลา
- **TeacherResponsibility (ความรับผิดชอบของครู)**: การมอบหมายงานสอนในแต่ละภาคเรียน
- **Program (หลักสูตร)**: โครงสร้างหลักสูตรสำหรับแต่ละระดับชั้น
- **TableConfig (การตั้งค่าตาราง)**: การตั้งค่าตารางเรียนต่อภาคเรียน

**แผนภาพ Entity-Relationship:** ดูข้อมูลเพิ่มเติมที่ `/database/er-diagram.mwb`

### English

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

- **[Development Guide](docs/DEVELOPMENT_GUIDE.md)** - Setup instructions with OAuth bypass for testing
- **[Documentation Index](docs/INDEX.md)** - Complete documentation catalog
- **[Test Plan](docs/TEST_PLAN.md)** - 29 comprehensive test cases
- **[Database Overview](docs/DATABASE_OVERVIEW.md)** - Schema and data model

---

## 🚀 การเริ่มต้นใช้งาน | Getting Started

**👉 For detailed setup instructions with OAuth bypass, see [docs/DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md)**

### ข้อกำหนดเบื้องต้น | Prerequisites

- Node.js 18.x หรือสูงกว่า (or higher)
- MySQL 8.0
- npm หรือ yarn package manager

### การติดตั้ง | Installation



1. **โคลนโปรเจค | Clone the repository**

```bash
git clone https://github.com/yukimura-ixa/school-timetable-senior-project.git
cd school-timetable-senior-project
```

2. **ติดตั้ง dependencies | Install dependencies**

```bash
npm install
```

3. **ตั้งค่าฐานข้อมูล MySQL | Set up MySQL database**

```sql
CREATE DATABASE `school-timetable-db-dev`;
```

4. **ตั้งค่า environment variables | Configure environment variables**

สร้างไฟล์ `.env` ในโฟลเดอร์หลัก (Create a `.env` file in the root directory):

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/school-timetable-db-dev?connection_limit=40&connect_timeout=0&pool_timeout=0"

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

5. **รัน database migrations | Run database migrations**

```bash
npx prisma migrate dev --name init
npx prisma generate
```

6. **เติมข้อมูลทดสอบ (ตัวเลือก) | Seed test data (Optional)**

```bash
# Seed database with mock Thai school data
npx prisma db seed
```

ระบบจะสร้างข้อมูลจำลองสำหรับโรงเรียนขนาดกลาง:
- 60 ครู, 18 ชั้นเรียน, 40 ห้องเรียน, 42+ วิชา
- ตารางตัวอย่างพร้อม edge cases สำหรับทดสอบ

The system will create mock data for a medium-sized school:
- 60 teachers, 18 classes, 40 rooms, 42+ subjects
- Sample schedules with edge cases for testing

📖 [ดูรายละเอียดเพิ่มเติม | See details](./prisma/QUICKSTART.md)

7. **เริ่มต้น development server | Start development server**

```bash
npm run dev
```

แอปพลิเคชันจะพร้อมใช้งานที่ | The application will be available at `http://localhost:3000`

### สร้างเวอร์ชันสำหรับ Production | Building for Production

```bash
npm run build
npm start
```

---

## 📖 คู่มือการใช้งาน | Usage Guide

### การตั้งค่าเริ่มต้น | Initial Setup

**ภาษาไทย:**

1. **สร้างฐานข้อมูล**: รัน migration และ seed ข้อมูลตัวอย่าง
   ```bash
   pnpm db:deploy        # ใช้ migrations
   pnpm db:seed:clean    # เติมข้อมูลตัวอย่าง (ล้างข้อมูลเก่า)
   # OR
   pnpm db:seed          # สร้างแค่ admin (ปลอดภัย - ไม่ลบข้อมูล)
   ```
   📚 ดูรายละเอียด: [docs/SEED_SAFETY_GUIDE.md](docs/SEED_SAFETY_GUIDE.md)

2. **เข้าสู่ระบบ**: 
   - **Admin**: `admin@school.local` / `admin123` (เปลี่ยนรหัสผ่านในระบบจริง!)
   - **Google OAuth**: ยืนยันตัวตนด้วยบัญชี Google (เฉพาะผู้ดูแลระบบ/ครู)

3. **ตั้งค่าตาราง**:
   - เลือกปีการศึกษาและภาคเรียน
   - กำหนดจำนวนคาบต่อวัน
   - กำหนดระยะเวลาคาบเรียนและเวลาพัก
   - กำหนดวันเรียนในสัปดาห์

**English:**

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

### การสร้างตาราง | Creating Schedules

**ภาษาไทย:**

1. **มอบหมายความรับผิดชอบในการสอน**:
   - เลือกครู
   - เลือกชั้นเรียนที่สอน
   - กำหนดวิชาพร้อมจำนวนคาบต่อสัปดาห์

2. **ล็อกคาบเรียน** (ตัวเลือก):
   - สร้างช่วงเวลาคงที่สำหรับกิจกรรมทั้งโรงเรียน
   - กำหนดหลายชั้นเรียนให้กับช่วงเวลาเดียวกัน

3. **จัดตาราง**:
   - เลือกครูที่จะจัดตาราง
   - ลากวิชาไปยังช่วงเวลาที่ว่าง
   - ระบบแสดงความขัดแย้งโดยอัตโนมัติ
   - กำหนดห้องเรียนสำหรับแต่ละคาบ

**English:**

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

### การดูและนำออกข้อมูล | Viewing and Exporting

**ภาษาไทย:**

- เข้าถึงมุมมองสรุปจากแดชบอร์ด
- เลือกภาคเรียนที่จะดู
- นำออกเป็นรูปแบบ Excel หรือ PDF
- แชร์ลิงก์ออนไลน์กับครูและนักเรียน

**English:**

- Access summary views from the dashboard
- Select semester to view
- Export to Excel or PDF format
- Share online links with teachers and students

---

## 🧪 การทดสอบ | Testing

### Unit Tests

รันการทดสอบด้วย Jest | Run tests with Jest:

```bash
npm test
npm run test:watch
```

### E2E Tests

รันการทดสอบ E2E ด้วย Playwright | Run E2E tests with Playwright:

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

## 📁 โครงสร้างโปรเจค | Project Structure

```
school-timetable-senior-project/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes (เส้นทาง API)
│   │   ├── dashboard/         # Dashboard pages (หน้าแดชบอร์ด)
│   │   ├── management/        # Data management pages (หน้าจัดการข้อมูล)
│   │   ├── schedule/          # Scheduling pages (หน้าจัดตาราง)
│   │   └── signin/            # Authentication (การยืนยันตัวตน)
│   ├── components/            # React components (คอมโพเนนต์)
│   │   ├── elements/          # Reusable UI elements (องค์ประกอบ UI)
│   │   └── templates/         # Page templates (เทมเพลตหน้า)
│   ├── functions/             # Utility functions (ฟังก์ชันช่วยเหลือ)

│   ├── libs/                  # Third-party library configs (การตั้งค่าไลบรารี)
│   └── models/                # Data models and types (โมเดลข้อมูล)
├── prisma/
│   ├── schema.prisma          # Database schema (โครงสร้างฐานข้อมูล)
│   └── migrations/            # Database migrations (การย้ายข้อมูล)
├── database/
│   ├── er-diagram.mwb         # ER diagram (แผนภาพ ER)
│   └── *.sql                  # Database backups (สำรองฐานข้อมูล)
├── public/                    # Static assets (ไฟล์คงที่)
└── __test__/                  # Test files (ไฟล์ทดสอบ)
```

---

## 🔒 การยืนยันตัวตน | Authentication

### ภาษาไทย

ระบบใช้ NextAuth.js กับ Google OAuth สำหรับการยืนยันตัวตน:

- **ผู้ดูแลระบบ (Admin)**: เข้าถึงระบบได้เต็มรูปแบบรวมถึงฟีเจอร์การจัดการทั้งหมด
- **ครู (Teacher)**: สามารถดูตารางสอนของตนเองและตารางเรียนของนักเรียน
- **แขก/นักเรียน (Guest/Student)**: สามารถดูตารางโดยไม่ต้องยืนยันตัวตน

### English

The system uses NextAuth.js with Google OAuth for authentication:

- **Admin**: Full system access including all management features
- **Teacher**: Can view their teaching schedule and student timetables
- **Guest/Student**: Can view timetables without authentication

---

## 🎨 ส่วนติดต่อผู้ใช้ | User Interface

### ภาษาไทย

ระบบมีส่วนติดต่อที่ทันสมัยและตอบสนองที่ออกแบบเพื่อความง่ายในการใช้งาน:

- เลย์เอาต์ที่สะอาดและใช้งานง่ายด้วยคอมโพเนนต์ Material-UI
- ตารางที่มีรหัสสีเพื่อการมองเห็นที่ง่าย
- ฟังก์ชันลากและวางสำหรับการจัดตาราง
- การตรวจจับความขัดแย้งแบบเรียลไทม์พร้อมผลตอบรับทางภาพ
- ออกแบบให้ตอบสนองสำหรับการดูตารางบนอุปกรณ์ใดก็ได้

### English

The system features a modern, responsive interface designed for ease of use:

- Clean, intuitive layout with Material-UI components
- Color-coded schedules for easy visualization
- Drag-and-drop functionality for scheduling
- Real-time conflict detection with visual feedback
- Mobile-responsive design for viewing schedules on any device

---

## 📊 ผลการประเมิน | Evaluation Results

### ภาษาไทย

ผลการสำรวจความพึงพอใจของผู้ใช้ (ผู้ตอบ 25 คน: ครู 20 คน นักเรียน 5 คน):

- **ความพึงพอใจโดยรวม**: 4.53/5.00
- **การจัดการข้อมูล**: 4.49/5.00
- **การสรุปรายงาน**: 4.54/5.00
- **การออกแบบส่วนติดต่อผู้ใช้**: 4.56/5.00
- **ประโยชน์**: 4.61/5.00

**ผลสำคัญ:**

- ✅ ลดเวลาที่ใช้ในการสร้างตาราง
- ✅ ทำให้การจัดการตารางสะดวกสบายขึ้น
- ✅ ให้ภาพรวมที่ชัดเจนของหลักสูตรและตาราง
- ✅ เข้าใจและใช้งานง่าย

### English

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

## 🚧 ข้อจำกัดที่ทราบ | Known Limitations

### ภาษาไทย

1. ต้องการการเชื่อมต่ออินเทอร์เน็ตสำหรับการใช้งานเต็มรูปแบบ
2. เหมาะสมที่สุดสำหรับการใช้งานบนคอมพิวเตอร์และแท็บเล็ต (ฟีเจอร์การจัดตาราง)
3. รองรับการใช้งานโรงเรียนเดียวในปัจจุบัน
4. ไม่มีอัลกอริทึมการสร้างตารางอัตโนมัติ

### English

1. Requires internet connection for full functionality
2. Optimized for desktop and tablet use (scheduling features)
3. Currently supports single-school deployment
4. Does not include automatic schedule generation algorithm

---

## 🔮 การพัฒนาในอนาคต | Future Enhancements

### ภาษาไทย

1. **การจัดตารางอัตโนมัติด้วย AI**: พัฒนาอัลกอริทึมเพื่อแนะนำตารางที่เหมาะสมที่สุด
2. **แอปพลิเคชันมือถือ**: แอปพลิเคชันสำหรับ iOS และ Android
3. **รองรับหลายโรงเรียน**: ทำให้ระบบสามารถจัดการหลายโรงเรียนจากอินสแตนซ์เดียว
4. **การวิเคราะห์ขั้นสูง**: วิเคราะห์ภาระงานของครูและข้อมูลเชิงลึกการเพิ่มประสิทธิภาพตาราง
5. **การเชื่อมต่อ**: เชื่อมต่อกับระบบจัดการโรงเรียนและระบบข้อมูลนักเรียน
6. **การแจ้งเตือน**: การแจ้งเตือนแบบพุชสำหรับการเปลี่ยนแปลงตาราง
7. **โหมดออฟไลน์**: ฟังก์ชันจำกัดเมื่อไม่มีอินเทอร์เน็ต

### English

1. **AI-Powered Auto-Scheduling**: Implement algorithm to suggest optimal schedules
2. **Mobile App**: Native mobile applications for iOS and Android
3. **Multi-School Support**: Enable system to manage multiple schools from one instance
4. **Advanced Analytics**: Teacher workload analysis and schedule optimization insights
5. **Integration**: Connect with school management systems and student information systems
6. **Notifications**: Push notifications for schedule changes
7. **Offline Mode**: Limited functionality when internet is unavailable

---

## 📄 สิทธิ์การใช้งาน | License

### ภาษาไทย

โครงการนี้พัฒนาขึ้นเป็นโครงงานปริญญานิพนธ์ที่สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง

ลิขสิทธิ์ © 2567 คณะเทคโนโลยีสารสนเทศ สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง

### English

This project was developed as a senior project at King Mongkut's Institute of Technology Ladkrabang.

Copyright © 2024 School of Information Technology, KMITL

---

## 🤝 กิตติกรรมประกาศ | Acknowledgments

### ภาษาไทย

ขอขอบคุณเป็นพิเศษ:

- **โรงเรียนพระซองสามัคคีวิทยา** สำหรับการให้ข้อมูลเชิงลึกจากการใช้งานจริงและข้อเสนอแนะจากการทดสอบ
- **คุณนงค์รักษ์ พ่อบุตรดี** (ครู) สำหรับการสัมภาษณ์และการรวบรวมความต้องการ
- **คณะเทคโนโลยีสารสนเทศ สจล.** สำหรับสิ่งอำนวยความสะดวกและการสนับสนุน
- อาจารย์ที่ปรึกษาสำหรับคำแนะนำตลอดโครงการ

### English

Special thanks to:

- **Prasong Sammakee Wittaya School** for providing real-world insights and testing feedback
- **Khun Nongrak Phobutdee** (Teacher) for interviews and requirement gathering
- **Faculty of Information Technology, KMITL** for facilities and support
- Our advisors for guidance throughout the project

---

## 📞 ติดต่อ | Contact

### สำหรับคำถามหรือการสนับสนุน | For questions or support:

**นายณภัทร พ่อบุตรดี | Napat Phobutdee**
- Email: 63070046@kmitl.ac.th

**นายณัฐพล วังคำ | Natapon Wangkham**
- Email: nataponball@hotmail.com

---

**พัฒนาด้วย ❤️ ที่ สจล. | Developed with ❤️ at KMITL**
