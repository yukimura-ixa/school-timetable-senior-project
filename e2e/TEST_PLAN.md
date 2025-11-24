# E2E Test Plan for School Timetable Management System

## Overview

This document outlines comprehensive end-to-end test cases for the School Timetable Management System. Each test case validates critical user workflows and system capabilities.

## Test Environment

- **Framework**: Playwright
- **Browser**: Chromium
- **Base URL**: http://localhost:3000
- **Recording**: Videos and screenshots for each test case

## User Roles Tested

1. **Admin** - Full system access
2. **Teacher** - View schedules
3. **Student/Guest** - View schedules without authentication

---

## Test Cases

### 1. Authentication & Authorization

#### TC-001: Admin Login with Google OAuth

**Priority**: High
**Description**: Verify admin can sign in with Google account
**Prerequisites**:

- Valid Google account credentials
- User has admin role in system
  **Steps**:

1. Navigate to home page
2. Click "Sign In" button
3. Complete Google OAuth flow
4. Verify redirect to dashboard
   **Expected Result**:

- User successfully authenticated
- Dashboard displays with admin features
- User name/email visible in header

#### TC-002: Unauthorized Access Prevention

**Priority**: High
**Description**: Verify protected routes redirect unauthenticated users
**Steps**:

1. Navigate to management pages without authentication
2. Verify redirect to sign-in page
   **Expected Result**:

- Redirect to sign-in for protected routes
- Appropriate error message displayed

---

### 2. Data Management

#### TC-003: Teacher Management - CRUD Operations

**Priority**: High
**Description**: Verify complete teacher management workflow
**Prerequisites**: Admin authenticated
**Steps**:

1. Navigate to Management > Teachers
2. Add new teacher with required fields
3. Verify teacher appears in list
4. Edit teacher information
5. Delete teacher (if allowed)
   **Expected Result**:

- Teacher created successfully with confirmation
- Updated data persists
- Delete removes from list or shows constraint error

#### TC-004: Subject Management

**Priority**: High
**Description**: Manage subjects with codes, credits, and categories
**Prerequisites**: Admin authenticated
**Steps**:

1. Navigate to Management > Subjects
2. Create new subject with code, name, credits
3. Assign to program/grade level
4. Verify subject in list
   **Expected Result**:

- Subject created with all attributes
- Proper validation on required fields
- Subject available for assignment

#### TC-005: Room Management

**Priority**: High
**Description**: Manage classroom inventory
**Prerequisites**: Admin authenticated
**Steps**:

1. Navigate to Management > Rooms
2. Add room with building, floor, name
3. Verify room creation
   **Expected Result**:

- Room added successfully
- All attributes saved correctly

#### TC-006: Grade Level Management

**Priority**: Medium
**Description**: Manage grade levels and class sections
**Prerequisites**: Admin authenticated
**Steps**:

1. Navigate to Management > Grade Levels
2. Create grade level with year and number
3. Verify creation
   **Expected Result**:

- Grade level created
- Available for timetable assignment

---

### 3. Timetable Configuration

#### TC-007: Semester Configuration

**Priority**: High
**Description**: Set up timetable parameters for a semester
**Prerequisites**:

- Admin authenticated
- Basic data (teachers, subjects, rooms) exists
  **Steps**:

1. Navigate to Schedule > Select Semester
2. Choose or create semester (year/term)
3. Navigate to Configuration
4. Set periods per day
5. Set start time and period duration
6. Define break times
7. Configure school days (Mon-Fri, etc.)
8. Save configuration
   **Expected Result**:

- All parameters saved correctly
- Timeslots generated based on config
- Configuration retrievable

#### TC-008: Copy from Previous Semester

**Priority**: Medium
**Description**: Reuse previous semester's timetable
**Prerequisites**:

- Admin authenticated
- Previous semester data exists
  **Steps**:

1. Navigate to Configuration
2. Select "Copy from previous term"
3. Choose source semester
4. Confirm copy operation
5. Verify data copied
   **Expected Result**:

- Timetable structure copied
- Data adjusted for new semester
- No conflicts introduced

---

### 4. Subject Assignment

#### TC-009: Assign Subjects to Teachers

**Priority**: High
**Description**: Assign teaching responsibilities
**Prerequisites**:

- Admin authenticated
- Semester configured
- Teachers and subjects exist
  **Steps**:

1. Navigate to Schedule > Assign
2. Select teacher
3. Choose grade level and class
4. Select subject to assign
5. Set weekly lesson count (teaching hours)
6. Save assignment
7. Verify in teacher responsibility list
   **Expected Result**:

- Assignment created successfully
- Teaching hours recorded correctly
- Teacher can view assignment

---

### 5. Timetable Arrangement

#### TC-010: Drag-and-Drop Scheduling

**Priority**: High
**Description**: Arrange classes with drag-and-drop interface
**Prerequisites**:

- Admin authenticated
- Subjects assigned to teachers
- Timeslots configured
  **Steps**:

