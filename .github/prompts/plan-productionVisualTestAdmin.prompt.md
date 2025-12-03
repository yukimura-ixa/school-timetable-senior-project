# Visual Test Plan (Admin, Production)

Comprehensive visual testing workflow for the production deployment (`https://phrasongsa-timetable.vercel.app`) with admin authentication. Covers all pages, responsive viewports, and evidence capture.

## ✅ Implementation Status

| Item | Status | Notes |
|------|--------|-------|
| `playwright.config.prod.ts` | ✅ Done | Multi-viewport projects (desktop/tablet/mobile) |
| `public-pages-visual.spec.ts` | ✅ Done | 12 tests for public pages across viewports |
| npm scripts | ✅ Done | `test:prod:visual`, `test:prod:visual:ui`, `test:prod:visual:public`, `test:prod:visual:admin` |
| `.env.production.local.example` | ✅ Done | Template with all required env vars |

---

## Pre-Flight Checklist

- [ ] Production URL: `https://phrasongsa-timetable.vercel.app`
- [ ] Admin test account credentials ready (email/password)
- [ ] Expected semester/year context: `1-2567`
- [ ] Viewports configured:
  - Desktop: `1440×900`
  - Tablet: `768×1024` (iPad Pro)
  - Mobile: `390×844` (iPhone 14)

---

## Quick Start

```powershell
# 1. Set environment variables (PowerShell)
$env:BASE_URL = "https://phrasongsa-timetable.vercel.app"
$env:ADMIN_EMAIL = "admin@school.local"
$env:ADMIN_PASSWORD = "admin123"
$env:SEMESTER_ID = "1-2567"
$env:SKIP_WEBSERVER = "true"

# 2. Run all visual tests (all viewports)
pnpm test:prod:visual

# 3. Run with UI mode for debugging
pnpm test:prod:visual:ui

# 4. Run public pages only (no auth needed)
pnpm test:prod:visual:public

# 5. Run admin pages only (desktop)
pnpm test:prod:visual:admin

# 6. Run specific viewport
pnpm exec playwright test -c playwright.config.prod.ts --project=mobile-admin
pnpm exec playwright test -c playwright.config.prod.ts --project=tablet-admin
```

---

## Evidence Capture Strategy

### Screenshot Output Structure

```
test-results/prod-visual/
├── desktop/
│   ├── 01-dashboard-all-timeslot.png
│   ├── 02-dashboard-teacher-table.png
│   └── ...
├── tablet/
│   └── ...
└── mobile/
    └── ...
```

### Metadata Recorded

- **Browser**: Chromium (via Playwright)
- **Viewport**: desktop (1440×900) / tablet (768×1024) / mobile (390×844)
- **Timestamp**: File modification time
- **Console errors**: Logged to terminal summary

---

## Viewport Projects Configuration

| Project Name | Viewport | Auth | Test Match |
|-------------|----------|------|------------|
| `desktop-admin` | 1440×900 | Yes | `admin-*.spec.ts`, `smoke/**` |
| `tablet-admin` | 768×1024 | Yes | `admin-*.spec.ts` |
| `mobile-admin` | 390×844 | Yes | `admin-*.spec.ts` |
| `public-desktop` | 1440×900 | No | `public-*.spec.ts` |
| `public-tablet` | 768×1024 | No | `public-*.spec.ts` |
| `public-mobile` | 390×844 | No | `public-*.spec.ts` |

---

## Test Coverage

### Admin Pages (8 existing tests in `admin-production-visual.spec.ts`)

| # | Page | Route |
|---|------|-------|
| 00 | Auth guard | `/api/auth/get-session` |
| 01 | Dashboard overview | `/dashboard/{semester}/all-timeslot` |
| 02 | Teacher table | `/dashboard/{semester}/teacher-table` |
| 03 | Student table | `/dashboard/{semester}/student-table` |
| 04 | Config page | `/schedule/{semester}/config` |
| 05 | Teacher arrange | `/schedule/{semester}/arrange/teacher-arrange` |
| 06 | Lock overview | `/schedule/{semester}/lock` |
| 07 | Export page | `/dashboard/{semester}/all-program` |
| 08 | Management teachers | `/management/teacher` |

### Public Pages (12 new tests in `public-pages-visual.spec.ts`)

| # | Page | Route | All Viewports |
|---|------|-------|---------------|
| 01-02 | Home page | `/` | ✅ |
| 03-05 | Teacher schedule | `/teachers/[id]/[semester]` | ✅ |
| 06-08 | Class schedule | `/classes/[gradeId]/[semester]` | ✅ |
| 09-10 | Navigation & console errors | Various | ✅ |
| 11-12 | Visual consistency | Header/footer | ✅ |

---

## Visual Test Checklist

### 1. Auth & Session
- [ ] Sign-in page loads
- [ ] Credential login works
- [ ] Session persists on refresh
- [ ] Logout clears session
- [ ] Protected routes deny guest access

### 2. Dashboard & Timetable Views
- [ ] Dashboard widgets load without errors
- [ ] Teacher table renders grid
- [ ] Student table renders grid
- [ ] Filter/search works
- [ ] Conflict indicators visible

### 3. CRUD Flows (Admin)
- [ ] Create entry with success toast
- [ ] Edit entry with pre-filled form
- [ ] Delete entry with confirm dialog
- [ ] Conflict validation blocks invalid saves

### 4. Export Functions
- [ ] Excel export downloads
- [ ] PDF export generates
- [ ] Filename correct

### 5. Mobile Responsiveness
- [ ] Nav collapses to drawer
- [ ] Timetable scrolls horizontally
- [ ] Dialogs fit viewport
- [ ] Touch targets adequate (44×44px)

