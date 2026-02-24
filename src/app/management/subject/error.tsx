"use client";
import RouteErrorFallback from "@/components/error/RouteErrorFallback";

export default function SubjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <RouteErrorFallback error={error} reset={reset} context="วิชา" />;
}
