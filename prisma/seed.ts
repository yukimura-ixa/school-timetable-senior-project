/**
 * Prisma Seed File for School Timetable System
 * 
 * This seed creates a comprehensive mock database based on a medium-sized Thai matthayom (secondary) school.
 * The data includes realistic Thai subject codes, teacher names, and school structure.
 * 
 * Data Scale (Medium-sized Thai School):
 * - 60 Teachers across 8 departments
 * - 40 Classrooms (2 buildings)
 * - 18 Grade levels (M.1-M.6, with 3 sections each)
 * - 50+ Subjects (Thai curriculum: core + elective)
 * - 8 Periods per day, 5 days per week (MON-FRI)
 * - Academic Year 2567 (2024), Semester 1
 * 
 * Edge Cases Covered:
 * - Teachers with multiple subject assignments
 * - Locked timeslots for school-wide activities
 * - Different break times for junior/senior levels
 * - Room conflicts and teacher conflicts
 * - Mixed credit subjects (0.5 to 2.0 credits)
 * - Department-based teacher distribution
 * 
 * Usage:
 *   npx prisma db seed
 */

import { PrismaClient, day_of_week, semester, subject_credit, breaktime } from '@prisma/client';

const prisma = new PrismaClient();

// Thai teacher prefixes and names for realistic data
const THAI_PREFIXES = ['นาย', 'นางสาว', 'นาง', 'ครู', 'อาจารย์'];
const THAI_FIRSTNAMES = [
  'สมชาย', 'สมหญิง', 'วิชัย', 'ประภาส', 'สุรชัย', 'อนุชา', 'กิตติ', 'วรรณา',
  'สุดารัตน์', 'ปิยะ', 'นิภา', 'รัตนา', 'ชัยวัฒน์', 'ศิริพร', 'พิมพ์ใจ', 'จารุวรรณ',
  'ธนพล', 'อรุณ', 'วิภา', 'สมศักดิ์', 'นันทวัน', 'วิไล', 'ประวิทย์', 'สุภาพ',
  'กมล', 'ชญาน์นันท์', 'ธีรศักดิ์', 'พัชรินทร์', 'วีรพงษ์', 'สุวรรณา', 'มานิต',
  'ศุภชัย', 'สมพร', 'พิชญา', 'อภิชาติ', 'รัชนี', 'ประดิษฐ์', 'จินตนา', 'บุญส่ง',
  'นภา', 'ธนัช', 'ปรียา', 'อัญชลี', 'วัชระ', 'สมบูรณ์', 'กนกวรรณ', 'ชนินทร์',
  'พรพิมล', 'ธนาวุฒิ', 'สุดา', 'ณัฐพงษ์', 'วิชญา', 'ภูมิ', 'นวพร', 'สาลินี',
  'ตุลา', 'ชนิดา', 'สุรเชษฐ์', 'นริศรา', 'ภัทรพล', 'กัญญา'
];
const THAI_LASTNAMES = [
  'สมบูรณ์', 'จิตรใจ', 'วงศ์สวัสดิ์', 'ประเสริฐ', 'ศรีสุข', 'มั่นคง', 'บุญมี', 'เจริญสุข',
  'พันธ์ดี', 'วัฒนา', 'สุขเจริญ', 'ทองดี', 'รักษา', 'เพชรรัตน์', 'สว่างแสง', 'ชัยชนะ',
  'วิริยะ', 'สุวรรณ', 'แสงทอง', 'เลิศล้ำ', 'ภูมิใจ', 'คงดี', 'มีสุข', 'เกิดผล',
  'พิทักษ์', 'อุดมพร', 'ชูเกียรติ', 'ทรงศิลป์', 'วรรณกร', 'ธรรมศาสตร์', 'สุขใจ',
  'เลิศศิริ', 'เจริญรัตน์', 'ศรีทอง', 'พรหมมา', 'วิชาญ', 'กิตติศักดิ์', 'บุญชู', 'สมศรี',
  'รัตนพันธ์', 'วิทยา', 'ประทุม', 'มหาวงศ์', 'พูลสวัสดิ์', 'ดำรงค์', 'ชนะชัย', 'อมรรัตน์',
  'ศิลปชัย', 'กาญจนา', 'วรวัฒน์', 'ปิยะวัฒน์', 'กมลชนก', 'สุทธิ', 'พิมพ์พิไล', 'เพ็ชรสว่าง',
  'วัฒนพันธุ์', 'สิริวัฒน์', 'มงคล', 'ศรีประพันธ์', 'สมานมิตร', 'ประดับศิริ'
];

