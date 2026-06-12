/**
 * Sanitize a post-login `callbackUrl` into a safe, app-internal path.
 *
 * `callbackUrl` is attacker-influenceable (it travels in the URL), so echoing
 * it into a redirect unchecked would be an open-redirect. Only same-origin
 * absolute paths are allowed; everything else falls back to the default.
 *
 * Rejected: absolute URLs with a scheme/host, protocol-relative `//host`,
 * backslash tricks (`/\host`) that browsers normalize to `//`, values with
 * control characters/whitespace, and loops back to `/signin`.
 */
export function safeCallbackPath(
  raw: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return fallback;

  // Reject control characters, raw whitespace, and DEL — they can smuggle a
  // second URL or break out of the path. Encoded forms (e.g. %20) are fine.
  for (let i = 0; i < raw.length; i++) {
    const code = raw.charCodeAt(i);
    if (code <= 0x20 || code === 0x7f) return fallback;
  }

  if (raw === "/signin" || raw.startsWith("/signin?") || raw.startsWith("/signin/")) {
    return fallback;
  }
  return raw;
}
