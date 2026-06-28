import React from "react";
import { Box, Typography } from "@mui/material";
import { PublishReadinessCard } from "@/features/config/presentation/components/PublishReadinessCard";

type Props = {
  params: Promise<{ academicYear: string; semester: string }>;
};

export default async function PublishPage({ params }: Props) {
  const { academicYear: academicYearStr, semester: semesterStr } = await params;
  const semester = parseInt(semesterStr, 10);
  const academicYear = parseInt(academicYearStr, 10);
  const configId = `${semester}-${academicYear}`;

  return (
    <Box sx={{ my: 5 }}>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        เผยแพร่ตาราง
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
        ตรวจความพร้อมก่อนเผยแพร่ — ทุกระดับชั้นต้องจัดครบและผ่านเกณฑ์ ศธ.
      </Typography>
      <PublishReadinessCard configId={configId} />
    </Box>
  );
}
