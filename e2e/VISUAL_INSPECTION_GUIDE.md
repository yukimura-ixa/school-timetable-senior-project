# Visual Inspection Guide - Admin User

## 🎯 What We're Inspecting

### Test IDs We Added (Session 2)

These should have **green outlines** in the browser:

1. **`data-testid="teacher-selector"`**
   - Location: SelectTeacher dropdown
   - File: `src/app/schedule/[academicYear]/[semester]/arrange/component/SelectTeacher.tsx`
   - Function: Select teacher to arrange schedule for

2. **`data-testid="subject-list"`**
   - Location: SearchableSubjectPalette component
   - File: `src/app/schedule/[academicYear]/[semester]/arrange/page.tsx` (line 1307)
   - Function: List of subjects to drag to timeslots

3. **`data-testid="timeslot-grid"`**
   - Location: TimeSlot grid component
   - File: `src/app/schedule/[academicYear]/[semester]/arrange/page.tsx` (line 1363)
   - Function: Weekly timetable grid (MON-FRI, periods 1-8)

4. **`data-testid="save-button"`**
   - Location: PrimaryButton for saving
   - File: `src/app/schedule/[academicYear]/[semester]/arrange/page.tsx` (line 1354)
   - Function: Save schedule changes

---

## 📋 Pages to Inspect

### 1. Home Page (`/`)

**What to check**:

- Sign-in button visible
- Layout responsive
- Thai language UI
- No console errors

### 2. Dashboard (`/dashboard`)

**What to check**:

- Semester selector works (1-2567, 2-2567, 1-2568)
- Navigation menu visible
- User info displayed
- No layout issues

### 3. Teacher Management (`/management/teacher`)

**What to check**:

- Teacher list loads
- Search functionality works
- Add/Edit buttons visible
- Pagination works
- Thai names display correctly

### 4. Subject Management (`/management/subject`)

**What to check**:

- Subject codes (TH21101, TH22101, etc.)
- Credit hours displayed
- Subject groups correct
- CRUD operations work

### 5. Schedule Configuration (`/schedule/2567/1/config`)

**What to check**:

- Timeslot configuration
- Period setup (1-8)
- Break time configuration
- Copy from previous semester

### 6. Teacher Arrangement (`/schedule/2567/1/arrange`)

**⭐ MAIN INSPECTION AREA** - This is where we added test IDs!

**What to check**:

- ✅ **Teacher selector** has green outline
- ✅ **Subject list** has green outline
- ✅ **Timeslot grid** has green outline
- ✅ **Save button** has green outline
- Drag-and-drop works (drag subject to grid)
- Teacher selection updates subject list
- Conflicts show when detected
- Save button enables/disables correctly
- Zustand store updates properly

**Test the workflow**:

1. Select a teacher (e.g., "นาย สมชาย สมบูรณ์")
2. See subjects appear in subject list
3. Drag a subject (e.g., "คณิตศาสตร์ 1") to Monday Period 1
4. Check if assignment appears in grid
5. Click Save button
6. Verify data persists (refresh page)

### 7. Analytics Dashboard (`/dashboard/analytics`)

**What to check**:

- Charts render (Recharts)
- Data loads correctly
- Filters work
- No visual glitches

---

## 🔍 Browser DevTools Checks

### Console Tab

Look for:

- ❌ Red errors (fix these!)
- ⚠️ Yellow warnings (nice to fix)
- Console.log messages (helpful for debugging)

### Network Tab

Check:

- API calls succeed (200 status)
- No 404s for resources
- Response times reasonable
- Database queries efficient

### React DevTools (if installed)

Check:

- Component tree structure
- Props passing correctly
- State updates properly
- No unnecessary re-renders

### Next.js DevTools

Check:

- Server/Client component boundaries
- Hydration issues
- Caching behavior
- Route prefetching

---

## 🎨 Visual Quality Checks

### Layout

- No overlapping elements
- Proper spacing/padding
- Responsive design works
- Mobile view acceptable

### Typography

- Thai fonts render correctly
- Text readable (size, contrast)
- No text overflow
- Proper line heights

### Colors

- Consistent color scheme
- Good contrast ratios
- Hover states work
- Focus indicators visible

### Interactions

- Buttons respond to clicks
- Forms validate input
- Loading states show
- Error messages clear

---

## 🐛 Known Issues to Watch For

### Test IDs

- ❌ Some components still missing test IDs (ScheduleActionToolbar, conflict indicators)
- ✅ 4 main components have test IDs (teacher-selector, subject-list, timeslot-grid, save-button)

### Authentication

- Manual sign-in required (admin@school.local / admin123)
- Google OAuth needs setup for production
- Session persistence works

### Drag-and-Drop

- @dnd-kit library used
- May have performance issues with large datasets
- Check smooth animations

### State Management

- Zustand stores used (teacher-arrange.store.ts)
- Check state updates reflect in UI
- Verify no stale data

---

## 📸 Screenshots to Capture

Automatic screenshots saved to `test-results/screenshots/`:

- `admin-teacher-management.png`
- `admin-subject-management.png`
- `admin-schedule-config.png`
- `admin-teacher-arrange.png` ⭐ MOST IMPORTANT
- `admin-analytics.png`

---

## ✅ Success Criteria

After inspection, you should confirm:

1. ✅ All 4 test IDs visible with green outlines
2. ✅ Teacher selection works
3. ✅ Subject list updates when teacher changes
4. ✅ Drag-and-drop works smoothly
5. ✅ Save button functions
6. ✅ No console errors
7. ✅ Layout looks good
8. ✅ Thai text renders correctly

---

## 🚀 Next Steps After Inspection

If everything looks good:

- ✅ Test IDs confirmed working
- ✅ Ready to write more E2E tests
- ✅ Can add remaining test IDs (ScheduleActionToolbar, etc.)

If issues found:

- 🐛 Document bugs
- 🔧 Fix critical issues
- 📝 Create GitHub issues for non-critical items

---

## 💡 Tips

- **Keep browser DevTools open** (F12)
- **Check both Console and Network tabs** frequently
- **Try different browsers** (Chrome, Edge, Firefox)
- **Test mobile responsive** (DevTools device mode)
- **Look for performance issues** (React DevTools Profiler)
- **Verify accessibility** (Lighthouse audit)

Happy inspecting! 🔍✨

