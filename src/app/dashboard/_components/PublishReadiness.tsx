"use client";
import { useState } from "react";
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

export function PublishReadinessCard({
  readiness,
}: {
  readiness: PublishReadinessResult;
}) {
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
    },
  };

  const currentStatus = statusMap[status];

  return (
    <StatCard
      title={currentStatus.title}
      value={currentStatus.value}
      subtitle={currentStatus.subtitle}
      icon={currentStatus.icon}
      color={
        currentStatus.color as "blue" | "green" | "purple" | "red" | "yellow"
      }
    />
  );
}

const COLLAPSED_COUNT = 3;

export function ReadinessIssues({ issues }: { issues: string[] }) {
  const [expanded, setExpanded] = useState(false);

  if (issues.length === 0) return null;

  const visible = expanded ? issues : issues.slice(0, COLLAPSED_COUNT);
  const hidden = issues.length - COLLAPSED_COUNT;

  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 shadow-sm">
      <div className="flex items-center justify-between px-5 py-3 border-b border-yellow-200">
        <h2 className="text-sm font-semibold text-yellow-900">
          ⚠️ ประเด็นที่ต้องดำเนินการก่อนเผยแพร่
        </h2>
        <span className="text-xs font-medium text-yellow-700 bg-yellow-100 border border-yellow-200 rounded-full px-2 py-0.5">
          {issues.length} รายการ
        </span>
      </div>
      <ul className="divide-y divide-yellow-100">
        {visible.map((issue, index) => (
          <li key={index} className="px-5 py-2 text-sm text-yellow-800">
            {issue}
          </li>
        ))}
      </ul>
      {issues.length > COLLAPSED_COUNT && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full px-5 py-2 text-xs font-medium text-yellow-700 hover:bg-yellow-100 transition-colors border-t border-yellow-200 text-left"
        >
          {expanded ? "▲ แสดงน้อยลง" : `▼ แสดงเพิ่มเติมอีก ${hidden} รายการ`}
        </button>
      )}
    </div>
  );
}
