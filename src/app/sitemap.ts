import { MetadataRoute } from "next";
import { connection } from "next/server";

/**
 * Dynamic Sitemap Generator
 * 
 * Generates sitemap.xml with:
 * 1. Static pages (homepage, legal pages, etc.)
 * 2. Dynamic teacher profile pages from database
 * 
 * Uses Next.js 16 sitemap.ts convention
 * Updates automatically when teachers are added/removed
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://phrasongsa-timetable.vercel.app";
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

  // Dynamic teacher pages - fetch from database
  let teacherPages: MetadataRoute.Sitemap = [];
  
  try {
    // Import Prisma client
    const { prisma } = await import("@/lib/prisma");
    
    // Fetch all teachers
    const teachers = await prisma.teacher.findMany({
      select: {
        TeacherID: true,
      },
      orderBy: {
        TeacherID: "asc",
      },
    });

    // Generate URLs for teacher profile pages
    teacherPages = teachers.map((teacher) => ({
      url: `${baseUrl}/teachers/${teacher.TeacherID}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Error fetching teachers for sitemap:", error);
    // Fail gracefully - return empty array if DB query fails
    teacherPages = [];
  }

  // Combine static and dynamic pages
  return [...staticPages, ...teacherPages];
}
