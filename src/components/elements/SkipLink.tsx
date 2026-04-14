/**
 * SkipLink Component
 * Provides keyboard users a way to skip navigation and jump directly to main content
 * Follows WCAG 2.1 Level A requirement for bypass blocks
 */

interface SkipLinkProps {
  /** ID of the main content element to skip to */
  targetId?: string;
  /** Link text (default: "ข้ามไปยังเนื้อหาหลัก") */
  children?: React.ReactNode;
}

export function SkipLink({
  targetId = "main-content",
  children = "ข้ามไปยังเนื้อหาหลัก",
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      {children}
    </a>
  );
}
