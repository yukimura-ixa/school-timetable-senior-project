'use client';
import { PublishReadinessResult } from "@/features/config/domain/types/publish-readiness-types";

// Stat Card Component
function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: number | string;
  subtitle: string;
  icon: string;
  color: "blue" | "green" | "purple" | "red" | "yellow";
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    red: "bg-red-50 text-red-600 border-red-200",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg border ${colorClasses[color]}`}
        >
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}


export function PublishReadinessCard({ readiness }: { readiness: PublishReadinessResult }) {
    const { status, issues } = readiness;
  
    const statusMap = {
      ready: {
        title: "Publish Readiness",
        value: "พร้อมเผยแพร่",
        subtitle: "ผ่านการตรวจสอบทั้งหมด",
        icon: "✅",
        color: "green",
      },
      incomplete: {
        title: "Publish Readiness",
        value: "ยังไม่ครบถ้วน",
        subtitle: `${issues.length} issues found`,
        icon: "⚠️",
        color: "yellow",
      },
      "moe-failed": {
        title: "Publish Readiness",
        value: "ไม่ผ่านเกณฑ์",
        subtitle: `${issues.length} issues found`,
        icon: "❌",
        color: "red",
      },
      conflicts: {
          title: "Publish Readiness",
          value: "มีความขัดแย้ง",
          subtitle: `${issues.length} issues found`,
          icon: "⚠️",
          color: "yellow",
      },
      unknown: {
          title: "Publish Readiness",
          value: "ไม่ทราบ",
          subtitle: "ไม่สามารถตรวจสอบได้",
          icon: "❓",
          color: "blue",
      }
    };
  
    const currentStatus = statusMap[status];
  
    return (
      <StatCard
        title={currentStatus.title}
        value={currentStatus.value}
        subtitle={currentStatus.subtitle}
        icon={currentStatus.icon}
        color={currentStatus.color as "blue" | "green" | "purple" | "red" | "yellow"}
      />
    );
  }
  
  export function ReadinessIssues({ issues }: { issues: string[] }) {
    if (issues.length === 0) {
      return null;
    }
  
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-yellow-900">
          ⚠️ ประเด็นที่ต้องดำเนินการก่อนเผยแพร่
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          {issues.map((issue, index) => (
            <li key={index} className="text-sm text-yellow-800">
              {issue}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  