export interface FundamentalTemplateRow {
  Year: number;
  SubjectCode: string;
  MinCredits: number;
  MaxCredits: number | null;
  SortOrder: number;
}

// Source of truth: prisma/seed.ts CORE catalog (Thai MOE codes).
// Junior (M1-M3): Thai/Math/Science = 1.5 credits; Social/Health/Arts/Career/English = 1.0;
// history + civics carry 0.5 each so SOCIAL reaches the 2.0/semester MOE minimum.
// Senior (M4-M6): all CORE = 1.0 except Arts/Career at 0.5 (MOE minimum per semester).
const JUNIOR_15 = ["ท", "ค", "ว"]; // Thai, Math, Science prefixes carry 1.5 in junior
// MinCredits must equal subject.Credit in the catalog (seed-effective-parity pins this).
const HALF_CREDIT = new Set([
  "ส21102", "ส21103", "ส22102", "ส22103", "ส23102", "ส23103", // junior history/civics
  "ศ31101", "ง31101", "ศ32101", "ง32101", "ศ33101", "ง33101", // senior arts/career
]);
const r = (
  year: number,
  codes: string[],
  creditFor: (code: string) => number,
): FundamentalTemplateRow[] =>
  codes.map((SubjectCode, i) => ({
    Year: year,
    SubjectCode,
    MinCredits: creditFor(SubjectCode),
    MaxCredits: null,
    SortOrder: i + 1,
  }));

const juniorCredit = (code: string) =>
  HALF_CREDIT.has(code) ? 0.5 : JUNIOR_15.includes(code[0]) ? 1.5 : 1.0;
const seniorCredit = (code: string) => (HALF_CREDIT.has(code) ? 0.5 : 1.0);

export const FUNDAMENTALS: FundamentalTemplateRow[] = [
  ...r(1, ["ท21101", "ค21101", "ว21101", "ส21101", "ส21102", "ส21103", "พ21101", "ศ21101", "ง21101", "อ21101"], juniorCredit),
  ...r(2, ["ท22101", "ค22101", "ว22101", "ส22101", "ส22102", "ส22103", "พ22101", "ศ22101", "ง22101", "อ22101"], juniorCredit),
  ...r(3, ["ท23101", "ค23101", "ว23101", "ส23101", "ส23102", "ส23103", "พ23101", "ศ23101", "ง23101", "อ23101"], juniorCredit),
  ...r(4, ["ท31101", "ค31101", "ว31101", "ส31101", "พ31101", "ศ31101", "ง31101", "อ31101"], seniorCredit),
  ...r(5, ["ท32101", "ค32101", "ว32101", "ส32101", "พ32101", "ศ32101", "ง32101", "อ32101"], seniorCredit),
  ...r(6, ["ท33101", "ค33101", "ว33101", "ส33101", "พ33101", "ศ33101", "ง33101", "อ33101"], seniorCredit),
];
