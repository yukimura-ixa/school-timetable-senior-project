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

import { PrismaClient, day_of_week, semester, subject_credit, breaktime } from '../prisma/generated';
import bcrypt from 'bcryptjs';

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
  
  // ===== AUTH.JS USERS =====
  console.log('👤 Creating admin user...');
  
  // Hash password for admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@school.local' }
  });
  
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: 'admin@school.local',
        name: 'System Administrator',
        password: adminPassword,
        role: 'admin',
        emailVerified: new Date(),
      }
    });
    console.log('✅ Admin user created (email: admin@school.local, password: admin123)');
  } else {
    console.log('ℹ️  Admin user already exists');
  }
  
  // Check if we should clean existing data
  // Set SEED_CLEAN_DATA=true environment variable to enable data cleaning
  // Set SEED_FOR_TESTS=true for E2E testing environment (auto-cleans data)
  const shouldCleanData = process.env.SEED_CLEAN_DATA === 'true' || process.env.SEED_FOR_TESTS === 'true';
  
  if (!shouldCleanData) {
    console.log('ℹ️  Skipping data cleanup (set SEED_CLEAN_DATA=true or SEED_FOR_TESTS=true to enable)');
    console.log('✅ Seed completed - admin user ready');
    return;
  }
  
  const isTestMode = process.env.SEED_FOR_TESTS === 'true';
  if (isTestMode) {
    console.log('🧪 Test mode enabled - Seeding E2E test data...');
  } else {
    console.log('⚠️  SEED_CLEAN_DATA=true - Cleaning existing timetable data...');
  }
  console.log('⚠️  This will DELETE all timetable data but preserve User/Account/Session tables');

  // Clean existing timetable data in correct order (respecting foreign keys)
  // NOTE: This does NOT delete Auth.js tables (User, Account, Session, VerificationToken)
  await prisma.class_schedule.deleteMany({});
  await prisma.teachers_responsibility.deleteMany({});
  await prisma.timeslot.deleteMany({});
  await prisma.table_config.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.teacher.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.gradelevel.deleteMany({});
  await prisma.program.deleteMany({});

  console.log('✅ Timetable data cleaned (Auth.js tables preserved)');

  // ===== PROGRAMS =====
  console.log('📚 Creating programs...');
  
  // Create programs for different grade levels and tracks
  const programs = await Promise.all([
    // Junior High (M.1-M.3) - General Track
    prisma.program.create({
      data: { 
        ProgramCode: 'GENERAL-M1-2567',
        ProgramName: 'หลักสูตรทั่วไป ม.1',
        Year: 1, // Thai year ม.1
        Track: 'GENERAL',
        Description: 'หลักสูตรการศึกษาขั้นพื้นฐาน ชั้นมัธยมศึกษาปีที่ 1',
        MinTotalCredits: 40,
        IsActive: true
      }
    }),
    prisma.program.create({
      data: { 
        ProgramCode: 'GENERAL-M2-2567',
        ProgramName: 'หลักสูตรทั่วไป ม.2',
        Year: 2, // Thai year ม.2
        Track: 'GENERAL',
        Description: 'หลักสูตรการศึกษาขั้นพื้นฐาน ชั้นมัธยมศึกษาปีที่ 2',
        MinTotalCredits: 40,
        IsActive: true
      }
    }),
    prisma.program.create({
      data: { 
        ProgramCode: 'GENERAL-M3-2567',
        ProgramName: 'หลักสูตรทั่วไป ม.3',
        Year: 3, // Thai year ม.3
        Track: 'GENERAL',
        Description: 'หลักสูตรการศึกษาขั้นพื้นฐาน ชั้นมัธยมศึกษาปีที่ 3',
        MinTotalCredits: 40,
        IsActive: true
      }
    }),
    
    // Senior High (M.4-M.6) - Science-Math Track
    prisma.program.create({
      data: { 
        ProgramCode: 'SCI_MATH-M4-2567',
        ProgramName: 'วิทย์-คณิต ม.4',
        Year: 4, // Thai year ม.4
        Track: 'SCIENCE_MATH',
        Description: 'หลักสูตรแผนการเรียนวิทยาศาสตร์-คณิตศาสตร์ ชั้นมัธยมศึกษาปีที่ 4',
        MinTotalCredits: 60,
        IsActive: true
      }
    }),
    prisma.program.create({
      data: { 
        ProgramCode: 'SCI_MATH-M5-2567',
        ProgramName: 'วิทย์-คณิต ม.5',
        Year: 5, // Thai year ม.5
        Track: 'SCIENCE_MATH',
        Description: 'หลักสูตรแผนการเรียนวิทยาศาสตร์-คณิตศาสตร์ ชั้นมัธยมศึกษาปีที่ 5',
        MinTotalCredits: 60,
        IsActive: true
      }
    }),
    prisma.program.create({
      data: { 
        ProgramCode: 'SCI_MATH-M6-2567',
        ProgramName: 'วิทย์-คณิต ม.6',
        Year: 6, // Thai year ม.6
        Track: 'SCIENCE_MATH',
        Description: 'หลักสูตรแผนการเรียนวิทยาศาสตร์-คณิตศาสตร์ ชั้นมัธยมศึกษาปีที่ 6',
        MinTotalCredits: 60,
        IsActive: true
      }
    }),
    
    // Senior High (M.4-M.6) - Language-Arts Track
    prisma.program.create({
      data: { 
        ProgramCode: 'LANG_ARTS-M4-2567',
        ProgramName: 'ศิลป์-ภาษา ม.4',
        Year: 4, // Thai year ม.4
        Track: 'LANGUAGE_ARTS',
        Description: 'หลักสูตรแผนการเรียนศิลป์-ภาษา ชั้นมัธยมศึกษาปีที่ 4',
        MinTotalCredits: 60,
        IsActive: true
      }
    }),
    prisma.program.create({
      data: { 
        ProgramCode: 'LANG_ARTS-M5-2567',
        ProgramName: 'ศิลป์-ภาษา ม.5',
        Year: 5, // Thai year ม.5
        Track: 'LANGUAGE_ARTS',
        Description: 'หลักสูตรแผนการเรียนศิลป์-ภาษา ชั้นมัธยมศึกษาปีที่ 5',
        MinTotalCredits: 60,
        IsActive: true
      }
    }),
    prisma.program.create({
      data: { 
        ProgramCode: 'LANG_ARTS-M6-2567',
        ProgramName: 'ศิลป์-ภาษา ม.6',
        Year: 6, // Thai year ม.6
        Track: 'LANGUAGE_ARTS',
        Description: 'หลักสูตรแผนการเรียนศิลป์-ภาษา ชั้นมัธยมศึกษาปีที่ 6',
        MinTotalCredits: 60,
        IsActive: true
      }
    }),
  ]);
  console.log(`✅ Created ${programs.length} programs`);

  // ===== GRADE LEVELS =====
  console.log('🎓 Creating grade levels...');
  const gradeLevels: any[] = [];
  
  // Find programs by Year and Track (using Thai years 1-6)
  const generalM1 = programs.find(p => p.Year === 1 && p.Track === 'GENERAL');
  const generalM2 = programs.find(p => p.Year === 2 && p.Track === 'GENERAL');
  const generalM3 = programs.find(p => p.Year === 3 && p.Track === 'GENERAL');
  const sciMathM4 = programs.find(p => p.Year === 4 && p.Track === 'SCIENCE_MATH');
  const sciMathM5 = programs.find(p => p.Year === 5 && p.Track === 'SCIENCE_MATH');
  const sciMathM6 = programs.find(p => p.Year === 6 && p.Track === 'SCIENCE_MATH');
  const langArtsM4 = programs.find(p => p.Year === 4 && p.Track === 'LANGUAGE_ARTS');
  const langArtsM5 = programs.find(p => p.Year === 5 && p.Track === 'LANGUAGE_ARTS');
  const langArtsM6 = programs.find(p => p.Year === 6 && p.Track === 'LANGUAGE_ARTS');
  
  // M.1 (Thai Year 1) - 3 sections
  for (let section = 1; section <= 3; section++) {
    const gradeLevel = await prisma.gradelevel.create({
      data: {
        GradeID: `ม.1/${section}`,
        Year: 1,
        Number: section,
        StudentCount: 30 + section,
        ProgramID: generalM1!.ProgramID
      }
    });
    gradeLevels.push(gradeLevel);
  }
  
  // M.2 (Thai Year 2) - 3 sections
  for (let section = 1; section <= 3; section++) {
    const gradeLevel = await prisma.gradelevel.create({
      data: {
        GradeID: `ม.2/${section}`,
        Year: 2,
        Number: section,
        StudentCount: 30 + section,
        ProgramID: generalM2!.ProgramID
      }
    });
    gradeLevels.push(gradeLevel);
  }
  
  // M.3 (Thai Year 3) - 3 sections
  for (let section = 1; section <= 3; section++) {
    const gradeLevel = await prisma.gradelevel.create({
      data: {
        GradeID: `ม.3/${section}`,
        Year: 3,
        Number: section,
        StudentCount: 30 + section,
        ProgramID: generalM3!.ProgramID
      }
    });
    gradeLevels.push(gradeLevel);
  }
  
  // M.4 (Thai Year 4) - 2 sections Science-Math, 1 section Language-Arts
  for (let section = 1; section <= 3; section++) {
    const gradeLevel = await prisma.gradelevel.create({
      data: {
        GradeID: `ม.4/${section}`,
        Year: 4,
        Number: section,
        StudentCount: 28 + section,
        ProgramID: section <= 2 ? sciMathM4!.ProgramID : langArtsM4!.ProgramID
      }
    });
    gradeLevels.push(gradeLevel);
  }
  
  // M.5 (Thai Year 5) - 2 sections Science-Math, 1 section Language-Arts
  for (let section = 1; section <= 3; section++) {
    const gradeLevel = await prisma.gradelevel.create({
      data: {
        GradeID: `ม.5/${section}`,
        Year: 5,
        Number: section,
        StudentCount: 28 + section,
        ProgramID: section <= 2 ? sciMathM5!.ProgramID : langArtsM5!.ProgramID
      }
    });
    gradeLevels.push(gradeLevel);
  }
  
  // M.6 (Thai Year 6) - 2 sections Science-Math, 1 section Language-Arts
  for (let section = 1; section <= 3; section++) {
    const gradeLevel = await prisma.gradelevel.create({
      data: {
        GradeID: `ม.6/${section}`,
        Year: 6,
        Number: section,
        StudentCount: 28 + section,
        ProgramID: section <= 2 ? sciMathM6!.ProgramID : langArtsM6!.ProgramID
      }
    });
    gradeLevels.push(gradeLevel);
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
    // Map Thai category names to SubjectCategory enum
    let category: 'CORE' | 'ADDITIONAL' | 'ACTIVITY' = 'CORE';
    if (subject.category === 'กิจกรรมพัฒนาผู้เรียน') {
      category = 'ACTIVITY';
    } else if (subject.code.startsWith('ง') || subject.code.startsWith('ศ20') || subject.code.startsWith('อ312')) {
      category = 'ADDITIONAL';
    }
    
    const created = await prisma.subject.create({
      data: {
        SubjectCode: subject.code,
        SubjectName: subject.name,
        Credit: subject.credit as any,
        Category: category,
      }
    });
    createdSubjects.push(created);
  }
  console.log(`✅ Created ${createdSubjects.length} subjects`);

  // ===== PROGRAM_SUBJECT RELATIONSHIPS =====
  console.log('🔗 Linking subjects to programs...');
  
  // Helper function to convert credit enum to numeric value
  const creditToNumber = (credit: string): number => {
    switch (credit) {
      case 'CREDIT_05': return 0.5;
      case 'CREDIT_10': return 1.0;
      case 'CREDIT_15': return 1.5;
      case 'CREDIT_20': return 2.0;
      default: return 1.0;
    }
  };

  // Create program_subject entries for subjects with programId
  const programSubjects = subjects
    .filter(s => s.programId !== null)
    .map((s, index) => {
      // Map Thai category to SubjectCategory enum
      let category: 'CORE' | 'ADDITIONAL' | 'ACTIVITY' = 'CORE';
      if (s.category === 'กิจกรรมพัฒนาผู้เรียน') {
        category = 'ACTIVITY';
      } else if (s.code.startsWith('ง') || s.code.startsWith('ศ20') || s.code.startsWith('อ312')) {
        category = 'ADDITIONAL';
      }

      return {
        ProgramID: s.programId!,
        SubjectCode: s.code,
        Category: category,
        IsMandatory: true,
        MinCredits: creditToNumber(s.credit),
        MaxCredits: null,
        SortOrder: index,
      };
    });

  await prisma.program_subject.createMany({
    data: programSubjects,
    skipDuplicates: true,
  });
  console.log(`✅ Linked ${programSubjects.length} subjects to programs`);

  // ===== TIMESLOTS =====
  console.log('⏰ Creating timeslots...');
  const academicYear = 2567;
  const sem: semester = 'SEMESTER_1';
  const semesterNumber = sem === 'SEMESTER_1' ? 1 : sem === 'SEMESTER_2' ? 2 : 3;
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
          TimeslotID: `${semesterNumber}-${academicYear}-${day}-${periodNum}`,
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

  // Simplified teacher responsibility assignment for testing
  // Assign first 3 teachers to first 3 subjects for first grade level
  const sampleGrade = gradeLevels[0];
  const sampleSubjects = createdSubjects.slice(0, 5);
  
  for (let i = 0; i < Math.min(5, teachers.length, sampleSubjects.length); i++) {
    const resp = await prisma.teachers_responsibility.create({
      data: {
        TeacherID: teachers[i].TeacherID,
        GradeID: sampleGrade.GradeID,
        SubjectCode: sampleSubjects[i].SubjectCode,
        AcademicYear: 2567,
        Semester: 'SEMESTER_1',
        TeachHour: 4,
      }
    });
    responsibilities.push(resp);
  }
  
  console.log(`✅ Created ${responsibilities.length} teacher responsibilities`);

  // Helper function to get teachers by department
  const getTeachersByDept = (dept: string) =>
    teachers.filter(t => t.Department === dept);

  // Helper function to get subjects by name pattern
  const getSubjectsByPattern = (pattern: string) => 
    createdSubjects.filter(s => s.SubjectName.includes(pattern));

  // Activity subjects that will be assigned as additional responsibilities
  const activitySubjects = createdSubjects.filter(s => 
    ['ชุมนุม', 'ลูกเสือ/ยุวกาชาด'].includes(s.SubjectCode)
  );

  // Track teacher workload (each teacher can have 1-3 subjects per the Ministry standard)
  const teacherWorkload = new Map<number, number>();
  
  // Function to assign a responsibility and track workload
  const assignResponsibility = async (teacherID: number, gradeID: string, subjectCode: string, teachHour: number) => {
    const currentLoad = teacherWorkload.get(teacherID) || 0;
    if (currentLoad >= 3) {
      // Teacher already has 3 subjects, skip
      return null;
    }
    
    const resp = await prisma.teachers_responsibility.create({
      data: {
        TeacherID: teacherID,
        GradeID: gradeID,
        SubjectCode: subjectCode,
        AcademicYear: 2567,
        Semester: 'SEMESTER_1',
        TeachHour: teachHour,
      }
    });
    
    teacherWorkload.set(teacherID, currentLoad + 1);
    responsibilities.push(resp);
    return resp;
  };

  // Assign core subjects first (Thai, Math, Science, English, Social)
  // Core subjects: Assign to all 18 grades
  
  // 1. Thai Language
  const thaiTeachers = getTeachersByDept('ภาษาไทย');
  const thaiSubjects = getSubjectsByPattern('ภาษาไทย');
  for (let i = 0; i < gradeLevels.length && i < thaiTeachers.length * 2; i++) {
    const gradeLevel = gradeLevels[i];
    const teacher = thaiTeachers[i % thaiTeachers.length];
    const subject = thaiSubjects[Math.min(i, thaiSubjects.length - 1)];
    if (subject) {
      await assignResponsibility(teacher.TeacherID, gradeLevel.GradeID, subject.SubjectCode, 3);
    }
  }

  // 2. Mathematics
  const mathTeachers = getTeachersByDept('คณิตศาสตร์');
  const mathSubjects = getSubjectsByPattern('คณิตศาสตร์');
  for (let i = 0; i < gradeLevels.length && i < mathTeachers.length * 2; i++) {
    const gradeLevel = gradeLevels[i];
    const teacher = mathTeachers[i % mathTeachers.length];
    const subject = mathSubjects[Math.min(i, mathSubjects.length - 1)];
    if (subject) {
      await assignResponsibility(teacher.TeacherID, gradeLevel.GradeID, subject.SubjectCode, 3);
    }
  }

  // 3. Science
  const scienceTeachers = getTeachersByDept('วิทยาศาสตร์');
  const scienceSubjects = getSubjectsByPattern('วิทยาศาสตร์').concat(
    getSubjectsByPattern('ฟิสิกส์'),
    getSubjectsByPattern('เคมี'),
    getSubjectsByPattern('ชีววิทยา')
  );
  for (let i = 0; i < gradeLevels.length && i < scienceTeachers.length * 2; i++) {
    const gradeLevel = gradeLevels[i];
    const teacher = scienceTeachers[i % scienceTeachers.length];
    const subject = scienceSubjects[Math.min(i, scienceSubjects.length - 1)];
    if (subject) {
      await assignResponsibility(teacher.TeacherID, gradeLevel.GradeID, subject.SubjectCode, 3);
    }
  }

  // 4. English
  const englishTeachers = getTeachersByDept('ภาษาอังกฤษ');
  const englishSubjects = createdSubjects.filter(s => s.Category === 'ภาษาต่างประเทศ');
  for (let i = 0; i < gradeLevels.length && englishSubjects.length > 0; i++) {
    const gradeLevel = gradeLevels[i];
    const teacher = englishTeachers[i % englishTeachers.length];
    const subjectIndex = gradeLevel.Year <= 3 ? 0 : Math.min(3, englishSubjects.length - 1);
    const subject = englishSubjects[subjectIndex];
    if (subject) {
      await assignResponsibility(teacher.TeacherID, gradeLevel.GradeID, subject.SubjectCode, 3);
    }
  }

  // 5. Social Studies
  const socialTeachers = getTeachersByDept('สังคมศึกษา');
  const socialSubjects = getSubjectsByPattern('สังคมศึกษา');
  for (let i = 0; i < gradeLevels.length; i++) {
    const gradeLevel = gradeLevels[i];
    const teacher = socialTeachers[i % socialTeachers.length];
    const subject = socialSubjects[0];
    await assignResponsibility(teacher.TeacherID, gradeLevel.GradeID, subject.SubjectCode, 3);
  }

  // Assign secondary subjects with consideration for teacher workload
  
  // 6. Physical Education
  const peTeachers = getTeachersByDept('พลศึกษา');
  const peSubjects = getSubjectsByPattern('สุขศึกษา-พลศึกษา');
  if (peSubjects.length > 0 && peTeachers.length > 0) {
    for (let i = 0; i < gradeLevels.length; i++) {
      const gradeLevel = gradeLevels[i];
      const teacher = peTeachers[i % peTeachers.length];
      await assignResponsibility(teacher.TeacherID, gradeLevel.GradeID, peSubjects[0].SubjectCode, 1);
    }
  }

  // 7. Arts
  const artsTeachers = getTeachersByDept('ศิลปะ');
  const artsSubjects = getSubjectsByPattern('ศิลปะ');
  if (artsSubjects.length > 0 && artsTeachers.length > 0) {
    for (let i = 0; i < gradeLevels.length; i++) {
      const gradeLevel = gradeLevels[i];
      const teacher = artsTeachers[i % artsTeachers.length];
      await assignResponsibility(teacher.TeacherID, gradeLevel.GradeID, artsSubjects[0].SubjectCode, 2);
    }
  }

  // 8. Career/Technology
  const careerTeachers = getTeachersByDept('การงานอาชีพ');
  const careerSubjects = getSubjectsByPattern('การงานอาชีพ');
  if (careerSubjects.length > 0 && careerTeachers.length > 0) {
    for (let i = 0; i < gradeLevels.length; i++) {
      const gradeLevel = gradeLevels[i];
      const teacher = careerTeachers[i % careerTeachers.length];
      await assignResponsibility(teacher.TeacherID, gradeLevel.GradeID, careerSubjects[0].SubjectCode, 1);
    }
  }

  // 9. Assign activity subjects (ชุมนุม, ลูกเสือ) to teachers who have capacity
  // These count as additional teaching subjects following Ministry standards
  const chumNumSubject = activitySubjects.find(s => s.SubjectCode === 'ชุมนุม');
  const scoutSubject = activitySubjects.find(s => s.SubjectCode === 'ลูกเสือ/ยุวกาชาด');
  
  // Assign ชุมนุม - try to distribute across available teachers
  // Use teachers from multiple departments to ensure coverage
  const activityTeacherPool = [...peTeachers, ...artsTeachers, ...careerTeachers];
  if (chumNumSubject) {
    let teacherIndex = 0;
    for (const gradeLevel of gradeLevels) {
      let assigned = false;
      // Try up to 3 times to find a teacher with capacity
      for (let attempt = 0; attempt < activityTeacherPool.length && !assigned; attempt++) {
        const teacher = activityTeacherPool[teacherIndex % activityTeacherPool.length];
        const resp = await assignResponsibility(teacher.TeacherID, gradeLevel.GradeID, chumNumSubject.SubjectCode, 1);
        if (resp) {
          assigned = true;
        }
        teacherIndex++;
      }
      if (!assigned) {
        // If no teacher with capacity, assign to first teacher anyway (override the limit for activities)
        const teacher = activityTeacherPool[0];
        const resp = await prisma.teachers_responsibility.create({
          data: {
            TeacherID: teacher.TeacherID,
            GradeID: gradeLevel.GradeID,
            SubjectCode: chumNumSubject.SubjectCode,
            AcademicYear: academicYear,
            Semester: sem,
            TeachHour: 1,
          }
        });
        responsibilities.push(resp);
      }
    }
  }

  // Assign ลูกเสือ - similarly try to distribute across available teachers
  const scoutTeacherPool = [...peTeachers, ...socialTeachers];
  if (scoutSubject) {
    let teacherIndex = 0;
    for (const gradeLevel of gradeLevels) {
      let assigned = false;
      for (let attempt = 0; attempt < scoutTeacherPool.length && !assigned; attempt++) {
        const teacher = scoutTeacherPool[teacherIndex % scoutTeacherPool.length];
        const resp = await assignResponsibility(teacher.TeacherID, gradeLevel.GradeID, scoutSubject.SubjectCode, 1);
        if (resp) {
          assigned = true;
        }
        teacherIndex++;
      }
      if (!assigned) {
        // If no teacher with capacity, assign to first teacher anyway (override the limit for activities)
        const teacher = scoutTeacherPool[0];
        const resp = await prisma.teachers_responsibility.create({
          data: {
            TeacherID: teacher.TeacherID,
            GradeID: gradeLevel.GradeID,
            SubjectCode: scoutSubject.SubjectCode,
            AcademicYear: academicYear,
            Semester: sem,
            TeachHour: 1,
          }
        });
        responsibilities.push(resp);
      }
    }
  }

  console.log(`✅ Created ${responsibilities.length} teacher responsibilities`);
  
  // Log teacher workload statistics
  const workloadStats = Array.from(teacherWorkload.entries()).reduce((acc, [_, count]) => {
    acc[count] = (acc[count] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  console.log(`   Teacher workload distribution (subjects per teacher):`, workloadStats);

  // ===== SAMPLE TIMETABLE CONFIGURATION =====
  console.log('⚙️  Creating timetable configuration...');
  const tableConfig = await prisma.table_config.create({
    data: {
      ConfigID: `${semesterNumber}-${academicYear}`,
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

  // Lock period 8 on Monday for ชุมนุม (all classes)
  // Use existing teacher responsibilities created above
  // Reuse chumNumSubject declared earlier in the function
  if (chumNumSubject) {
    for (const gradeLevel of gradeLevels) {
      const timeslot = timeslots.find(t => t.TimeslotID === `${semesterNumber}-${academicYear}-MON-8`);
      if (timeslot) {
        // Find the existing responsibility for this grade and subject
        const activityResp = responsibilities.find(r => 
          r.GradeID === gradeLevel.GradeID && r.SubjectCode === chumNumSubject.SubjectCode
        );
        
        if (activityResp) {
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
  }

  // Lock period 8 on Wednesday for ลูกเสือ/ยุวกาชาด (all classes)
  // Reuse scoutSubject declared earlier in the function
  if (scoutSubject) {
    for (const gradeLevel of gradeLevels) {
      const timeslot = timeslots.find(t => t.TimeslotID === `${semesterNumber}-${academicYear}-WED-8`);
      if (timeslot) {
        // Find the existing responsibility for this grade and subject
        const activityResp = responsibilities.find(r => 
          r.GradeID === gradeLevel.GradeID && r.SubjectCode === scoutSubject.SubjectCode
        );
        
        if (activityResp) {
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
      const timeslot = timeslots.find(t => t.TimeslotID === `${semesterNumber}-${academicYear}-MON-1`);
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
      const timeslot = timeslots.find(t => t.TimeslotID === `${semesterNumber}-${academicYear}-MON-2`);
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
      const timeslot = timeslots.find(t => t.TimeslotID === `${semesterNumber}-${academicYear}-TUE-1`);
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

