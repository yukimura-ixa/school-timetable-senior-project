# Phrasongsa Timetable — Feature Map & Architecture Overview

> Next.js 16 (App Router, React 19 + reactCompiler) · Prisma 7 (pg adapter) · Postgres · Valibot · MUI + Tailwind · Vitest/Playwright. Thai secondary-school timetabling with MOE compliance. Feature-sliced architecture.

---

## 1. Feature Map (by domain area)

```mermaid
flowchart TB
  subgraph MASTER["🗂️ Master Data / Setup"]
    gradelevel["gradelevel<br/><i>M.1–M.6 sections</i>"]
    subject["subject<br/><i>MOE subject codes</i>"]
    room["room<br/><i>buildings / rooms</i>"]
    teacher["teacher<br/><i>staff, departments</i>"]
    program["program<br/><i>tracks · program_subject</i>"]
    semester["semester<br/><i>academic year / term</i>"]
  end

  subgraph CONFIG["⚙️ Timetable Config"]
    config["config<br/><i>slots[] · Days · StartTime</i>"]
    timeslot["timeslot<br/><i>generate rows · breaks as real slots</i>"]
    schedwiz["schedule-wizard<br/><i>create-semester flow</i>"]
  end

  subgraph ASSIGN["🧑‍🏫 Teaching Assignment"]
    teachassign["teaching-assignment<br/><i>responsibilities (canonical)</i>"]
    teacherassign["teacher-assignment<br/><i>/management consolidation</i>"]
    assignLegacy["assign<br/><i>legacy /schedule route</i>"]
  end

  subgraph SCHED["📅 Scheduling Engine"]
    arrange["arrange<br/><i>drag-drop + auto solver</i>"]
    schedarr["schedule-arrangement<br/><i>grid orchestration</i>"]
    lock["lock<br/><i>locked activities</i>"]
    conflict["conflict<br/><i>teacher/room/grade clashes</i>"]
  end

  subgraph VIEW["👁️ Views & Output"]
    dashboard["dashboard<br/><i>student/teacher/all tables</i>"]
    classview["class<br/><i>public class schedules</i>"]
    analytics["analytics<br/><i>utilization metrics</i>"]
    export["export<br/><i>PDF/print timetables</i>"]
  end

  MASTER --> CONFIG
  MASTER --> ASSIGN
  CONFIG --> SCHED
  ASSIGN --> SCHED
  SCHED --> VIEW
  CONFIG --> VIEW

  classDef legacy fill:#fee,stroke:#c66,stroke-dasharray:4 3;
  class assignLegacy legacy;
```

Legacy/in-migration (dashed): `assign` routes under `/schedule/.../assign` are being consolidated into `/management/teacher-assignment` (beads epic i8z, redirect lyw, cleanup 7xb).

---

## 2. Layered Architecture (feature-sliced)

Each feature folder follows the same internal layering; the dependency rule points inward (presentation → application → domain; infrastructure implements domain ports).

```mermaid
flowchart TB
  subgraph CLIENT["Browser"]
    rsc["RSC pages / Client components<br/>(MUI + Tailwind)"]
  end

  subgraph APP["src/app — App Router"]
    routes["Route groups:<br/>(public) · dashboard · management · schedule · api"]
  end

  subgraph FEATURE["src/features/&lt;feature&gt;"]
    pres["presentation<br/><i>stores, components</i>"]
    appl["application<br/><i>server actions, schemas (valibot)</i>"]
    dom["domain<br/><i>models, services, pure logic</i>"]
    infra["infrastructure<br/><i>repositories (Prisma)</i>"]
  end

  subgraph DATA["Persistence"]
    prisma["Prisma 7 (pg adapter)"]
    pg[("Postgres")]
  end

  rsc --> routes
  routes --> appl
  routes --> pres
  pres --> appl
  appl --> dom
  appl --> infra
  infra --> dom
  infra --> prisma
  prisma --> pg
```

