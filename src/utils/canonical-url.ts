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
    // Precedence:
    //   1) NEXT_PUBLIC_BASE_URL (custom domain override)
    //   2) VERCEL_URL           (auto-set by Vercel; needs https:// prefix)
    //   3) hardcoded production fallback
    return (
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "https://phrasongsa-timetable.vercel.app")
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
  const canonicalUrl = getCanonicalUrl(path);
  const siteName = "ระบบตารางเรียนโรงเรียนพระซองสามัคคีวิทยา";

  // Only attach image metadata when the caller supplies an image.
  // Previously defaulted to `${baseUrl}/og-image.png`, which 404s because
  // no such asset ships in /public.
  const imagesBlock = image
    ? {
        openGraph: {
          images: [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: title,
            },
          ],
        },
        twitter: { images: [image] },
      }
    : { openGraph: {}, twitter: {} };

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
      ...imagesBlock.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...imagesBlock.twitter,
    },
  };
}
