/**
 * Datetime Utilities
 * Deterministic formatting helpers (safe for SSR + client hydration)
 */

export type DateInput = Date | string;

const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function toDate(input: DateInput): Date | null {
  const date = typeof input === "string" ? new Date(input) : input;
  return Number.isNaN(date.getTime()) ? null : date;
}

function toBangkokShiftedDate(date: Date): Date {
  // Asia/Bangkok is UTC+7 and does not observe DST.
  return new Date(date.getTime() + BANGKOK_OFFSET_MS);
}

export function formatBangkokDateTime(input: DateInput): string {
  const date = toDate(input);
  if (!date) return "";

  const shifted = toBangkokShiftedDate(date);
  const dd = pad2(shifted.getUTCDate());
  const mm = pad2(shifted.getUTCMonth() + 1);
  const yyyy = String(shifted.getUTCFullYear());
  const hh = pad2(shifted.getUTCHours());
  const min = pad2(shifted.getUTCMinutes());

  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

export function formatBangkokTime(input: DateInput): string {
  const date = toDate(input);
  if (!date) return "";

  const shifted = toBangkokShiftedDate(date);
  const hh = pad2(shifted.getUTCHours());
  const min = pad2(shifted.getUTCMinutes());

  return `${hh}:${min}`;
}

export function getBangkokGregorianYear(input: DateInput = new Date()): number {
  const date = toDate(input);
  if (!date) return 0;

  const shifted = toBangkokShiftedDate(date);
  return shifted.getUTCFullYear();
}

export function getBangkokThaiBuddhistYear(input: DateInput = new Date()): number {
  const year = getBangkokGregorianYear(input);
  return year ? year + 543 : 0;
}

export function formatThaiDateTimeBangkok(input: DateInput): string {
  const date = toDate(input);
  if (!date) return "";

  return new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatThaiDateShortBangkok(input: DateInput): string {
  const date = toDate(input);
  if (!date) return "";

  return new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatThaiDateNumericBangkok(input: DateInput): string {
  const date = toDate(input);
  if (!date) return "";

  return new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(date);
}
