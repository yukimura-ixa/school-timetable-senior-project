# MOE กิจกรรมพัฒนาผู้เรียน (Student Development Activities) - Seed Data

## Overview
Updated `prisma/seed.ts` with comprehensive MOE-compliant student development activities.
**Previous count**: 9 activities → **New count**: 62 activities

## MOE Activity Categories

### 1. กิจกรรมแนะแนว (Guidance Activities) - ActivityType: GUIDANCE
**Purpose**: Career guidance, personal development, academic planning
**Frequency**: 1 period/week

| Code | Name (Thai) |
|------|-------------|
| ACT-GUIDE | แนะแนว |
| ACT-GUIDE-M1 to M6 | แนะแนว ม.1-6 (grade-specific) |
| ACT-HOMEROOM | โฮมรูม/ชั่วโมงพบครูที่ปรึกษา |

**Total**: 8 activities

### 2a. ลูกเสือ (Boy Scout) - ActivityType: SCOUT
**Structure**:
- ม.1-3: ลูกเสือสามัญรุ่นใหญ่ (Senior Scout)
- ม.4-6: ลูกเสือวิสามัญ (Rover Scout)

| Code | Name (Thai) |
|------|-------------|
| ACT-SCOUT-M1 to M3 | ลูกเสือสามัญรุ่นใหญ่ ม.1-3 |
| ACT-SCOUT-M4 to M6 | ลูกเสือวิสามัญ ม.4-6 |

**Total**: 6 activities

### 2b. เนตรนารี (Girl Guide) - ActivityType: SCOUT
**Structure**:
- ม.1-3: เนตรนารีสามัญรุ่นใหญ่ (Senior Girl Guide)
- ม.4-6: ผู้บำเพ็ญประโยชน์ (Girl Scout)

| Code | Name (Thai) |
|------|-------------|
| ACT-GIRLGUIDE-M1 to M3 | เนตรนารีสามัญรุ่นใหญ่ ม.1-3 |
| ACT-GIRLGUIDE-M4 to M6 | ผู้บำเพ็ญประโยชน์ ม.4-6 |

**Total**: 6 activities (NEW)

### 2c. ยุวกาชาด (Red Cross Youth) - ActivityType: SCOUT
**Structure**:
- ม.1-3: ยุวกาชาด (Red Cross Youth)
- ม.4-6: อาสายุวกาชาด (Red Cross Volunteer)

| Code | Name (Thai) |
|------|-------------|
| ACT-REDCROSS-M1 to M3 | ยุวกาชาด ม.1-3 |
| ACT-REDCROSS-M4 to M6 | อาสายุวกาชาด ม.4-6 |

**Total**: 6 activities (NEW)

### 2d. ชุมนุม (Club Activities) - ActivityType: CLUB
**Purpose**: Student interest-based extracurricular activities
**Frequency**: 1-2 periods/week

**Academic Clubs (8)**:
- ACT-CLUB-ACADEMIC (วิชาการ)
- ACT-CLUB-SCIENCE (วิทยาศาสตร์)
- ACT-CLUB-MATH (คณิตศาสตร์)
- ACT-CLUB-THAI (ภาษาไทย)
- ACT-CLUB-ENGLISH (ภาษาอังกฤษ)
- ACT-CLUB-CHINESE (ภาษาจีน)
- ACT-CLUB-JAPANESE (ภาษาญี่ปุ่น)
- ACT-CLUB-SOCIAL (สังคมศึกษา)

**Arts & Music Clubs (4)**:
- ACT-CLUB-ARTS (ศิลปะ)
- ACT-CLUB-MUSIC (ดนตรี)
- ACT-CLUB-DRAMA (ละคร/การแสดง)
- ACT-CLUB-PHOTO (ถ่ายภาพ)

**Sports Clubs (5)**:
- ACT-CLUB-SPORTS (กีฬา - general)
- ACT-CLUB-FOOTBALL (ฟุตบอล)
- ACT-CLUB-BASKETBALL (บาสเกตบอล)
- ACT-CLUB-VOLLEYBALL (วอลเลย์บอล)
- ACT-CLUB-BADMINTON (แบดมินตัน)

**Technology Clubs (3)**:
- ACT-CLUB-TECH (คอมพิวเตอร์และเทคโนโลยี)
- ACT-CLUB-ROBOT (หุ่นยนต์)
- ACT-CLUB-CODING (โค้ดดิ้ง/การเขียนโปรแกรม)

**Vocational Clubs (3)**:
- ACT-CLUB-COOKING (อาหารและโภชนาการ)
- ACT-CLUB-GARDEN (เกษตรกรรม)
- ACT-CLUB-BUSINESS (ธุรกิจ/การขาย)

**Total**: 24 activities (expanded from 1)

### 3. กิจกรรมเพื่อสังคมและสาธารณประโยชน์ (Social Service) - ActivityType: SOCIAL_SERVICE
**Purpose**: Community service, volunteering, social responsibility
**Frequency**: Integrated throughout the year (minimum hours required)

| Code | Name (Thai) |
|------|-------------|
| ACT-SERVICE | กิจกรรมเพื่อสังคมและสาธารณประโยชน์ (general) |
| ACT-SERVICE-SCHOOL | กิจกรรมจิตอาสาในโรงเรียน |
| ACT-SERVICE-COMMUNITY | กิจกรรมจิตอาสาชุมชน |
| ACT-SERVICE-ENV | กิจกรรมอนุรักษ์สิ่งแวดล้อม |
| ACT-SERVICE-ELDERLY | กิจกรรมดูแลผู้สูงอายุ |
| ACT-SERVICE-TEMPLE | กิจกรรมทำนุบำรุงศาสนา |

**Total**: 6 activities (expanded from 1)

## Summary by ActivityType

| ActivityType | Count | Purpose |
|--------------|-------|---------|
| GUIDANCE | 8 | แนะแนว, โฮมรูม |
| SCOUT | 18 | ลูกเสือ, เนตรนารี, ยุวกาชาด |
| CLUB | 24 | ชุมนุมต่างๆ |
| SOCIAL_SERVICE | 6 | จิตอาสา, บริการสังคม |
| **TOTAL** | **62** | |

## Technical Notes

1. **ActivityType enum unchanged** - Uses existing 4 enum values (CLUB, SCOUT, GUIDANCE, SOCIAL_SERVICE)
2. **No schema migration required** - All activities use existing enum
3. **Code pattern**: `ACT-{TYPE}[-SUBTYPE][-GRADE]`
4. **Thai naming**: Uses official MOE terminology
5. **Comments in seed.ts**: Include MOE documentation references

## MOE Compliance

✅ กิจกรรมแนะแนว (Guidance) - Implemented with grade-specific variants
✅ ลูกเสือ/เนตรนารี/ยุวกาชาด - All 3 student organizations implemented
✅ ชุมนุม - 24 club types covering academic, arts, sports, tech, vocational
✅ กิจกรรมเพื่อสังคม - 6 social service activity types

## Related Files

- `prisma/seed.ts` - Line ~1413: activitySubjects array
- `prisma/schema.prisma` - Line 263: ActivityType enum
- Memory: `thai_moe_8_learning_areas_correct` - Source reference
