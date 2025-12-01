"use client";
import { useParams, usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Box, Tabs, Tab, Link } from "@mui/material";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LockIcon from "@mui/icons-material/Lock";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useSemesterSync } from "@/hooks";

function Schedule() {
  const pathName = usePathname();
  const router = useRouter();
  const params = useParams();

  // Sync URL params with global store
  const { semester, academicYear } = useSemesterSync(
    params.semesterAndyear as string,
  );

  const path = pathName.substring(0, 16);

  // Extract current tab from URL path (e.g., "/schedule/1-2567/assign" -> "assign")
  const getCurrentTab = (): string => {
    const parts = pathName.split("/");
    if (parts.length > 3) {
      // Handle nested routes like "arrange/teacher-arrange"
      return parts.slice(3).join("/");
    }
    return "";
  };

  const [tabSelect, setTabSelect] = useState<string>(getCurrentTab());

  // Sync tab state with URL changes
  useEffect(() => {
    const currentTab = getCurrentTab();
    setTabSelect(currentTab);
  }, [pathName]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTabSelect(newValue);
    router.replace(`${path}/${newValue}`);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 3,
        }}
      >
        <Box>
          <h1 className="text-xl font-bold">
            ตารางสอน ภาคเรียนที่ {semester} ปีการศึกษา {academicYear}
          </h1>
        </Box>
        <Link
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            cursor: "pointer",
            textDecoration: "none",
          }}
          href="/dashboard"
        >
          <KeyboardBackspaceIcon sx={{ color: "text.secondary" }} />
          <Box
            component="span"
            sx={{ color: "text.secondary", fontSize: "0.875rem" }}
          >
            เปลี่ยนภาคเรียน
          </Box>
        </Link>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Tabs
          value={tabSelect}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="schedule tabs"
          sx={{
            "& .MuiTabs-indicator": {
              height: 4,
              borderRadius: "4px 4px 0 0",
              background: "linear-gradient(90deg, #06b6d4, #3b82f6)",
              boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
            },
            "& .MuiTab-root": {
              fontSize: "0.95rem",
              fontWeight: 500,
              textTransform: "none",
              minHeight: 64,
              px: 3,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              color: "#6b7280",
              "&:hover": {
                backgroundColor: "rgba(6, 182, 212, 0.08)",
                color: "#0891b2",
                transform: "translateY(-2px)",
              },
              "&.Mui-selected": {
                color: "#0891b2",
                fontWeight: 600,
                background:
                  "linear-gradient(to bottom, rgba(6, 182, 212, 0.05), transparent)",
              },
              "& .MuiSvgIcon-root": {
                fontSize: "1.3rem",
                transition: "transform 0.3s ease",
              },
              "&.Mui-selected .MuiSvgIcon-root": {
                transform: "scale(1.1)",
              },
            },
            borderBottom: "2px solid",
            borderColor: "rgba(229, 231, 235, 1)",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Tab
            icon={<AssignmentIcon />}
            iconPosition="start"
            label="มอบหมายวิชาเรียน"
            value="assign"
          />
          <Tab
            icon={<LockIcon />}
            iconPosition="start"
            label="ล็อกคาบสอน"
            value="lock"
          />
          <Tab
            icon={<CalendarMonthIcon />}
            iconPosition="start"
            label="จัดตารางสอน"
            value="arrange/teacher-arrange"
          />
        </Tabs>
      </Box>
    </>
  );
}

export default Schedule;
