"use client";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Box, Tabs, Tab, Link, Chip } from "@mui/material";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import SettingsIcon from "@mui/icons-material/Settings";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LockIcon from "@mui/icons-material/Lock";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { fetcher } from "@/libs/axios";
import useSWR from "swr";

function Schedule() {
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const [semester, academicYear] = (params.semesterAndyear as string).split(
    "-",
  ); //from "1-2566" to ["1", "2566"]
  const path = pathName.substring(0, 16);
  const [isSetTimeslot, setIsSetTimeslot] = useState(false); //ตั้งค่าไปแล้วจะ = true
  const tableConfig = useSWR(
    "/config/getConfig?AcademicYear=" +
      academicYear +
      "&Semester=SEMESTER_" +
      semester,
    fetcher,
  );
  useEffect(() => {
    setIsSetTimeslot(() => tableConfig.data != undefined);
  }, [tableConfig.isValidating, tableConfig.data]);

  const [tabSelect, setTabSelect] = useState<string>("");

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTabSelect(newValue);
    router.replace(`${path}/${newValue}`);
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 3 }}>
        <Box>
          <h1 className="text-xl font-bold">
            ตารางสอน ภาคเรียนที่ {semester} ปีการศึกษา {academicYear}
          </h1>
          {isSetTimeslot && (
            <Chip 
              label="ตั้งค่าคาบเรียนแล้ว" 
              color="success" 
              size="small" 
              sx={{ mt: 1 }}
            />
          )}
        </Box>
        <Link
          sx={{ display: 'flex', gap: 1, alignItems: 'center', cursor: 'pointer', textDecoration: 'none' }}
          href="/schedule/select-semester"
        >
          <KeyboardBackspaceIcon sx={{ color: 'text.secondary' }} />
          <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
            เปลี่ยนภาคเรียน
          </Box>
        </Link>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabSelect}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="schedule tabs"
        >
          <Tab
            icon={<SettingsIcon />}
            iconPosition="start"
            label="ตั้งค่าตารางสอน"
            value="config"
          />
          <Tab
            icon={<AssignmentIcon />}
            iconPosition="start"
            label="มอบหมายวิชาเรียน"
            value="assign"
            disabled={!isSetTimeslot}
          />
          <Tab
            icon={<LockIcon />}
            iconPosition="start"
            label="ล็อกคาบสอน"
            value="lock"
            disabled={!isSetTimeslot}
          />
          <Tab
            icon={<CalendarMonthIcon />}
            iconPosition="start"
            label="จัดตารางสอน"
            value="arrange/teacher-arrange"
            disabled={!isSetTimeslot}
          />
        </Tabs>
      </Box>
    </>
  );
}

export default Schedule;
