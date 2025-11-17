# SCHOOL TIMETABLE MANAGEMENT SYSTEM – Short Summary

- PDF: Senior project thesis "SCHOOL TIMETABLE MANAGEMENT SYSTEM" by Napat Phobutdee (63070046) and Natapon Wangkham (63070056), B.Sc. in IT, KMITL, semester 2/2023.
- Problem: Manual timetable creation in schools is slow, complex, and error‑prone (teacher/room/time conflicts, overlapping or missing classes, high admin workload, hard to adjust when changes occur).
- Goal: Build a web‑based system that can generate school timetables automatically with conflict checking, while still allowing manual adjustments.
- Main features: manage master data (teachers, rooms, subjects, periods, semesters), define constraints, auto‑generate timetables, detect conflicts (room, teacher, subject, time slot), edit timetables, and provide role‑based views for admin/teachers/students.
- Architecture: standard web app with UI layer, scheduling/business logic layer, and database layer for timetable data and related entities; includes diagrams and UI designs in the thesis.
- Implementation notes: built as a Node/Next.js‑style project that can be installed with dependency install + build + start commands and accessed via `http://localhost:3000`.
- Benefits: reduces time and effort to produce each semester’s timetable, lowers scheduling errors, helps visualize teacher loads and room usage, and gives users (especially staff) faster access to up‑to‑date schedules.
- Relevance to this repo: describes the original concept and requirements of the timetable system that the current Next.js 16 + Prisma project is implementing; keep focus on conflict‑free scheduling, role‑based views, and Thai school workflows when extending the system.