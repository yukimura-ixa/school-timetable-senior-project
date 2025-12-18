import { Box, Container, Grid, Paper, Typography } from "@mui/material";
import Link from "next/link";
import GroupIcon from "@mui/icons-material/Group";
import SubjectIcon from "@mui/icons-material/MenuBook";
import ClassIcon from "@mui/icons-material/Class";
import SchoolIcon from "@mui/icons-material/School";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import EmailIcon from "@mui/icons-material/Email";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "จัดการระบบ - Phrasongsa Timetable",
  description: "เมนูจัดการข้อมูลพื้นฐานของระบบจัดตารางเรียนตารางสอน",
};

interface ManagementCard {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}

const managementPages: ManagementCard[] = [
  {
    title: "จัดการครู",
    description: "เพิ่ม แก้ไข ลบข้อมูลครูผู้สอน",
    href: "/management/teacher",
    icon: <GroupIcon sx={{ fontSize: 48 }} />,
    color: "from-blue-500 to-blue-600",
  },
  {
    title: "มอบหมายครูผู้สอน",
    description: "กำหนดครูผู้สอนแต่ละวิชาตามระดับชั้น",
    href: "/management/teacher-assignment",
    icon: <AssignmentIndIcon sx={{ fontSize: 48 }} />,
    color: "from-purple-500 to-purple-600",
  },
  {
    title: "จัดการวิชา",
    description: "เพิ่ม แก้ไข ลบข้อมูลรายวิชา",
    href: "/management/subject",
    icon: <SubjectIcon sx={{ fontSize: 48 }} />,
    color: "from-green-500 to-green-600",
  },
  {
    title: "จัดการระดับชั้น",
    description: "เพิ่ม แก้ไข ลบข้อมูลระดับชั้นเรียน",
    href: "/management/gradelevel",
    icon: <ClassIcon sx={{ fontSize: 48 }} />,
    color: "from-orange-500 to-orange-600",
  },
  {
    title: "จัดการแผนการเรียน",
    description: "เพิ่ม แก้ไข ลบข้อมูลแผนการเรียน",
    href: "/management/program",
    icon: <SchoolIcon sx={{ fontSize: 48 }} />,
    color: "from-cyan-500 to-cyan-600",
  },
  {
    title: "จัดการห้องเรียน",
    description: "เพิ่ม แก้ไข ลบข้อมูลห้องเรียน",
    href: "/management/rooms",
    icon: <MeetingRoomIcon sx={{ fontSize: 48 }} />,
    color: "from-pink-500 to-pink-600",
  },
  {
    title: "Email Outbox",
    description: "ตรวจสอบลิงก์ยืนยันอีเมล (Admin เท่านั้น)",
    href: "/management/email-outbox",
    icon: <EmailIcon sx={{ fontSize: 48 }} />,
    color: "from-slate-500 to-slate-600",
  },
];

export default function ManagementIndexPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          จัดการระบบ
        </Typography>
        <Typography variant="body1" color="text.secondary">
          เลือกเมนูด้านล่างเพื่อจัดการข้อมูลพื้นฐานของระบบ
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {managementPages.map((page) => (
          <Grid key={page.href} size={{ xs: 12, sm: 6, md: 4 }}>
            <Link href={page.href} style={{ textDecoration: "none" }}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    elevation: 8,
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${page.color.split(" ")[1]} 0%, ${page.color.split(" ")[3]} 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    mb: 2,
                  }}
                >
                  {page.icon}
                </Box>
                <Typography
                  variant="h6"
                  component="h2"
                  fontWeight="bold"
                  gutterBottom
                >
                  {page.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {page.description}
                </Typography>
              </Paper>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
