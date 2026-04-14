import { MetadataRoute } from "next";
import { getBaseUrl } from "@/utils/canonical-url";

/**
 * Robots.txt Generator
 *
 * Configures web crawler behavior:
 * - Allow all crawlers to access public pages
 * - Block protected routes (dashboard, management, schedule management)
 * - Point to sitemap.xml for efficient crawling
 *
 * Uses Next.js 16 robots.ts convention
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",                    // Homepage
          "/teachers/*",          // Teacher profile pages
          "/privacy-policy",      // Legal pages
          "/about",
          "/contact",
          "/signin",              // Auth pages (for discovery, not sensitive)
          "/forgot-password",
        ],
        disallow: [
          "/dashboard/*",         // Protected: Admin dashboard
          "/management/*",        // Protected: Management interface
          "/schedule/*",          // Protected: Schedule arrangement
          "/api/*",               // API routes (no SEO value)
          "/_next/*",             // Next.js internals
          "/static/*",            // Static assets
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
