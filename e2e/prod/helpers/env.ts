export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[PROD E2E] Missing required environment variable: ${name}`,
    );
  }
  return value;
}

export function getProdBaseURL(): string {
  return (
    process.env.E2E_BASE_URL ??
    process.env.BASE_URL ??
    "https://phrasongsa-timetable.vercel.app"
  );
}

export function getSemesterId(): string {
  const raw =
    process.env.E2E_SEMESTER_ID ?? process.env.SEMESTER_ID ?? "1-2567";
  if (raw.includes("/")) {
    const [year, semesterNum] = raw.split("/");
    return `${semesterNum}-${year}`;
  }
  return raw;
}

export function getSemesterRouteParts(): {
  academicYear: string;
  semester: string;
} {
  const raw =
    process.env.E2E_SEMESTER_ID ?? process.env.SEMESTER_ID ?? "1-2567";
  if (raw.includes("/")) {
    const [year, semesterNum] = raw.split("/");
    return { academicYear: year, semester: semesterNum };
  }
  if (raw.includes("-")) {
    const [semesterNum, year] = raw.split("-");
    return { academicYear: year, semester: semesterNum };
  }
  return { academicYear: raw, semester: "" };
}

export function getAdminCredentials(): { email: string; password: string } {
  return {
    email: requireEnv("E2E_ADMIN_EMAIL"),
    password: requireEnv("E2E_ADMIN_PASSWORD"),
  };
}