Shared/cross-cutting: `src/lib` (infrastructure repos, UI helpers like `break-rows`), `src/utils` (`break-utils`, `timeslot-id`), `src/components/schedule` (`TimeslotGrid`), `src/stores`, `src/hooks`, `src/shared`.

---

## 3. Route Map

```mermaid
flowchart LR
  root(("/"))

  subgraph PUB["(public) — no auth"]
    pclass["/classes/[gradeId]/[year]/[sem]"]
    pteach["/teachers/[id]/[year]/[sem]"]
  end

  subgraph DASH["/dashboard/[year]/[sem] — admin"]
    dstud["student-table"]
    dteach["teacher-table"]
    dall["all-timeslot · all-program"]
    danaly["analytics · conflicts"]
    dwiz["_components/CreateSemesterWizard"]
  end

  subgraph MGMT["/management — master data"]
    mg["gradelevel · subject · rooms"]
    mt["teacher · program · teacher-assignment"]
  end

  subgraph SCH["/schedule/[year]/[sem]"]
    sarr["arrange"]
    scfg["config · generate · curriculum"]
    slock["lock"]
    sassign["assign (legacy)"]
  end

  subgraph API["/api"]
    aSched["schedule/{auto-arrange,validate-drop,class,teacher}"]
    aCfg["schedule-config · timeslots"]
    aExp["export/{student,teacher}-timetable"]
    aMisc["rooms · teachers · gradelevels · health"]
  end

  root --> PUB
  root --> DASH
  root --> MGMT
  root --> SCH
  DASH -.calls.-> API
  SCH -.calls.-> API
  PUB -.reads.-> API
```

---

## 4. Core Data Flow — config → schedule → view

```mermaid
sequenceDiagram
  autonumber
  actor Admin
  participant Wizard as Create-Semester Wizard
  participant Cfg as config / table_config
  participant TS as timeslot.service
  participant Solver as arrange (solver/validate)
  participant CS as class_schedule
  participant View as Dashboard / Public grid

  Admin->>Wizard: set Days, StartTime, slots[] (+ break groups)
  Wizard->>Cfg: persist { Days, StartTime, slots }
  Cfg->>TS: generateTimeslots(slots[])
  TS-->>Cfg: one real timeslot per slot (breaks occupy rows)
  Admin->>Solver: drag class / auto-arrange
  Solver->>Solver: isBreakForGrade(slot) → skip a grade's break slots
  Solver->>CS: place placements (teacher/grade/room conflict-checked)
  View->>Cfg: read slots[] + break groups
  View->>CS: read placements
  View-->>Admin: grid — per-grade breaks vs teaching (2A staggered lunches)
```

---

## 5. Domain Model (key entities)

```mermaid
erDiagram
  table_config ||--o{ break_group : has
  break_group ||--o{ break_group_grade : maps
  gradelevel ||--o{ break_group_grade : member
  gradelevel ||--o{ class_schedule : scheduled
  timeslot ||--o{ class_schedule : at
  subject ||--o{ class_schedule : of
  room |o--o{ class_schedule : in
  teacher ||--o{ teachers_responsibility : holds
  gradelevel ||--o{ teachers_responsibility : for
  subject ||--o{ teachers_responsibility : of
  class_schedule }o--o{ teachers_responsibility : taught_by
  program ||--o{ gradelevel : tracks
  program ||--o{ program_subject : curriculum

  table_config {
    string ConfigID
    json Config "Days, StartTime, slots[]"
  }
  timeslot {
    string TimeslotID "sem-year-DAYn"
    enum Breaktime
  }
  class_schedule {
    string TimeslotID
    string GradeID
    bool IsLocked
  }
```

Phase 2A note: `table_config.Config.slots[]` (`{ duration, breakGroups? }`) replaced legacy `Duration`/`TimeslotPerDay`/`breakDefinitions`. Breaks are real `timeslot` rows; per-grade break-ness resolves via `break_group` / `break_group_grade`. A group's lunch slot is teaching-capable for other groups.
