/**
 * Not Found Page for Schedule Semester Routes
 * Displayed when a user navigates to a non-existent semester
 */

import Link from "next/link";
import { Typography, Paper, Container, Box } from "@mui/material";
import { Error as ErrorIcon, Home as HomeIcon } from "@mui/icons-material";

export default function NotFound() {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: "center",
          border: "1px solid",
          borderColor: "error.light",
          borderRadius: 2,
        }}
      >
        <ErrorIcon
          sx={{
            fontSize: 64,
            color: "error.main",
            mb: 2,
          }}
        />
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          ไม่พบภาคเรียน
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          ไม่พบข้อมูลภาคเรียนที่ต้องการ กรุณาเลือกภาคเรียนจากหน้าหลัก
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          The semester you&apos;re looking for doesn&apos;t exist or hasn&apos;t
          been created yet.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              backgroundColor: "#1976d2",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 500,
              fontSize: "0.9375rem",
            }}
          >
            <HomeIcon />
            กลับหน้าหลัก
          </Link>
        </Box>
      </Paper>
    </Container>
  );
}
