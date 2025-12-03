# MOE Subject Code Format in Seed Data

## Updated: 2025

The `prisma/seed.ts` file now uses authentic Thai Ministry of Education (MOE) subject codes instead of simplified English codes.

## MOE Subject Code Format (6 Characters)

```
[Area][Level][Year][Type][Sequence]
```

### Position 1: Learning Area Code (กลุ่มสาระการเรียนรู้)
| Code | Thai | English |
|------|------|---------|
| ท | ภาษาไทย | Thai Language |
| ค | คณิตศาสตร์ | Mathematics |
| ว | วิทยาศาสตร์และเทคโนโลยี | Science & Technology |
| ส | สังคมศึกษา ศาสนา และวัฒนธรรม | Social Studies |
| พ | สุขศึกษาและพลศึกษา | Health & PE |
| ศ | ศิลปะ | Arts |
| ง | การงานอาชีพ | Career & Technology |
| อ | ภาษาอังกฤษ | English |
| จ | ภาษาจีน | Chinese |
| ญ | ภาษาญี่ปุ่น | Japanese |

### Position 2: Education Level
- `2` = Lower Secondary (มัธยมศึกษาตอนต้น ม.1-3)
- `3` = Upper Secondary (มัธยมศึกษาตอนปลาย ม.4-6)

### Position 3: Year within Level
- `1` = Year 1 (ม.1 or ม.4)
- `2` = Year 2 (ม.2 or ม.5)
- `3` = Year 3 (ม.3 or ม.6)
- `0` = Any year (for electives)

### Position 4: Subject Type
- `1` = Core/Required (รายวิชาพื้นฐาน)
- `2` = Elective/Additional (รายวิชาเพิ่มเติม)

### Positions 5-6: Sequence Number (01-99)

## Examples

### Core Subjects (รายวิชาพื้นฐาน)
```
ท21101 = ภาษาไทย พื้นฐาน 1 (Thai, M.1, Core, Subject 01)
ค22101 = คณิตศาสตร์ พื้นฐาน 2 (Math, M.2, Core, Subject 01)
ว31101 = วิทยาศาสตร์และเทคโนโลยี พื้นฐาน 4 (Science, M.4, Core, Subject 01)
```

### Elective Subjects (รายวิชาเพิ่มเติม)
```
ค21201 = คณิตศาสตร์เพิ่มเติม 1 (Math Elective, M.1, Subject 01)
ว31201 = ฟิสิกส์ 1 (Physics, M.4, Elective, Subject 01)
จ31201 = ภาษาจีน 1 (Chinese, M.4, Elective, Subject 01)
```

## Subject Mapping (Old → New)

| Old Code | New Code | Subject Name |
|----------|----------|--------------|
| TH101 | ท21101 | ภาษาไทย พื้นฐาน 1 |
| MA101 | ค21101 | คณิตศาสตร์ พื้นฐาน 1 |
| SC101 | ว21101 | วิทยาศาสตร์และเทคโนโลยี พื้นฐาน 1 |
| SO101 | ส21101 | สังคมศึกษา ศาสนาและวัฒนธรรม 1 |
| PE101 | พ21101 | สุขศึกษาและพลศึกษา 1 |
| AR101 | ศ21101 | ศิลปะ พื้นฐาน 1 |
| CA101 | ง21101 | การงานอาชีพ พื้นฐาน 1 |
| EN101 | อ21101 | ภาษาอังกฤษ พื้นฐาน 1 |
| MA102 | ค21201 | คณิตศาสตร์เพิ่มเติม 1 |
| SC102 | ว21201 | วิทยาศาสตร์เพิ่มเติม 1 |
| CH401 | จ31201 | ภาษาจีน 1 |

## Credit Allocation (Per MOE Standard)

| Level | Thai/Math/Science | Social/PE/Arts/Career/English |
|-------|-------------------|-------------------------------|
| M.1-3 | 1.5 credits | 1.0 credit |
| M.4-6 | 1.0 credit | 0.5-1.0 credit |

Formula: 2 periods/week = 1.0 credit per semester (40 periods total)

## Activity Subjects

Activity subjects retain the `ACT-` prefix as they are internal identifiers without official MOE codes:
- `ACT-CLUB` - ชุมนุม (Club activities)
- `ACT-SCOUT-M1` through `ACT-SCOUT-M6` - ลูกเสือ (Scout activities)
- `ACT-GUIDE` - แนะแนว (Guidance)
- `ACT-SERVICE` - กิจกรรมเพื่อสังคมและสาธารณประโยชน์

## Source Documents

- Thai thesis PDF `63070046-63070056.pdf` Section 2.2 "การกำหนดรหัสวิชา"
- Serena memory `thai_moe_8_learning_areas_correct`
