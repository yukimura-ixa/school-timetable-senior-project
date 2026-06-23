import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import GroupsIcon from "@mui/icons-material/Groups";
import ScheduleIcon from "@mui/icons-material/Schedule";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LockIcon from "@mui/icons-material/Lock";
import BarChartIcon from "@mui/icons-material/BarChart";
import type { SvgIconComponent } from "@mui/icons-material";

export function QuickNav({
  year,
  semester,
}: {
  year: number;
  semester: number;
}) {
  const base = `/dashboard/${year}/${semester}`;
  const links: { href: string; label: string; Icon: SvgIconComponent }[] = [
    { href: `${base}/teacher-table`, label: "ตารางสอนครู", Icon: PersonIcon },
    {
      href: `${base}/student-table`,
      label: "ตารางเรียนนักเรียน",
      Icon: GroupsIcon,
    },
    {
      href: `${base}/all-timeslot`,
      label: "จัดการคาบเรียน",
      Icon: ScheduleIcon,
    },
    { href: `${base}/all-program`, label: "หลักสูตร", Icon: MenuBookIcon },
    {
      href: `${base}/conflicts`,
      label: "ตรวจสอบความซ้ำซ้อน",
      Icon: WarningAmberIcon,
    },
    // lock page lives under /schedule, not /dashboard
    {
      href: `/schedule/${year}/${semester}/lock`,
      label: "ล็อกคาบเรียน",
      Icon: LockIcon,
    },
    { href: `${base}/analytics`, label: "วิเคราะห์ข้อมูล", Icon: BarChartIcon },
  ];

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ px: 1, mb: 1 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
          }}
        >
          เมนูด่วน
        </Typography>
      </Box>
      <List disablePadding>
        {links.map(({ href, label, Icon }) => (
          <ListItemButton key={href} href={href} sx={{ borderRadius: 2 }}>
            <ListItemIcon sx={{ minWidth: 40, color: "primary.main" }}>
              <Icon aria-hidden fontSize="small" />
            </ListItemIcon>
            <ListItemText
              slotProps={{
                primary: { variant: "body2", sx: { fontWeight: 500 } },
              }}
            >
              {label}
            </ListItemText>
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
}
