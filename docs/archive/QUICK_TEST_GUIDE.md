# Quick Test Guide: "จัดตารางสอน" Button Fix

## 🎯 What We Fixed

The "จัดตารางสอน" (Arrange Timetable) sidebar button was redirecting to `/dashboard/select-semester` instead of staying on the schedule page with the current semester.

---

## ✅ Quick Test Steps

### Test 1: Main Fix (2 minutes)

```
1. Open: http://localhost:3000/schedule/1-2567/arrange
2. Look at left sidebar
3. Find "จัดตารางสอน" button
4. Click it
5. Check URL bar - should show: /schedule/1-2567/arrange
```

**✅ PASS:** URL stays on schedule page with semester 1-2567  
**❌ FAIL:** URL goes to /dashboard/select-semester

---

### Test 2: Homepage Role Display (30 seconds)

```
1. Open: http://localhost:3000
2. Look at top-right corner admin button
3. Check text under admin name
```

**✅ PASS:** Shows "ผู้ดูแลระบบ" (Administrator)  
**❌ FAIL:** Shows "นักเรียน" (Student) or blank

---

## 🔍 What Changed

### Before:

```
Click "จัดตารางสอน" → Always goes to /dashboard/select-semester
```

### After:

```
Click "จัดตารางสอน" → Goes to /schedule/{current-semester}/arrange
```

---

## 📝 Expected Results

| Starting Page              | Click Button | Expected URL                               |
| -------------------------- | ------------ | ------------------------------------------ |
| `/schedule/1-2567/arrange` | จัดตารางสอน  | `/schedule/1-2567/arrange` |
| `/schedule/2-2567/arrange` | จัดตารางสอน  | `/schedule/2-2567/arrange` |
| `/management/teacher`      | จัดตารางสอน  | `/dashboard/select-semester`               |

---

## 🚨 If Something Goes Wrong

1. **Refresh page:** Press `Ctrl + F5` (hard refresh)
2. **Check dev server:** Make sure `pnpm dev` is running
3. **Check console:** Press `F12` → Console tab → Look for errors
4. **Report:** Note the error message and current URL

---

## 💡 Technical Notes

The fix works by:

1. Detecting semester in URL (e.g., "1-2567")
2. Building dynamic link: `/schedule/{semester}/arrange`
3. Falling back to `/dashboard/select-semester` if no semester found

---

**Full test documentation:** See `docs/REDIRECT_FIX_TEST_RESULTS.md`

