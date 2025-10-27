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
import ProgramTable from "../component/ProgramTable";
import type { ProgramRow } from "../component/ProgramTable";

// Server Actions (Clean Architecture)
import { getProgramsByYearAction } from "@/features/program/application/actions/program.actions";

type Props = {};

function StudyProgram(props: Props) {
  const params = useParams(); //get params

  // Fetch programs using Server Action
  const { data, isLoading, error, mutate } = useSWR(
    `programs-year-${params.year}`,
    async () => {
      try {
        const result = await getProgramsByYearAction({
          Year: parseInt(params.year.toString()),
        });
        return result?.data ?? [];
      } catch (error) {
        console.error("Error fetching programs:", error);
        return [];
      }
    },
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, py: 2 }}>
        {[...Array(4)].map((_, i) => (
          <Box key={i} sx={{ width: '49%' }}>
            <CardSkeleton />
          </Box>
        ))}
      </Box>
    );
  }

  if (error) {
    return <NetworkErrorEmptyState onRetry={() => mutate()} />;
  }

  if (!data || data.length === 0) {
    return <NoDataEmptyState />;
  }

  return (
    <>

      {/* <AllStudyProgram /> */}
      <div className="flex justify-between my-4">
        <h1 className="text-xl font-bold">
          หลักสูตรมัธยมศึกษาปีที่ {params.year}
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
        <ProgramTable
          year={parseInt(params.year.toString())}
          rows={data as ProgramRow[]}
          mutate={mutate}
        />
      </div>
    </>
  );
}

export default StudyProgram;