1. Navigate to Schedule > Arrange > Teacher
2. Select teacher to schedule
3. View available subjects (from assignments)
4. Drag subject to available timeslot
5. Select room for the period
6. Save placement
   **Expected Result**:

- Subject placed in timeslot
- Room assigned
- No conflict errors
- Visual confirmation of placement

#### TC-011: Conflict Detection - Teacher Double Booking

**Priority**: Critical
**Description**: System prevents teacher from being in two places at once
**Prerequisites**:

- Admin authenticated
- Teacher already has class in a timeslot
  **Steps**:

1. Navigate to Arrange interface
2. Attempt to assign same teacher to another class in same timeslot
3. Observe system response
   **Expected Result**:

- System blocks the placement
- Clear error message displayed
- Conflicting timeslot highlighted
- No invalid data saved

#### TC-012: Conflict Detection - Class Double Booking

**Priority**: Critical
**Description**: Prevent same class having multiple subjects simultaneously
**Prerequisites**:

- Admin authenticated
- Class already scheduled in timeslot
  **Steps**:

1. Select a class/grade
2. Attempt to place another subject in occupied timeslot
3. Verify prevention
   **Expected Result**:

- Placement prevented
- Conflict error shown
- Existing schedule preserved

#### TC-013: Conflict Detection - Room Availability

**Priority**: High
**Description**: Ensure room not double-booked
**Prerequisites**:

- Admin authenticated
- Room already assigned in timeslot
  **Steps**:

1. Attempt to assign occupied room to another class
2. Verify system blocks action
   **Expected Result**:

- Room conflict detected
- Error message with room details
- Suggest alternative rooms if available

#### TC-014: Student Timetable Arrangement

**Priority**: High
**Description**: Arrange timetable from student/class perspective
**Prerequisites**: Admin authenticated
**Steps**:

1. Navigate to Schedule > Arrange > Student
2. Select grade level and class
3. View current schedule
4. Arrange subjects per timeslot
5. Assign teachers and rooms
   **Expected Result**:

- Complete class schedule visible
- All assignments save correctly
- No conflicts introduced

---

### 6. Lock Timeslots

#### TC-015: Lock Timeslot for Multiple Classes

**Priority**: High
**Description**: Create fixed periods for school-wide activities
**Prerequisites**: Admin authenticated
**Steps**:

1. Navigate to Schedule > Lock Timeslots
2. Select timeslot (day/period)
3. Choose activity (e.g., "Assembly", "Scout Activity")
4. Select multiple classes participating
5. Optionally assign teachers
6. Lock the timeslot
7. Verify locked status in arrangement view
   **Expected Result**:

- Timeslot locked for selected classes
- Cannot be overridden in arrangement
- Visual indicator (lock icon) displayed
- Teachers notified if assigned

#### TC-016: Unlock and Modify Locked Timeslot

**Priority**: Medium
**Description**: Update locked timeslot
**Prerequisites**:

- Admin authenticated
- Locked timeslot exists
  **Steps**:

1. Navigate to Lock Timeslots
2. Find locked slot
3. Unlock or modify participants
4. Save changes
   **Expected Result**:

- Changes applied successfully
- Arrangement interface updated
- History preserved if required

---

### 7. Viewing & Reports

#### TC-017: View Teacher Schedule

**Priority**: High
**Description**: Teacher views personal timetable
**Prerequisites**:

- Teacher authenticated
- Schedule created for teacher
  **Steps**:

1. Sign in as teacher
2. Navigate to dashboard or teacher table
3. View weekly schedule
4. Verify all assigned classes displayed
5. Check room assignments visible
   **Expected Result**:

- Complete weekly timetable visible
- Correct classes, subjects, rooms shown
- Clear, readable format
- Breaks and free periods indicated

#### TC-018: View Student/Class Schedule

**Priority**: High
**Description**: View schedule for a specific class
**Prerequisites**: Schedule arranged for class
**Steps**:

1. Navigate to student timetable view
2. Select grade level and class number
3. View weekly schedule
   **Expected Result**:

- Full class schedule displayed
- Teachers and rooms shown for each period
- No authentication required (if public)
- Breaks clearly marked

#### TC-019: View All Teachers Summary

**Priority**: Medium
**Description**: View consolidated teacher schedule matrix
**Prerequisites**:

- Admin authenticated
- Multiple teacher schedules exist
  **Steps**:

1. Navigate to Dashboard > Teacher Table
2. Select semester
3. View summary table
4. Scroll through all teachers
   **Expected Result**:

- All teachers listed
- Teaching load visible
- Conflicts highlighted if any
- Exportable format

#### TC-020: Curriculum Overview

**Priority**: Medium
**Description**: View curriculum summary by grade
**Prerequisites**: Admin authenticated
**Steps**:

1. Navigate to Dashboard > All Programs
2. Select grade level
3. View subjects, credits, hours
   **Expected Result**:

- Complete curriculum displayed
- Credits and hours calculated correctly
- Required vs elective subjects distinguished

---

### 8. Export Functionality

#### TC-021: Export Teacher Schedule to Excel

