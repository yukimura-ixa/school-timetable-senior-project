"use client";

import * as React from "react";
import { Backdrop, CircularProgress, Stack, Typography } from "@mui/material";

export default function Loading() {
  return (
    <Backdrop open sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}>
      <Stack spacing={2} alignItems="center">
        <CircularProgress color="inherit" thickness={4} size={56} />
        <Typography variant="body2" sx={{ opacity: 0.9, textAlign: "center" }}>
          กำลังโหลดข้อมูล...
          <br />
          ขั้นตอนนี้จะใช้เวลาเพียงชั่วครู่ กรุณาอย่าเพิ่งปิดหน้านี้
        </Typography>
      </Stack>
    </Backdrop>
  );
}