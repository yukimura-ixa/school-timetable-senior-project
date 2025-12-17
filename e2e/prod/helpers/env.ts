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
  return process.env.E2E_SEMESTER_ID ?? process.env.SEMESTER_ID ?? "1-2567";
}

export function getAdminCredentials(): { email: string; password: string } {
  return {
    email: requireEnv("E2E_ADMIN_EMAIL"),
    password: requireEnv("E2E_ADMIN_PASSWORD"),
  };
}

