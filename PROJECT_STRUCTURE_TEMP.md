# Phrasongsa Timetable - Project Structure Overview

## package.json

```json
{
  "name": "school-timetable",
  "version": "2.0.0",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@10.0.0",
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.1",
    "@mui/material": "^7.3.6",
    "@mui/x-data-grid": "^8.22.1",
    "@prisma/client": "^7.2.0",
    "@react-pdf/renderer": "^4.3.1",
    "better-auth": "^1.4.7",
    "exceljs": "^4.4.0",
    "next": "16.1.0",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "recharts": "^3.6.0",
    "swr": "^2.3.8",
    "valibot": "^1.2.0",
    "zustand": "^5.0.9"
  }
}
```

---

## next.config.mjs

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.googleusercontent.com" },
    ],
  },
};
export default nextConfig;
```

---

## src/app Route Tree

```
src/app/
├── (public)/                          # Public routes (no auth)
│   ├── page.tsx                       # Homepage
│   ├── classes/[gradeId]/[semesterAndyear]/
│   ├── teachers/[id]/[semesterAndyear]/
│   └── _components/
├── api/
│   ├── auth/[...all]/
│   ├── export/teacher-timetable/pdf/
│   ├── export/student-timetable/pdf/
│   ├── health/db/
│   └── admin/seed-semesters/
├── dashboard/
│   ├── profile/
│   └── [semesterAndyear]/
│       ├── all-program/
│       ├── all-timeslot/
│       ├── analytics/
│       ├── conflicts/
│       ├── student-table/
│       └── teacher-table/
├── management/
│   ├── email-outbox/
│   ├── gradelevel/
│   ├── program/[year]/
│   ├── room/
│   ├── subject/
│   └── teacher/
├── schedule/
│   └── [semesterAndyear]/
│       ├── arrange/                   # <<< Timetable Editor
│       ├── config/
│       └── lock/
└── signin/
```

---

## Representative Public Route: Homepage

**File:** `src/app/(public)/page.tsx`

```tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { QuickStatsCards } from "./_components/QuickStats";
import { DataTableSection } from "./_components/DataTableSection";
import { AnimatedHeroBackground } from "./_components/AnimatedHeroBackground";

export const metadata: Metadata = {
  title: "ระบบตารางเรียนตารางสอน - หน้าแรก",
  description: "ดูตารางเรียนตารางสอนของครูและนักเรียน...",
};

export default async function HomePage() {
  const { getTeacherCount, getPaginatedTeachers } =
    await import("@/lib/public/teachers");
  const { getClassCount, getPaginatedClasses } =
    await import("@/lib/public/classes");

  // Fetch all data for client-side filtering
  const totalTeachers = await getTeacherCount();
  const teachersData = await getPaginatedTeachers({
    page: 1,
    perPage: totalTeachers,
  });
  // ... similar for classes

  return (
    <main className="min-h-screen bg-slate-50/50">
      <section className="relative overflow-hidden min-h-[500px]">
        <AnimatedHeroBackground />
        {/* Hero content... */}
      </section>
      <Suspense fallback={<QuickStatsCardsSkeleton />}>
        <QuickStatsCards />
      </Suspense>
      <DataTableSection teachersData={teachersData} classesData={classesData} />
    </main>
  );
}
```

---

## Timetable Editor Route

**File:** `src/app/schedule/[semesterAndyear]/arrange/page.tsx`

```tsx
"use client";

import { useParams, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useSemesterSync } from "@/hooks";

// Components
import {
  ArrangementHeader,
  GradeLevelTabs,
  SearchableSubjectPalette,
  TimetableGrid,
  RoomSelectionDialog,
} from "./_components";

// Server Actions
import { getTeacherScheduleAction, syncTeacherScheduleAction } from "@/features/arrange/application/actions";
import { checkTeacherConflictAction, checkRoomConflictAction } from "@/features/conflict/application/actions";
import { getTeachersAction } from "@/features/teacher/application/actions";

// Zustand Store
import { useArrangementUIStore } from "@/features/schedule-arrangement/presentation/stores";

export default function ArrangementPage() {
  const params = useParams();
  const { semester, academicYear } = useSemesterSync(params.semesterAndyear);

  // Data fetching with SWR
  const { data: allTeachers } = useSWR("teachers", () => getTeachersAction({}));
  const { data: teacherSchedule, mutate } = useSWR(
    `teacher-schedule-${currentTeacherID}`,
    () => getTeacherScheduleAction({ TeacherID: parseInt(currentTeacherID) })
  );

  // @dnd-kit drag & drop handlers
  const handleDragEnd = (event: DragEndEvent) => {
    // 1. Validate timeslot not break/locked
    // 2. Check teacher conflict
    // 3. Open room selection dialog
    // 4. Check room conflict
    // 5. Create schedule entry
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <ArrangementHeader teachers={allTeachers} onTeacherChange={...} />
      <GradeLevelTabs currentTab={currentTab} />
      <SearchableSubjectPalette subjects={availableSubjects} />
      <TimetableGrid schedule={teacherSchedule} timeslots={timeslots} />
      <RoomSelectionDialog open={roomDialogOpen} rooms={availableRooms} />
    </DndContext>
  );
}
```

---

## Key Architecture Patterns

1. **App Router (Next.js 16)** - File-based routing with `[param]` dynamic segments
2. **Server Actions** - Data mutations via `"use server"` functions in `/features/*/application/actions/`
3. **Feature-First Structure** - Domain logic in `/src/features/<domain>/`
4. **Zustand + SWR** - Client state management with SWR for data fetching
5. **@dnd-kit** - Drag & drop for timetable arrangement
6. **MUI v7** - Component library with custom theme
