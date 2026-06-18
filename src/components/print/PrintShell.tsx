import "@/app/print.css";
import type { ReactNode } from "react";

export function PrintShell({
  title,
  orientation = "portrait",
  children,
}: {
  title: string;
  orientation?: "portrait" | "landscape";
  children: ReactNode;
}) {
  return (
    <div className="print-shell">
      <style>{`@page { size: A4 ${orientation}; margin: 10mm; }`}</style>
      <h1 className="print-title">{title}</h1>
      {children}
    </div>
  );
}
