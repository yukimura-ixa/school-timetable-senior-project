"use client";

import { useState } from "react";
import type { program } from "@/prisma/generated/client";
import { ProgramDataGrid } from "../../component/ProgramDataGrid";
import { useRouter } from "next/navigation";
import { getProgramsByYearAction } from "@/features/program/application/actions/program.actions";

interface ProgramYearPageClientProps {
  year: number;
  initialData: program[];
}

export function ProgramYearPageClient({
  year,
  initialData,
}: ProgramYearPageClientProps) {
  const [programs, setPrograms] = useState<program[]>(initialData);
  const router = useRouter();

  // Mutation callback - refetch data after mutations
  const handleMutate = async () => {
    const result = await getProgramsByYearAction({ Year: year });
    if (result.success) {
      setPrograms(result.data);
    }
    router.refresh();
  };

  return (
    <ProgramDataGrid
      year={year}
      initialData={programs}
      onMutate={handleMutate}
    />
  );
}
