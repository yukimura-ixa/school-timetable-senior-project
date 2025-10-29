"use client";
import React from "react";
import type { program } from "@/prisma/generated";
import useSWR from "swr";
import { useParams } from "next/navigation";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import Link from "next/link";
import { Box } from "@mui/material";
import {
  CardSkeleton,
  NoDataEmptyState,
  NetworkErrorEmptyState,
} from "@/components/feedback";
import ProgramEditableTable from "../component/ProgramEditableTable";

// Server Actions (Clean Architecture)
import { getProgramsByYearAction } from "@/features/program/application/actions/program.actions";

function StudyProgram() {
  const params = useParams();
  const yearNum = Number(params.year?.toString() ?? "0");

  // Fetch programs using Server Action
  const swr = useSWR<program[]>(
    ["programs-year", String(yearNum)],
    async () => {
      const result = await getProgramsByYearAction({ Year: yearNum });
      return result?.data ?? [];
    }
  );

  if (swr.isLoading) {
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, py: 2 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Box key={i} sx={{ width: '49%' }}>
            <CardSkeleton />
          </Box>
        ))}
      </Box>
    );
  }

  if (swr.error) {
    return <NetworkErrorEmptyState onRetry={() => { void swr.mutate(); }} />;
  }

  if (!swr.data || swr.data.length === 0) {
    return <NoDataEmptyState />;
  }

  return (
    <>

      {/* <AllStudyProgram /> */}
      <div className="flex justify-between my-4">
        <h1 className="text-xl font-bold">
          หลักสูตรมัธยมศึกษาปีที่ {yearNum}
        </h1>
        <Link
          href={"/management/program"}
          className="flex gap-3 cursor-pointer"
        >
          <KeyboardBackspaceIcon />
          <p className="text-sm">ย้อนกลับ</p>
        </Link>
      </div>
      <div className="py-4">
        {swr.data && (
          <ProgramEditableTable
            year={yearNum}
            rows={swr.data}
            mutate={() => { void swr.mutate(); }}
          />
        )}
      </div>
    </>
  );
}

export default StudyProgram;