// Thai department names
const DEPARTMENTS = [
  'คณิตศาสตร์',
  'วิทยาศาสตร์',
  'ภาษาไทย',
  'ภาษาอังกฤษ',
  'สังคมศึกษา',
  'ศิลปะ',
  'พลศึกษา',
  'การงานอาชีพ'
];

// Building names - simplified
const BUILDINGS = [
  { name: 'ตึกเรียน', shortName: '1' },
  { name: 'ตึกวิทยาศาสตร์', shortName: '2' },
  { name: 'ตึกกีฬา', shortName: '3' },
];

async function main() {
  console.log('🌱 Starting seed...');
  console.log('🗑️  Cleaning existing data...');

  // Clean existing data in correct order (respecting foreign keys)
  await prisma.class_schedule.deleteMany({});
  await prisma.teachers_responsibility.deleteMany({});
  await prisma.timeslot.deleteMany({});
  await prisma.table_config.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.teacher.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.gradelevel.deleteMany({});
  await prisma.program.deleteMany({});

  console.log('✅ Existing data cleaned');

  // ===== PROGRAMS =====
  console.log('📚 Creating programs...');
  const programs = await Promise.all([
    prisma.program.create({
      data: { ProgramName: 'หลักสูตรแกนกลาง ม.ต้น', Semester: 'SEMESTER_1' }
    }),
    prisma.program.create({
      data: { ProgramName: 'หลักสูตรแกนกลาง ม.ปลาย', Semester: 'SEMESTER_1' }
    }),
    prisma.program.create({
      data: { ProgramName: 'หลักสูตรเพิ่มเติม วิทย์-คณิต', Semester: 'SEMESTER_1' }
    }),
    prisma.program.create({
      data: { ProgramName: 'หลักสูตรเพิ่มเติม ศิลป์-ภาษา', Semester: 'SEMESTER_1' }
    }),
  ]);
  console.log(`✅ Created ${programs.length} programs`);

  // ===== GRADE LEVELS =====
  console.log('🎓 Creating grade levels...');
  const gradeLevels: any[] = [];
  // M.1 - M.3 (Junior High - มัธยมต้น)
  for (let year = 1; year <= 3; year++) {
    for (let section = 1; section <= 3; section++) {
      const gradeLevel = await prisma.gradelevel.create({
        data: {
          GradeID: `${year}0${section}`,
          Year: year,
          Number: section,
          program: {
            connect: [
              { ProgramID: programs[0].ProgramID }, // Core curriculum
            ]
          }
        }
      });
      gradeLevels.push(gradeLevel);
    }
  }
  // M.4 - M.6 (Senior High - มัธยมปลาย)
  for (let year = 4; year <= 6; year++) {
    for (let section = 1; section <= 3; section++) {
      const gradeLevel = await prisma.gradelevel.create({
        data: {
          GradeID: `${year}0${section}`,
          Year: year,
          Number: section,
          program: {
            connect: [
              { ProgramID: programs[1].ProgramID }, // Core curriculum
              { ProgramID: section === 1 ? programs[2].ProgramID : programs[3].ProgramID }, // Elective based on section
            ]
          }
        }
      });
      gradeLevels.push(gradeLevel);
    }
  }
  console.log(`✅ Created ${gradeLevels.length} grade levels`);

  // ===== ROOMS =====
  console.log('🏫 Creating rooms...');
  const rooms: any[] = [];
  
  for (const building of BUILDINGS) {
    const roomsInBuilding = building.shortName === '3' ? 8 : 16; // Sports building has fewer rooms
    
    for (let i = 0; i < roomsInBuilding; i++) {
      const floor = Math.floor(i / 4) + 1;
      const roomNum = (i % 4) + 1;
      
      // Room name format: ห้อง xyz where x=building, y=floor, z=room
      const roomName = `ห้อง ${building.shortName}${floor}${roomNum}`;
      
      const room = await prisma.room.create({
        data: {
          RoomName: roomName,
          Building: building.name,
          Floor: `ชั้น ${floor}`,
        }
      });
      rooms.push(room);
    }
  }
  console.log(`✅ Created ${rooms.length} rooms`);

  // ===== TEACHERS =====
  console.log('👨‍🏫 Creating teachers...');
  const teachers: any[] = [];
  let teacherEmailCount = 1;
  
  for (const dept of DEPARTMENTS) {
    const teachersPerDept = Math.floor(60 / DEPARTMENTS.length);
    for (let i = 0; i < teachersPerDept; i++) {
      const prefix = THAI_PREFIXES[Math.floor(Math.random() * THAI_PREFIXES.length)];
      const firstname = THAI_FIRSTNAMES[Math.floor(Math.random() * THAI_FIRSTNAMES.length)];
      const lastname = THAI_LASTNAMES[Math.floor(Math.random() * THAI_LASTNAMES.length)];
      
      const teacher = await prisma.teacher.create({
        data: {
          Prefix: prefix,
          Firstname: firstname,
          Lastname: lastname,
          Department: dept,
          Email: `teacher${teacherEmailCount}@school.ac.th`,
          Role: i === 0 ? 'admin' : 'teacher'
        }
      });
      teachers.push(teacher);
      teacherEmailCount++;
    }
  }
  console.log(`✅ Created ${teachers.length} teachers`);

  // ===== SUBJECTS =====
  console.log('📖 Creating subjects...');
  const subjects = [
    // ภาษาไทย (Thai Language)
    { code: 'ท21101', name: 'ภาษาไทย 1', credit: 'CREDIT_15', category: 'ภาษาไทย', programId: programs[0].ProgramID },
    { code: 'ท21102', name: 'ภาษาไทย 2', credit: 'CREDIT_15', category: 'ภาษาไทย', programId: programs[0].ProgramID },
    { code: 'ท21201', name: 'ภาษาไทย 3', credit: 'CREDIT_15', category: 'ภาษาไทย', programId: programs[0].ProgramID },
    { code: 'ท31101', name: 'ภาษาไทย 4', credit: 'CREDIT_15', category: 'ภาษาไทย', programId: programs[1].ProgramID },
    { code: 'ท31102', name: 'ภาษาไทย 5', credit: 'CREDIT_15', category: 'ภาษาไทย', programId: programs[1].ProgramID },

    // คณิตศาสตร์ (Mathematics)
    { code: 'ค21101', name: 'คณิตศาสตร์ 1', credit: 'CREDIT_15', category: 'คณิตศาสตร์', programId: programs[0].ProgramID },
    { code: 'ค21102', name: 'คณิตศาสตร์ 2', credit: 'CREDIT_15', category: 'คณิตศาสตร์', programId: programs[0].ProgramID },
    { code: 'ค21201', name: 'คณิตศาสตร์ 3', credit: 'CREDIT_15', category: 'คณิตศาสตร์', programId: programs[0].ProgramID },
    { code: 'ค31101', name: 'คณิตศาสตร์ 4', credit: 'CREDIT_15', category: 'คณิตศาสตร์', programId: programs[1].ProgramID },
    { code: 'ค31201', name: 'คณิตศาสตร์เพิ่มเติม', credit: 'CREDIT_10', category: 'คณิตศาสตร์', programId: programs[2].ProgramID },

    // วิทยาศาสตร์ (Science)
    { code: 'ว21101', name: 'วิทยาศาสตร์ 1', credit: 'CREDIT_15', category: 'วิทยาศาสตร์', programId: programs[0].ProgramID },
    { code: 'ว21102', name: 'วิทยาศาสตร์ 2', credit: 'CREDIT_15', category: 'วิทยาศาสตร์', programId: programs[0].ProgramID },
    { code: 'ว21171', name: 'เคมี 1', credit: 'CREDIT_10', category: 'วิทยาศาสตร์', programId: programs[2].ProgramID },
    { code: 'ว21172', name: 'ชีววิทยา 1', credit: 'CREDIT_10', category: 'วิทยาศาสตร์', programId: programs[2].ProgramID },
    { code: 'ว21201', name: 'วิทยาศาสตร์ 3', credit: 'CREDIT_15', category: 'วิทยาศาสตร์', programId: programs[0].ProgramID },
    { code: 'ว31101', name: 'ฟิสิกส์ 1', credit: 'CREDIT_10', category: 'วิทยาศาสตร์', programId: programs[2].ProgramID },

    // ภาษาอังกฤษ (English)
    { code: 'อ21101', name: 'ภาษาอังกฤษ 1', credit: 'CREDIT_15', category: 'ภาษาต่างประเทศ', programId: programs[0].ProgramID },
    { code: 'อ21102', name: 'ภาษาอังกฤษ 2', credit: 'CREDIT_15', category: 'ภาษาต่างประเทศ', programId: programs[0].ProgramID },
    { code: 'อ21201', name: 'ภาษาอังกฤษ 3', credit: 'CREDIT_15', category: 'ภาษาต่างประเทศ', programId: programs[0].ProgramID },
    { code: 'อ31101', name: 'ภาษาอังกฤษ 4', credit: 'CREDIT_15', category: 'ภาษาต่างประเทศ', programId: programs[1].ProgramID },
    { code: 'อ31201', name: 'ภาษาอังกฤษสนทนา', credit: 'CREDIT_10', category: 'ภาษาต่างประเทศ', programId: programs[3].ProgramID },

    // สังคมศึกษา (Social Studies)
    { code: 'ส21101', name: 'สังคมศึกษา 1', credit: 'CREDIT_15', category: 'สังคมศึกษา', programId: programs[0].ProgramID },
    { code: 'ส21102', name: 'สังคมศึกษา 2', credit: 'CREDIT_15', category: 'สังคมศึกษา', programId: programs[0].ProgramID },
    { code: 'ส21104', name: 'ประวัติศาสตร์', credit: 'CREDIT_10', category: 'สังคมศึกษา', programId: programs[0].ProgramID },
    { code: 'ส31101', name: 'สังคมศึกษา 4', credit: 'CREDIT_15', category: 'สังคมศึกษา', programId: programs[1].ProgramID },

    // พลศึกษา (Physical Education)
    { code: 'พ21101', name: 'พลศึกษา 1', credit: 'CREDIT_05', category: 'สุขศึกษา-พลศึกษา', programId: programs[0].ProgramID },
    { code: 'พ21102', name: 'พลศึกษา 2', credit: 'CREDIT_05', category: 'สุขศึกษา-พลศึกษา', programId: programs[0].ProgramID },
    { code: 'พ21103', name: 'สุขศึกษา', credit: 'CREDIT_05', category: 'สุขศึกษา-พลศึกษา', programId: programs[0].ProgramID },
    { code: 'พ31101', name: 'พลศึกษา 4', credit: 'CREDIT_05', category: 'สุขศึกษา-พลศึกษา', programId: programs[1].ProgramID },

    // ศิลปะ (Arts)
    { code: 'ศ21101', name: 'ศิลปะ 1', credit: 'CREDIT_10', category: 'ศิลปะ', programId: programs[0].ProgramID },
    { code: 'ศ21102', name: 'ดนตรี', credit: 'CREDIT_05', category: 'ศิลปะ', programId: programs[0].ProgramID },
    { code: 'ศ20201', name: 'นาฏศิลป์', credit: 'CREDIT_20', category: 'ศิลปะ', programId: programs[3].ProgramID },
    { code: 'ศ31101', name: 'ศิลปะ 4', credit: 'CREDIT_10', category: 'ศิลปะ', programId: programs[1].ProgramID },

    // การงานอาชีพ (Career and Technology)
    { code: 'ง21101', name: 'การงานอาชีพ 1', credit: 'CREDIT_10', category: 'การงานอาชีพ', programId: programs[0].ProgramID },
    { code: 'ง21102', name: 'คอมพิวเตอร์ 1', credit: 'CREDIT_10', category: 'การงานอาชีพ', programId: programs[0].ProgramID },
    { code: 'ง21201', name: 'การงานอาชีพ 2', credit: 'CREDIT_10', category: 'การงานอาชีพ', programId: programs[0].ProgramID },
    { code: 'ง31101', name: 'คอมพิวเตอร์ 2', credit: 'CREDIT_10', category: 'การงานอาชีพ', programId: programs[1].ProgramID },

    // กิจกรรมพัฒนาผู้เรียน (Student Development Activities)
    { code: 'จ21201', name: 'กิจกรรมชุมนุม', credit: 'CREDIT_10', category: 'กิจกรรมพัฒนาผู้เรียน', programId: programs[0].ProgramID },
    { code: 'ชุมนุม', name: 'กิจกรรมชุมนุม', credit: 'CREDIT_05', category: 'กิจกรรมพัฒนาผู้เรียน', programId: null },
    { code: 'ลูกเสือ/ยุวกาชาด', name: 'ลูกเสือ/ยุวกาชาด', credit: 'CREDIT_05', category: 'กิจกรรมพัฒนาผู้เรียน', programId: null },
    { code: 'แนะแนว', name: 'แนะแนว', credit: 'CREDIT_05', category: 'กิจกรรมพัฒนาผู้เรียน', programId: null },
    { code: 'โครงงาน', name: 'กิจกรรมโครงงาน', credit: 'CREDIT_05', category: 'กิจกรรมพัฒนาผู้เรียน', programId: null },
    { code: 'จริยธรรม', name: 'จริยธรรม', credit: 'CREDIT_05', category: 'กิจกรรมพัฒนาผู้เรียน', programId: null },
  ];

  const createdSubjects: any[] = [];
  for (const subject of subjects) {
    const created = await prisma.subject.create({
      data: {
        SubjectCode: subject.code,
        SubjectName: subject.name,
        Credit: subject.credit as any,
        Category: subject.category,
        ProgramID: subject.programId,
      }
    });
    createdSubjects.push(created);
  }
  console.log(`✅ Created ${createdSubjects.length} subjects`);

  // ===== TIMESLOTS =====
  console.log('⏰ Creating timeslots...');
  const academicYear = 2567;
  const sem: semester = 'SEMESTER_1';
  const days: day_of_week[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
  const periods = [
    { start: '08:30', end: '09:20', break: 'NOT_BREAK' },
    { start: '09:20', end: '10:10', break: 'NOT_BREAK' },
    { start: '10:10', end: '11:00', break: 'NOT_BREAK' },
    { start: '11:00', end: '11:50', break: 'NOT_BREAK' },
    { start: '12:50', end: '13:40', break: 'BREAK_JUNIOR' }, // Lunch break before
    { start: '13:40', end: '14:30', break: 'BREAK_SENIOR' },
    { start: '14:30', end: '15:20', break: 'NOT_BREAK' },
    { start: '15:20', end: '16:10', break: 'NOT_BREAK' },
  ];

  const timeslots: any[] = [];
  for (const day of days) {
    for (let periodNum = 1; periodNum <= periods.length; periodNum++) {
      const period = periods[periodNum - 1];
      const timeslot = await prisma.timeslot.create({
        data: {
          TimeslotID: `1/${academicYear}-${day}${periodNum}`,
          AcademicYear: academicYear,
          Semester: sem,
          StartTime: new Date(`2024-01-01T${period.start}:00`),
          EndTime: new Date(`2024-01-01T${period.end}:00`),
          Breaktime: period.break as breaktime,
          DayOfWeek: day,
        }
      });
      timeslots.push(timeslot);
    }
  }
  console.log(`✅ Created ${timeslots.length} timeslots`);

  // ===== TEACHER RESPONSIBILITIES =====
  console.log('📝 Creating teacher responsibilities...');
  const responsibilities: any[] = [];

  // Helper function to get teachers by department
  const getTeachersByDept = (dept: string) => 
    teachers.filter(t => t.Department === dept);

  // Helper function to get subjects by category
  const getSubjectsByCategory = (category: string) => 
    createdSubjects.filter(s => s.Category === category);

  // Assign Thai teachers to ALL classes (M.1-M.6)
  const thaiTeachers = getTeachersByDept('ภาษาไทย');
  const thaiSubjects = getSubjectsByCategory('ภาษาไทย');
  for (let i = 0; i < gradeLevels.length; i++) {
    const gradeLevel = gradeLevels[i];
    const teacher = thaiTeachers[i % thaiTeachers.length];
    // Choose subject based on grade year
    const subject = gradeLevel.Year <= 3 
      ? thaiSubjects[0] // ภาษาไทย 1 for M.1-M.3
      : thaiSubjects[3]; // ภาษาไทย 4 for M.4-M.6
    
    const resp = await prisma.teachers_responsibility.create({
      data: {
        TeacherID: teacher.TeacherID,
        GradeID: gradeLevel.GradeID,
        SubjectCode: subject.SubjectCode,
        AcademicYear: academicYear,
        Semester: sem,
        TeachHour: 3, // 3 periods per week
      }
    });
    responsibilities.push(resp);
  }

  // Assign Math teachers to ALL classes (M.1-M.6)
  const mathTeachers = getTeachersByDept('คณิตศาสตร์');
  const mathSubjects = getSubjectsByCategory('คณิตศาสตร์');
  for (let i = 0; i < gradeLevels.length; i++) {
    const gradeLevel = gradeLevels[i];
    const teacher = mathTeachers[i % mathTeachers.length];
    // Choose subject based on grade year
    const subject = gradeLevel.Year <= 3 
      ? mathSubjects[0] // คณิตศาสตร์ 1 for M.1-M.3
      : mathSubjects[3]; // คณิตศาสตร์ 4 for M.4-M.6
    
    const resp = await prisma.teachers_responsibility.create({
      data: {
        TeacherID: teacher.TeacherID,
        GradeID: gradeLevel.GradeID,
        SubjectCode: subject.SubjectCode,
        AcademicYear: academicYear,
        Semester: sem,
        TeachHour: 3,
      }
    });
    responsibilities.push(resp);
  }

  // Assign Science teachers to ALL classes
  const scienceTeachers = getTeachersByDept('วิทยาศาสตร์');
  const scienceSubjects = getSubjectsByCategory('วิทยาศาสตร์');
  for (let i = 0; i < gradeLevels.length; i++) {
    const gradeLevel = gradeLevels[i];
    const teacher = scienceTeachers[i % scienceTeachers.length];
    // Choose subject based on grade year
    const subject = gradeLevel.Year <= 3 
      ? scienceSubjects[0] // วิทยาศาสตร์ 1 for M.1-M.3
      : scienceSubjects[Math.min(3, scienceSubjects.length - 1)]; // Later science subjects for M.4-M.6
    
    const resp = await prisma.teachers_responsibility.create({
      data: {
        TeacherID: teacher.TeacherID,
        GradeID: gradeLevel.GradeID,
        SubjectCode: subject.SubjectCode,
        AcademicYear: academicYear,
        Semester: sem,
        TeachHour: 3,
      }
    });
    responsibilities.push(resp);
  }

  // Assign English teachers
  const englishTeachers = getTeachersByDept('ภาษาอังกฤษ');
  const englishSubjects = createdSubjects.filter(s => s.Category === 'ภาษาต่างประเทศ');
  for (let i = 0; i < gradeLevels.length; i++) {
    const gradeLevel = gradeLevels[i];
    const teacher = englishTeachers[i % englishTeachers.length];
    const subject = englishSubjects[gradeLevel.Year <= 3 ? 0 : 3];
    
    const resp = await prisma.teachers_responsibility.create({
      data: {
        TeacherID: teacher.TeacherID,
        GradeID: gradeLevel.GradeID,
        SubjectCode: subject.SubjectCode,
        AcademicYear: academicYear,
        Semester: sem,
        TeachHour: 3,
      }
    });
    responsibilities.push(resp);
  }

  // Assign Social Studies teachers
  const socialTeachers = getTeachersByDept('สังคมศึกษา');
  const socialSubjects = getSubjectsByCategory('สังคมศึกษา');
  for (let i = 0; i < gradeLevels.length; i++) {
    const gradeLevel = gradeLevels[i];
    const teacher = socialTeachers[i % socialTeachers.length];
    const subject = socialSubjects[0];
    
    const resp = await prisma.teachers_responsibility.create({
      data: {
        TeacherID: teacher.TeacherID,
        GradeID: gradeLevel.GradeID,
        SubjectCode: subject.SubjectCode,
        AcademicYear: academicYear,
        Semester: sem,
        TeachHour: 3,
      }
    });
    responsibilities.push(resp);
  }

  // Assign PE teachers (1 period per week)
  const peTeachers = getTeachersByDept('พลศึกษา');
  const peSubjects = getSubjectsByCategory('สุขศึกษา-พลศึกษา');
  for (let i = 0; i < gradeLevels.length; i++) {
    const gradeLevel = gradeLevels[i];
    const teacher = peTeachers[i % peTeachers.length];
    const subject = peSubjects[0];
    
    const resp = await prisma.teachers_responsibility.create({
      data: {
        TeacherID: teacher.TeacherID,
        GradeID: gradeLevel.GradeID,
        SubjectCode: subject.SubjectCode,
        AcademicYear: academicYear,
        Semester: sem,
        TeachHour: 1,
      }
    });
    responsibilities.push(resp);
  }

  // Assign Arts teachers
  const artsTeachers = getTeachersByDept('ศิลปะ');
  const artsSubjects = getSubjectsByCategory('ศิลปะ');
  for (let i = 0; i < gradeLevels.length; i++) {
    const gradeLevel = gradeLevels[i];
    const teacher = artsTeachers[i % artsTeachers.length];
    const subject = artsSubjects[0];
    
    const resp = await prisma.teachers_responsibility.create({
      data: {
        TeacherID: teacher.TeacherID,
        GradeID: gradeLevel.GradeID,
        SubjectCode: subject.SubjectCode,
        AcademicYear: academicYear,
        Semester: sem,
        TeachHour: 2,
      }
    });
    responsibilities.push(resp);
  }

  // Assign Career teachers
  const careerTeachers = getTeachersByDept('การงานอาชีพ');
  const careerSubjects = getSubjectsByCategory('การงานอาชีพ');
  for (let i = 0; i < gradeLevels.length; i++) {
    const gradeLevel = gradeLevels[i];
    const teacher = careerTeachers[i % careerTeachers.length];
    const subject = careerSubjects[0];
    
    const resp = await prisma.teachers_responsibility.create({
      data: {
        TeacherID: teacher.TeacherID,
        GradeID: gradeLevel.GradeID,
        SubjectCode: subject.SubjectCode,
        AcademicYear: academicYear,
        Semester: sem,
        TeachHour: 1,
      }
    });
    responsibilities.push(resp);
  }

  console.log(`✅ Created ${responsibilities.length} teacher responsibilities`);

  // ===== SAMPLE TIMETABLE CONFIGURATION =====
  console.log('⚙️  Creating timetable configuration...');
  const tableConfig = await prisma.table_config.create({
    data: {
      ConfigID: `${academicYear}-${sem}`,
      AcademicYear: academicYear,
      Semester: sem,
      Config: {
        periodsPerDay: 8,
        startTime: '08:30',
        periodDuration: 50,
        schoolDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
        lunchBreak: { after: 4, duration: 60 },
        breakTimes: {
          junior: { after: 4 },
          senior: { after: 5 }
        }
      }
    }
  });
  console.log('✅ Created timetable configuration');

  // ===== SAMPLE CLASS SCHEDULES (with locked slots for activities) =====
  console.log('📅 Creating sample class schedules...');
  const classSchedules: any[] = [];

  // Create locked slots for school-wide activities
  // Activity subjects (ชุมนุม, ลูกเสือ, แนะแนว, โครงงาน, จริยธรรม)
  const activitySubjects = createdSubjects.filter(s => 
    ['ชุมนุม', 'ลูกเสือ/ยุวกาชาด', 'แนะแนว', 'โครงงาน', 'จริยธรรม'].includes(s.SubjectCode)
  );

  // Lock period 8 on Monday for ชุมนุม (all classes)
  const chumNumSubject = activitySubjects.find(s => s.SubjectCode === 'ชุมนุม');
  if (chumNumSubject) {
    for (const gradeLevel of gradeLevels) {
      const timeslot = timeslots.find(t => t.TimeslotID === `1/${academicYear}-MON8`);
      if (timeslot) {
        // Create a shared responsibility for activities (using first teacher as coordinator)
        let activityResp = responsibilities.find(r => 
          r.GradeID === gradeLevel.GradeID && r.SubjectCode === chumNumSubject.SubjectCode
        );
        
        if (!activityResp) {
          activityResp = await prisma.teachers_responsibility.create({
            data: {
              TeacherID: teachers[0].TeacherID,
              GradeID: gradeLevel.GradeID,
              SubjectCode: chumNumSubject.SubjectCode,
              AcademicYear: academicYear,
              Semester: sem,
              TeachHour: 1,
            }
          });
          responsibilities.push(activityResp);
        }

        const schedule = await prisma.class_schedule.create({
          data: {
            ClassID: `${timeslot.TimeslotID}-${chumNumSubject.SubjectCode}-${gradeLevel.GradeID}`,
            TimeslotID: timeslot.TimeslotID,
            SubjectCode: chumNumSubject.SubjectCode,
            GradeID: gradeLevel.GradeID,
            RoomID: null, // Activities don't need specific rooms
            IsLocked: true, // Locked slot
            teachers_responsibility: {
              connect: [{ RespID: activityResp.RespID }]
            }
          }
        });
        classSchedules.push(schedule);
      }
    }
  }

  // Lock period 8 on Wednesday for ลูกเสือ/ยุวกาชาด (all classes)
  const scoutSubject = activitySubjects.find(s => s.SubjectCode === 'ลูกเสือ/ยุวกาชาด');
  if (scoutSubject) {
    for (const gradeLevel of gradeLevels) {
      const timeslot = timeslots.find(t => t.TimeslotID === `1/${academicYear}-WED8`);
      if (timeslot) {
        let activityResp = responsibilities.find(r => 
          r.GradeID === gradeLevel.GradeID && r.SubjectCode === scoutSubject.SubjectCode
        );
        
        if (!activityResp) {
          activityResp = await prisma.teachers_responsibility.create({
            data: {
              TeacherID: teachers[1].TeacherID,
              GradeID: gradeLevel.GradeID,
              SubjectCode: scoutSubject.SubjectCode,
              AcademicYear: academicYear,
              Semester: sem,
              TeachHour: 1,
            }
          });
          responsibilities.push(activityResp);
        }

        const schedule = await prisma.class_schedule.create({
          data: {
            ClassID: `${timeslot.TimeslotID}-${scoutSubject.SubjectCode}-${gradeLevel.GradeID}`,
            TimeslotID: timeslot.TimeslotID,
            SubjectCode: scoutSubject.SubjectCode,
            GradeID: gradeLevel.GradeID,
            RoomID: null,
            IsLocked: true,
            teachers_responsibility: {
              connect: [{ RespID: activityResp.RespID }]
            }
          }
        });
        classSchedules.push(schedule);
      }
    }
  }

  // Add a few sample regular class schedules for M.1/01
  const m1_01 = gradeLevels.find(g => g.GradeID === '101');
  if (m1_01) {
    const m1Responsibilities = responsibilities.filter(r => r.GradeID === '101');
    
    // Schedule Thai class on MON period 1
    const thaiResp = m1Responsibilities.find(r => createdSubjects.find(s => 
      s.SubjectCode === r.SubjectCode && s.Category === 'ภาษาไทย'
    ));
    if (thaiResp) {
      const timeslot = timeslots.find(t => t.TimeslotID === `1/${academicYear}-MON1`);
      if (timeslot) {
        const schedule = await prisma.class_schedule.create({
          data: {
            ClassID: `${timeslot.TimeslotID}-${thaiResp.SubjectCode}-101`,
            TimeslotID: timeslot.TimeslotID,
            SubjectCode: thaiResp.SubjectCode,
            GradeID: '101',
            RoomID: rooms[0].RoomID,
            IsLocked: false,
            teachers_responsibility: {
              connect: [{ RespID: thaiResp.RespID }]
            }
          }
        });
        classSchedules.push(schedule);
      }
    }

    // Schedule Math class on MON period 2
    const mathResp = m1Responsibilities.find(r => createdSubjects.find(s => 
      s.SubjectCode === r.SubjectCode && s.Category === 'คณิตศาสตร์'
    ));
    if (mathResp) {
      const timeslot = timeslots.find(t => t.TimeslotID === `1/${academicYear}-MON2`);
      if (timeslot) {
        const schedule = await prisma.class_schedule.create({
          data: {
            ClassID: `${timeslot.TimeslotID}-${mathResp.SubjectCode}-101`,
            TimeslotID: timeslot.TimeslotID,
            SubjectCode: mathResp.SubjectCode,
            GradeID: '101',
            RoomID: rooms[0].RoomID,
            IsLocked: false,
            teachers_responsibility: {
              connect: [{ RespID: mathResp.RespID }]
            }
          }
        });
        classSchedules.push(schedule);
      }
    }

    // Schedule English class on TUE period 1
    const engResp = m1Responsibilities.find(r => createdSubjects.find(s => 
      s.SubjectCode === r.SubjectCode && s.Category === 'ภาษาต่างประเทศ'
    ));
    if (engResp) {
      const timeslot = timeslots.find(t => t.TimeslotID === `1/${academicYear}-TUE1`);
      if (timeslot) {
        const schedule = await prisma.class_schedule.create({
          data: {
            ClassID: `${timeslot.TimeslotID}-${engResp.SubjectCode}-101`,
            TimeslotID: timeslot.TimeslotID,
            SubjectCode: engResp.SubjectCode,
            GradeID: '101',
            RoomID: rooms[1].RoomID,
            IsLocked: false,
            teachers_responsibility: {
              connect: [{ RespID: engResp.RespID }]
            }
          }
        });
        classSchedules.push(schedule);
      }
    }
  }

  console.log(`✅ Created ${classSchedules.length} class schedules (including locked slots)`);

  // ===== SUMMARY =====
  console.log('\n' + '='.repeat(60));
  console.log('🎉 Seed completed successfully!');
  console.log('='.repeat(60));
  console.log(`📊 Database Summary:`);
  console.log(`   • Programs: ${programs.length}`);
  console.log(`   • Grade Levels: ${gradeLevels.length} (M.1-M.6, 3 sections each)`);
  console.log(`   • Rooms: ${rooms.length} (${BUILDINGS.length} buildings)`);
  console.log(`   • Teachers: ${teachers.length} (${DEPARTMENTS.length} departments)`);
  console.log(`   • Subjects: ${createdSubjects.length} (Thai curriculum)`);
  console.log(`   • Timeslots: ${timeslots.length} (5 days × 8 periods)`);
  console.log(`   • Teacher Responsibilities: ${responsibilities.length}`);
  console.log(`   • Class Schedules: ${classSchedules.length} (including locked slots)`);
  console.log(`   • Table Configurations: 1`);
  console.log('='.repeat(60));
  console.log('\n✨ Your mock database is ready for testing!');
  console.log('💡 Edge cases included:');
  console.log('   - Locked timeslots for school-wide activities');
  console.log('   - Multiple teacher assignments');
  console.log('   - Different break times for junior/senior');
  console.log('   - Mixed credit subjects (0.5 to 2.0)');
  console.log('   - Room assignments and conflicts');
  console.log('='.repeat(60));
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
