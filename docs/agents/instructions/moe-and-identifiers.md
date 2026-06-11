# MOE And Identifier Rules

## Overview
Thai MOE compliance mandatory: subject metadata, curriculum totals, publish-time validations.

## SubjectCode
- Keep MOE style codes: `ท21101`, `ค21101`, `ว21101`.
- Format: `ThaiLetter + levelDigit + 3 digits`.
- Learning area letter mapping must be correct:
  - `ท` Thai, `ค` Math, `ว` Science, `ส` Social, `พ` Health/PE, `ศ` Arts, `ง` Work and Technology, `อ` Foreign languages.
- Level digit must match target grade grouping.
- Subject code mapping or validation change → add/update unit tests.

## Credits And Hours
- Grade + learning-area totals must respect MOE limits.
- Totals violate constraints → block publish.
- Validation messages deterministic, in Thai.

## Standard IDs
- TimeslotID format: `{SEMESTER}-{YEAR}-{DAY}{PERIOD}`.
- ConfigID format: `{SEMESTER}-{YEAR}`.
- No hyphen before period number in TimeslotID.

## Parsing Utilities
Always use utilities from `src/utils/timeslot-id.ts`:
- `generateTimeslotId`
- `parseTimeslotId`
- `isValidTimeslotId`
- `extractPeriodFromTimeslotId`
- `extractDayFromTimeslotId`
- `extractYearFromTimeslotId`
- `extractSemesterFromTimeslotId`
- `extractConfigIdFromTimeslotId`

No manual ID parse with `substring` or ad hoc split.

## Additional MOE Reference
- `docs/agents/THAI_MOE_CURRICULUM_RULES.md`