**Priority**: High
**Description**: Generate and download teacher schedule as Excel file
**Prerequisites**:

- User authenticated (teacher or admin)
- Teacher has schedule
  **Steps**:

1. Navigate to teacher schedule view
2. Click "Export to Excel" button
3. Wait for file generation
4. Download file
5. Open and verify contents
   **Expected Result**:

- Excel file downloads successfully
- Contains complete timetable
- Formatted properly (days, periods, subjects, rooms)
- Readable and printable

#### TC-022: Export Teacher Schedule to PDF

**Priority**: High
**Description**: Generate PDF of teacher schedule
**Prerequisites**: Same as TC-021
**Steps**:

1. Navigate to teacher schedule
2. Click "Export to PDF" or "Print"
3. Generate PDF
4. Download or print
5. Verify output
   **Expected Result**:

- PDF generated successfully
- Professional layout
- All information legible
- Suitable for printing

#### TC-023: Export Student Schedule to Excel

**Priority**: High
**Description**: Export class timetable to Excel
**Prerequisites**: Class schedule arranged
**Steps**:

1. Navigate to student/class schedule
2. Select class
3. Click export to Excel
4. Verify download
   **Expected Result**:

- Excel file with class schedule
- All periods, subjects, teachers, rooms included
- Proper formatting

#### TC-024: Export Student Schedule to PDF

**Priority**: High
**Description**: Generate PDF of class schedule
**Prerequisites**: Class schedule arranged
**Steps**:

1. View class schedule
2. Generate PDF
3. Verify output
   **Expected Result**:

- PDF with complete class timetable
- Clear, printable format

---

### 9. Edge Cases & Error Handling

#### TC-025: Invalid Data Entry

**Priority**: Medium
**Description**: System handles invalid inputs gracefully
**Steps**:

1. Attempt to create teacher without required fields
2. Try to create subject with invalid credit value
3. Enter room with special characters
   **Expected Result**:

- Validation errors displayed
- No data corruption
- Clear guidance on fixing errors

#### TC-026: Network Interruption

**Priority**: Medium
**Description**: Handle connection loss gracefully
**Steps**:

1. Start creating/editing data
2. Simulate network disconnect
3. Attempt to save
4. Reconnect
   **Expected Result**:

- Appropriate error message
- Data not lost if possible
- Retry mechanism available

#### TC-027: Concurrent Editing

**Priority**: Low
**Description**: Handle multiple admins editing simultaneously
**Prerequisites**: Two admin sessions
**Steps**:

1. Admin A edits timetable
2. Admin B edits same timetable
3. Both save changes
   **Expected Result**:

- Conflict resolution mechanism
- No data loss
- Users notified of conflicts

---

### 10. Mobile Responsiveness

#### TC-028: Mobile View - Teacher Schedule

**Priority**: Medium
**Description**: Verify mobile-friendly schedule viewing
**Prerequisites**: Schedule exists
**Steps**:

1. Open on mobile device or emulate mobile
2. Navigate to teacher schedule
3. Verify layout adapts
4. Test touch interactions
   **Expected Result**:

- Schedule readable on small screen
- No horizontal scrolling required
- Touch-friendly buttons

#### TC-029: Mobile View - Student Schedule

**Priority**: Medium
**Description**: Public schedule access on mobile
**Steps**:

1. Access student schedule from mobile
2. Select class
3. View timetable
   **Expected Result**:

- Mobile-optimized layout
- Fast loading
- Clear presentation

---

## Test Execution Strategy

### Phase 1: Critical Path (Must Pass)

- TC-001: Authentication
- TC-003: Teacher Management
- TC-007: Semester Configuration
- TC-009: Subject Assignment
- TC-010: Drag-and-Drop Scheduling
- TC-011, TC-012, TC-013: Conflict Detection (All)
- TC-017: View Teacher Schedule
- TC-021: Export to Excel

### Phase 2: Core Features

- TC-004, TC-005, TC-006: Other Data Management
- TC-008: Copy from Previous Semester
- TC-014: Student Arrangement
- TC-015: Lock Timeslots
- TC-018: View Student Schedule
- TC-022, TC-023, TC-024: Other Export Functions

### Phase 3: Extended Features

- TC-016: Unlock Timeslots
- TC-019, TC-020: Summary Views
- TC-025, TC-026, TC-027: Edge Cases
- TC-028, TC-029: Mobile Responsiveness

## Success Criteria

- All Phase 1 tests pass: 100%
- Phase 2 tests pass: 90%+
- Phase 3 tests pass: 80%+
- No critical bugs introduced
- All tests recorded (video/screenshots)

## Test Data Requirements

- Minimum 5 teachers
- Minimum 10 subjects
- Minimum 5 rooms
- 3 grade levels with 2-3 classes each
- 1 configured semester
- Sample timetable data

## Reporting

- HTML test report generated by Playwright
- Screenshots captured for each major step
- Videos recorded for failed tests
- Summary report with pass/fail counts
- Known issues documented
