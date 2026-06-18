import { MetadataRoute } from "next";
import { connection } from "next/server";
import { getBaseUrl } from "@/utils/canonical-url";

/**
 * Dynamic Sitemap Generator
 *
 * Generates sitemap.xml with the public static pages.
 *
 * Uses Next.js 16 sitemap.ts convention.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();

  const baseUrl = getBaseUrl();
  const now = new Date();

  // Static pages - public and indexable
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/signin`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  return staticPages;
}
