// Semester-1 MOE course code: [area][level][year][running 2 digits][semester digit].
// Only codes matching ^[ก-ฮ][1-3][1-9]\d{2}1$ (non-zero year digit, ending in the
// semester digit 1) have a clean …1 -> …2 counterpart. ปวช, ACT-*, and ว30xxx
// cross-year electives (year digit 0) do not.
const S1_MOE_CODE = /^[ก-ฮ][1-3][1-9]\d{2}1$/;

export function mapSemesterCode(code: string): string | null {
  if (!S1_MOE_CODE.test(code)) return null;
  return code.slice(0, -1) + "2";
}
