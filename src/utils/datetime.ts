/**
 * Datetime Utilities
 * Deterministic formatting helpers (safe for SSR + client hydration)
 */

export type DateInput = Date | string;

const BANGKOK_TIME_ZONE = "Asia/Bangkok";
const EN_NUMERIC_LOCALE = "en-GB";

const BANGKOK_DATE_TIME_FORMATTER = new Intl.DateTimeFormat(EN_NUMERIC_LOCALE, {
  timeZone: BANGKOK_TIME_ZONE,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const BANGKOK_TIME_FORMATTER = new Intl.DateTimeFormat(EN_NUMERIC_LOCALE, {
  timeZone: BANGKOK_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const BANGKOK_YEAR_FORMATTER = new Intl.DateTimeFormat(EN_NUMERIC_LOCALE, {
  timeZone: BANGKOK_TIME_ZONE,
  year: "numeric",
});

const THAI_DATE_TIME_FORMATTER = new Intl.DateTimeFormat("th-TH", {
  timeZone: BANGKOK_TIME_ZONE,
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const THAI_DATE_SHORT_FORMATTER = new Intl.DateTimeFormat("th-TH", {
  timeZone: BANGKOK_TIME_ZONE,
  year: "numeric",
  month: "short",
  day: "numeric",
});

const THAI_DATE_NUMERIC_FORMATTER = new Intl.DateTimeFormat("th-TH", {
  timeZone: BANGKOK_TIME_ZONE,
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

const TIME_ONLY_PATTERN = /^(\d{1,2}):(\d{2})/;

function toDate(input: DateInput): Date | null {
  const date = typeof input === "string" ? new Date(input) : input;
  return Number.isNaN(date.getTime()) ? null : date;
}

type DateParts = Partial<Record<Intl.DateTimeFormatPartTypes, string>>;

function getDateParts(formatter: Intl.DateTimeFormat, date: Date): DateParts {
  const parts: DateParts = {};
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== "literal") {
      parts[part.type] = part.value;
    }
  }
  return parts;
}

export function formatBangkokDateTime(input: DateInput): string {
  const date = toDate(input);
  if (!date) return "";

  const { day, month, year, hour, minute } = getDateParts(
    BANGKOK_DATE_TIME_FORMATTER,
    date,
  );
  if (!day || !month || !year || !hour || !minute) return "";

  return `${day}/${month}/${year} ${hour}:${minute}`;
}

export function formatBangkokTime(input: DateInput): string {
  const date = toDate(input);
  if (!date) return "";

  const { hour, minute } = getDateParts(BANGKOK_TIME_FORMATTER, date);
  if (!hour || !minute) return "";

  return `${hour}:${minute}`;
}

export function formatTimeslotTimeUtc(input: DateInput): string {
  if (typeof input === "string") {
    const match = input.match(TIME_ONLY_PATTERN);
    if (match) {
      const hours = (match[1] ?? "").padStart(2, "0");
      const minutes = match[2] ?? "00";
      return `${hours}:${minutes}`;
    }
  }

  const date = toDate(input);
  if (!date) return "";

  const { hour, minute } = getDateParts(BANGKOK_TIME_FORMATTER, date);
  if (!hour || !minute) return "";

  return `${hour}:${minute}`;
}

export function getBangkokGregorianYear(input: DateInput = new Date()): number {
  const date = toDate(input);
  if (!date) return 0;

  const { year } = getDateParts(BANGKOK_YEAR_FORMATTER, date);
  const parsedYear = year ? Number.parseInt(year, 10) : Number.NaN;

  return Number.isNaN(parsedYear) ? 0 : parsedYear;
}

export function getBangkokThaiBuddhistYear(input: DateInput = new Date()): number {
  const year = getBangkokGregorianYear(input);
  return year ? year + 543 : 0;
}

export function formatThaiDateTimeBangkok(input: DateInput): string {
  const date = toDate(input);
  if (!date) return "";

  return THAI_DATE_TIME_FORMATTER.format(date);
}

export function formatThaiDateShortBangkok(input: DateInput): string {
  const date = toDate(input);
  if (!date) return "";

  return THAI_DATE_SHORT_FORMATTER.format(date);
}

export function formatThaiDateNumericBangkok(input: DateInput): string {
  const date = toDate(input);
  if (!date) return "";

  return THAI_DATE_NUMERIC_FORMATTER.format(date);
}
