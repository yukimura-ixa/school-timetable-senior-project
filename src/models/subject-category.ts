// Define SubjectCategory locally to avoid importing Prisma Client in client-side code
export const SubjectCategory = {
  CORE: "CORE",
  ADDITIONAL: "ADDITIONAL",
  ACTIVITY: "ACTIVITY",
} as const;

export type SubjectCategory =
  (typeof SubjectCategory)[keyof typeof SubjectCategory];
