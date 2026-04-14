# MOE And Identifier Rules

## Overview
Thai MOE compliance is mandatory for subject metadata, curriculum totals, and publish-time validations.

## SubjectCode
- Keep MOE style codes such as `ท21101`, `ค21101`, `ว21101`.
- Format: `ThaiLetter + levelDigit + 3 digits`.
- Learning area letter mapping must be correct:
  - `ท` Thai, `ค` Math, `ว` Science, `ส` Social, `พ` Health/PE, `ศ` Arts, `ง` Work and Technology, `อ` Foreign languages.
- Level digit must match target grade grouping.
- Add or update unit tests when subject code mapping or validation changes.

## Credits And Hours
- Grade and learning-area totals must respect MOE limits.
- Publishing must be blocked when totals violate constraints.
- Validation messaging must be deterministic and in Thai.

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

Do not parse IDs manually with `substring` or ad hoc splitting.

## Additional MOE Reference
- `docs/agents/THAI_MOE_CURRICULUM_RULES.md`
