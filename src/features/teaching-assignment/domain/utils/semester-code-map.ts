// Semester-1 MOE course code: [learning area][level][year][running 2 digits][semester digit].
// Only true MOE codes (^[ก-ฮ][1-3]\d{4}$) ending in the semester digit 1 have a clean
// semester-2 counterpart (…1 -> …2). ปวช, ACT-*, and ว30xxx electives do not.
const S1_MOE_CODE = /^[ก-ฮ][1-3]\d{3}1$/;

export function mapSemesterCode(code: string): string | null {
  if (!S1_MOE_CODE.test(code)) return null;
  return code.slice(0, -1) + "2";
}
