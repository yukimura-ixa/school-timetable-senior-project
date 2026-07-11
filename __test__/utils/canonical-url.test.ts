import { getBaseUrl } from "@/utils/canonical-url";

describe("getBaseUrl", () => {
  const saved = { ...process.env };

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_BASE_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    delete process.env.VERCEL_URL;
  });

  afterEach(() => {
    process.env = { ...saved };
  });

  it("prefers NEXT_PUBLIC_BASE_URL over everything", () => {
    process.env.NEXT_PUBLIC_BASE_URL = "https://custom.example.com";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "prod.vercel.app";
    process.env.VERCEL_URL = "deploy-abc123.vercel.app";
    expect(getBaseUrl()).toBe("https://custom.example.com");
  });

  it("prefers the public production alias over the deployment URL", () => {
    // VERCEL_URL is the per-deployment host, which Deployment Protection
    // SSO-gates — headless PDF self-render and canonical/sitemap URLs must
    // use the public alias instead.
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "phrasongsa-timetable.vercel.app";
    process.env.VERCEL_URL = "phrasongsa-timetable-o4v8j1fny.vercel.app";
    expect(getBaseUrl()).toBe("https://phrasongsa-timetable.vercel.app");
  });

  it("falls back to VERCEL_URL when no production alias is set", () => {
    process.env.VERCEL_URL = "deploy-abc123.vercel.app";
    expect(getBaseUrl()).toBe("https://deploy-abc123.vercel.app");
  });

  it("falls back to the hardcoded production domain", () => {
    expect(getBaseUrl()).toBe("https://phrasongsa-timetable.vercel.app");
  });
});
