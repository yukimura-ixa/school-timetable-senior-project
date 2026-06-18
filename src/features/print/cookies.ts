export type PuppeteerCookie = { name: string; value: string; domain: string; path: string };

export function parseCookieHeader(
  header: string | null,
  domain: string,
): PuppeteerCookie[] {
  if (!header) return [];
  return header
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((pair) => {
      const eq = pair.indexOf("=");
      const name = pair.slice(0, eq).trim();
      const value = pair.slice(eq + 1).trim();
      return { name, value, domain, path: "/" };
    })
    .filter((c) => c.name.length > 0);
}
