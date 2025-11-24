/**
 * Safely parse an integer from a string or null value.
 * Returns null if the value is null, undefined, empty string, or cannot be parsed to a valid number.
 *
 * @param value - The value to parse
 * @returns The parsed integer or null if parsing fails
 */
export function safeParseInt(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Parse an integer with a default value if parsing fails.
 *
 * @param value - The value to parse
 * @param defaultValue - The default value to return if parsing fails
 * @returns The parsed integer or the default value
 */
export function parseIntWithDefault(
  value: string | null | undefined,
  defaultValue: number,
): number {
  const parsed = safeParseInt(value);
  return parsed !== null ? parsed : defaultValue;
}
