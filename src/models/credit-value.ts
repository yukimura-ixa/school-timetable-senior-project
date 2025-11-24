// Define subject_credit locally to avoid importing Prisma Client in client-side code
export const subject_credit = {
  CREDIT_05: "CREDIT_05",
  CREDIT_10: "CREDIT_10",
  CREDIT_15: "CREDIT_15",
  CREDIT_20: "CREDIT_20",
} as const;

export type subject_credit =
  (typeof subject_credit)[keyof typeof subject_credit];

export type SubjectCreditValues = {
  [key in subject_credit]: number;
};

export const subjectCreditValues: SubjectCreditValues = {
  [subject_credit.CREDIT_05]: 0.5,
  [subject_credit.CREDIT_10]: 1.0,
  [subject_credit.CREDIT_15]: 1.5,
  [subject_credit.CREDIT_20]: 2.0,
};
