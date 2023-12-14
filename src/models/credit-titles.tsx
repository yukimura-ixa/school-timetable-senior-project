import { subject_Credit } from "@prisma/client";

type SubjectCreditWithTitles = {
  [key in subject_Credit]: string;
};

export const subjectCreditTitles: SubjectCreditWithTitles = {
  [subject_Credit.CREDIT_05]: "0.5",
  [subject_Credit.CREDIT_10]: "1.0",
  [subject_Credit.CREDIT_15]: "1.5",
  [subject_Credit.CREDIT_20]: "2.0",
};
