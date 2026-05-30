"use client";

import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { Box, Stack, Typography, LinearProgress, Chip, Divider } from "@mui/material";
import {
  jsonFetcher,
  teacherScheduleKey,
  type ScheduleEntry,
} from "../../_lib/teacher-schedule";
import {
  computeProgress,
  computeRemaining,
  type RequiredSubject,
} from "../../_lib/arrange-progress";
import { useAutoArrangeResult } from "../../_lib/auto-arrange-result.store";

type Props = {
  required: RequiredSubject[];
  requiredTotal: number;
};

export default function InspectorClient({ required, requiredTotal }: Props) {
  const params = useParams();
  const searchParams = useSearchParams();
  const academicYear = params.academicYear as string;
  const semester = params.semester as string;
  const teacher = searchParams.get("teacher");

  const { data, mutate } = useSWR(
    teacherScheduleKey(teacher, academicYear, semester),
    jsonFetcher,
  );

  useEffect(() => {
    const handler = () => { void mutate(); };
    window.addEventListener("schedule-updated", handler);
    return () => window.removeEventListener("schedule-updated", handler);
  }, [mutate]);

  const entries: ScheduleEntry[] = data?.data ?? [];
  const placedBySubject = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.SubjectCode] = (acc[e.SubjectCode] ?? 0) + 1;
    return acc;
  }, {});

  const progress = computeProgress(entries.length, requiredTotal);
  const remaining = computeRemaining(required, placedBySubject);
  const failures = useAutoArrangeResult((s) => s.failures);

  return (
    <Stack spacing={2} sx={{ p: 2 }} data-testid="arrange-inspector">
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          ความคืบหน้า
        </Typography>
        <Typography variant="body2" color="text.secondary">
          จัดแล้ว {progress.placed} / {progress.required} คาบ ({progress.percent}%)
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progress.percent}
          color="success"
          sx={{ mt: 1, height: 8, borderRadius: 4 }}
        />
      </Box>

      <Divider />

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          ยังไม่ได้จัด
        </Typography>
        {remaining.length === 0 ? (
          <Typography variant="body2" color="success.main">
            จัดครบทุกวิชาแล้ว
          </Typography>
        ) : (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {remaining.map((r) => (
              <Chip
                key={r.SubjectCode}
                label={`${r.SubjectCode} · ${r.remaining} คาบ`}
                size="small"
                variant="outlined"
              />
            ))}
          </Stack>
        )}
      </Box>

      {failures.length > 0 && (
        <>
          <Divider />
          <Box>
            <Typography variant="subtitle2" color="warning.main" gutterBottom>
              ⚠ ข้อขัดแย้งจากการจัดอัตโนมัติ
            </Typography>
            <Stack spacing={0.5}>
              {failures.map((f, i) => (
                <Typography key={`${f.subjectCode}-${i}`} variant="caption" color="text.secondary">
                  {f.subjectCode}: {f.reason}
                </Typography>
              ))}
            </Stack>
          </Box>
        </>
      )}
    </Stack>
  );
}
