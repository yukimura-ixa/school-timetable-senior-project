/**
 * Canonical URL utilities for SEO
 * 
 * Ensures consistent URL formatting across the application
 * and proper canonical link tags for search engines.
 */

/**
 * Get the base URL for the application
 * Uses environment variable or defaults to production URL
 */
export function getBaseUrl(): string {
  // For server-side
  if (typeof window === "undefined") {
    return (
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "https://phrasongsa-timetable.vercel.app"
    );
  }
  
  // For client-side (if ever needed)
  return window.location.origin;
}

/**
 * Generate a canonical URL for a given path
 * @param path - The path relative to the base URL (e.g., "/about" or "about")
 * @returns Full canonical URL
 */
export function getCanonicalUrl(path: string): string {
  const baseUrl = getBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

/**
 * Generate metadata with canonical URL
 * Convenience function for creating Next.js metadata objects
 */
export function createMetadataWithCanonical({
  title,
  description,
  path,
  robots,
}: {
  title: string;
  description: string;
  path: string;
  robots?: { index: boolean; follow: boolean };
}) {
  return {
    title,
    description,
    alternates: {
      canonical: getCanonicalUrl(path),
    },
    robots: robots || { index: true, follow: true },
  };
}

/**
 * Generate comprehensive metadata with SEO and social tags
 * Includes canonical URL, Open Graph, and Twitter Card metadata
 */
export function createMetadataWithSocial({
  title,
  description,
  path,
  robots,
  image,
}: {
  title: string;
  description: string;
  path: string;
  robots?: { index: boolean; follow: boolean };
  image?: string;
}) {
  const baseUrl = getBaseUrl();
  const canonicalUrl = getCanonicalUrl(path);
  const siteName = "ระบบตารางเรียนโรงเรียนพระซองสามัคคีวิทยา";
  
  // Default OG image if none provided
  const ogImage = image || `${baseUrl}/og-image.png`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: robots || { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName,
      locale: "th_TH",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
