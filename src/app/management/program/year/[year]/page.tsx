"use client";
import React from "react";
import type { program } from @/prisma/generated/client";
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
import ProgramEditableTable from "../../component/ProgramEditableTable";

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

  const programs = swr.data ?? [];

  return (
    <>
      <div className="flex justify-start p-4">
        <Link href="/management/program">
          <button className="hover:bg-slate-300 active:bg-slate-400 p-2 rounded bg-slate-100 transition-all duration-200">
            <KeyboardBackspaceIcon />
            <span className="ml-2">กลับ</span>
          </button>
        </Link>
      </div>
      <div className="w-full h-full flex justify-center">
        <Box className="w-[95%] max-w-[1400px]">
          <h1 className="text-2xl font-semibold my-4">
            หลักสูตรทั้งหมด (มัธยมศึกษาปีที่ {yearNum})
          </h1>
          {swr.isLoading && <CardSkeleton />}

          {swr.error && (
            <div className="flex justify-center items-center">
              <NetworkErrorEmptyState />
            </div>
          )}

          {!swr.isLoading && !swr.error && programs.length === 0 && (
            <div className="flex justify-center items-center">
              <NoDataEmptyState
                entityName={`หลักสูตรสำหรับมัธยมศึกษาปีที่ ${yearNum}`}
              />
            </div>
          )}

          {!swr.isLoading && !swr.error && programs.length > 0 && (
            <div className="my-4">
              <ProgramEditableTable
                year={yearNum}
                rows={programs}
                mutate={() => { void swr.mutate(); }}
              />
            </div>
          )}
        </Box>
      </div>
    </>
  );
}

export default StudyProgram;
