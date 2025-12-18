# Automation Candidates – 2025-12-18

Prioritized by risk ↔ effort (highest first).

1) **Auth invalid credentials** – Assert Thai error message renders and no redirect; ensure console free of form-structure warnings.  
2) **Auth happy path (admin)** – Login redirects to dashboard; assert no React console errors (#418 regression) and session persists after reload.  
3) **Logout** – Header “ออกจากระบบ” clears session, returns to `/signin`, and subsequent `/dashboard` access requires re-login.  
3) **Public teacher list pagination/search** – Verify pagination controls advance pages and search filters rows deterministically.  
4) **Teacher schedule deep-link** – Opening `/teachers/{id}/{config}` loads without auth prompt and shows timetable grid.  
5) **Landing CTA integrity** – “Admin Login” goes to `/signin`; “ดูตารางสอนตัวอย่าง” routes to sample schedule and returns.  
6) **Visual snapshot: landing hero + stats tiles** – Detect regressions in counts/labels/layout.  
7) **Visual snapshot: signin form** – Catch layout/font/icon regressions and missing alert styling.  
8) **Accessibility smoke: signin form** – Keyboard-only submit, focus order, Enter-key submission (paired with form-container fix).  
9) **Dashboard visual snapshot** – Ensure hydration-affected areas render consistently (target the top “เลือกปีการศึกษาและภาคเรียน” section).  
10) **Arrange page load & teacher selector** – Navigate to `/schedule/1-2568/arrange`, ensure loader clears, teacher dropdown populated, and “บันทึกตารางสอน” disabled until selection.  