### 6. Accessibility Quick Pass
- [ ] Tab order logical
- [ ] Focus outlines visible
- [ ] Form labels associated
- [ ] Button contrast adequate

---

## Gaps to Address (Future)

| Page | Status | Notes |
|------|--------|-------|
| `/management/subject` | ❌ | Add to admin tests |
| `/management/program` | ❌ | Add to admin tests |
| `/management/rooms` | ❌ | Add to admin tests |
| `/management/gradelevel` | ❌ | Add to admin tests |
| `/dashboard/analytics` | ❌ | Add to admin tests |
| `/dashboard/{semester}/conflicts` | ❌ | Add to admin tests |
| `/schedule/{semester}/arrange/student-arrange` | ❌ | Add to admin tests |

---

## Production Data Setup (Manual via Admin UI)

### Problem: Empty Teacher Schedules

Production database has semesters and timeslots but **NO schedule data**:
- No teachers, subjects, rooms, grade levels
- No teacher responsibilities (`teachers_responsibility`)
- No class schedules (`class_schedule`)

This causes the visual test "teacher schedule shows timetable grid" to fail - pages show "ไม่มีตารางสอนในภาคเรียนนี้" (No timetable for this semester).

### Solution: Populate Data via Admin UI

**Admin Credentials:**
- URL: `https://phrasongsa-timetable.vercel.app/signin`
- Email: `admin@school.local`
- Password: `admin123`

### Data Creation Order (Foreign Key Dependencies)

Follow this exact order to avoid constraint violations:

#### Step 1: Login
1. Go to `/signin`
2. Enter `admin@school.local` and `admin123`
3. Click "เข้าสู่ระบบ"

#### Step 2: Create Programs (หลักสูตร)
**URL:** `/management/program`

Create at least one program:
| Field | Example Value |
|-------|---------------|
| ProgramCode | `M1-SCI` |
| ProgramName | `หลักสูตรวิทย์-คณิต ม.1` |
| Track | `วิทย์-คณิต` |

#### Step 3: Create Subjects (วิชา)
**URL:** `/management/subject`

Create at least 2-3 subjects:
| Field | Example Value |
|-------|---------------|
| SubjectCode | `TH101` |
| SubjectName | `ภาษาไทย 1` |
| Credit | `1.5 หน่วยกิต` |
| Category | `พื้นฐาน` |
| LearningArea | `ภาษาไทย` |

Sample subjects:
- `TH101` - ภาษาไทย 1 (1.5 cr)
- `MA101` - คณิตศาสตร์ 1 (1.5 cr)
- `EN101` - ภาษาอังกฤษ 1 (1.0 cr)

#### Step 4: Create Rooms (ห้องเรียน)
**URL:** `/management/rooms`

Create at least 2 rooms:
| Field | Example Value |
|-------|---------------|
| RoomName | `ห้อง 111` |
| Building | `อาคาร 1` |
| Floor | `ชั้น 1` |

#### Step 5: Create Teachers (ครู)
**URL:** `/management/teacher`

Create at least 2-3 teachers:
| Field | Example Value |
|-------|---------------|
| Prefix | `นาย` |
| Firstname | `สมชาย` |
| Lastname | `ใจดี` |
| Department | `ภาษาไทย` |
| Email | `teacher1@school.ac.th` |

#### Step 6: Create Grade Levels (ระดับชั้น)
**URL:** `/management/gradelevel`

Create at least 1-2 grades:
| Field | Example Value |
|-------|---------------|
| GradeID | `M1-1` |
| Year | `1` (ม.1) |
| Number | `1` (ห้อง 1) |
| Program | Select from Step 2 |
| StudentCount | `35` |

#### Step 7: Assign Subjects to Teachers
**URL:** `/schedule/1-2567/assign`

For each grade level:
1. Click "+ มอบหมายวิชา"
2. Select Grade, Subject, Teacher
3. Set NumberOfHours (must equal subject credits)
4. Save

This creates `teachers_responsibility` records.

#### Step 8: Arrange Schedule (Drag-and-Drop)
**URL:** `/schedule/1-2567/arrange/student-arrange`

1. Select a grade from the left sidebar
2. Drag subjects from the palette to timeslot cells
3. Select room when prompted
4. Save creates `class_schedule` records

### Minimum Viable Data Set for Visual Testing

To pass the visual test "teacher schedule shows timetable grid":

| Entity | Minimum Count |
|--------|---------------|
| Programs | 1 |
| Subjects | 3 |
| Rooms | 2 |
| Teachers | 2 |
| Grade Levels | 1 |
| Teacher Responsibilities | 3 |
| Class Schedules | 5-10 |

### Verification

After populating data:
1. Visit `/teachers/[teacherId]/1-2567` (public page)
2. Should see timetable grid instead of "ไม่มีตารางสอนในภาคเรียนนี้"
3. Re-run visual tests: `pnpm test:prod:visual:public`

---

## Troubleshooting

### Auth Fails
```powershell
# Verify credentials work manually
$env:ADMIN_EMAIL = "your-email"
$env:ADMIN_PASSWORD = "your-password"
pnpm exec playwright test -c playwright.config.prod.ts e2e/auth.setup.ts --headed
```

### Screenshots Not Saving
```powershell
# Check output directory exists
mkdir -p test-results/prod-visual/desktop
mkdir -p test-results/prod-visual/tablet
mkdir -p test-results/prod-visual/mobile
```

### Timeout Issues
```powershell
# Increase timeout for slow connections
$env:PLAYWRIGHT_TIMEOUT = "60000"
```

### Empty Schedule Data
```powershell
# Check if production has teachers
# Visit: https://phrasongsa-timetable.vercel.app/
# If teachers list is empty, follow "Production Data Setup" section above
```
