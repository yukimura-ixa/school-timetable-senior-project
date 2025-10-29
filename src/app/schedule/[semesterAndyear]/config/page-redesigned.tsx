"use client";

/**
 * Redesigned Timetable Config Page
 * Modern card-based layout with validation and visual preview
 */

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useParams } from "next/navigation";
import {
  Container,
  Box,
  Typography,
  Button,
  Alert,
  Switch,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from "@mui/material";
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Timer as TimerIcon,
  AccessTime as ClockIcon,
  LunchDining as LunchIcon,
  Coffee as CoffeeIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";
import { enqueueSnackbar, closeSnackbar } from "notistack";
import useSWR from "swr";

// New components
import { ConfigField } from "./_components/ConfigField";
import { ConfigSection } from "./_components/ConfigSection";
import { NumberInput } from "./_components/NumberInput";
import { TimeslotPreview } from "./_components/TimeslotPreview";
import { ConfigStatusBadge } from "./_components/ConfigStatusBadge";
import { CompletenessIndicator } from "./_components/CompletenessIndicator";
import { ConfigContentSkeleton } from "./_components/ConfigContentSkeleton";

// Existing components
import ConfirmDeleteModal from "./component/ConfirmDeleteModal";
import CloneTimetableDataModal from "./component/CloneTimetableDataModal";
import { PageLoadingSkeleton, NetworkErrorEmptyState } from "@/components/feedback";

// Server Actions
import { getConfigByTermAction } from "@/features/config/application/actions/config.actions";
import { createTimeslotsAction } from "@/features/timeslot/application/actions/timeslot.actions";
import { 
  getConfigWithCompletenessAction,
  updateConfigCompletenessAction 
} from "@/features/config/application/actions/config-lifecycle.actions";

// Validation
import { validateConfig } from "@/features/config/application/schemas/config-validation.schemas";

type ConfigData = {
  Days: string[];
  AcademicYear: number;
  Semester: string;
  StartTime: string;
  BreakDuration: number;
  BreakTimeslots: {
    Junior: number;
    Senior: number;
  };
  Duration: number;
  TimeslotPerDay: number;
  MiniBreak: {
    Duration: number;
    SlotNumber: number;
  };
  HasMinibreak: boolean;
};

export default function TimetableConfigPageRedesigned() {
  const params = useParams();
  const [semester, academicYear] = (params.semesterAndyear as string).split("-");

  // State
  const [isSetTimeslot, setIsSetTimeslot] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [configData, setConfigData] = useState<ConfigData>({
    Days: ["MON", "TUE", "WED", "THU", "FRI"],
    AcademicYear: parseInt(academicYear),
    Semester: `SEMESTER_${semester}`,
    StartTime: "08:30",
    BreakDuration: 50,
    BreakTimeslots: {
      Junior: 4,
      Senior: 5,
    },
    Duration: 50,
    TimeslotPerDay: 8,
    MiniBreak: {
      Duration: 10,
      SlotNumber: 2,
    },
    HasMinibreak: false,
  });

  // Fetch config data with completeness
  const tableConfig = useSWR<any>(
    `config-${academicYear}-${semester}`,
    async () => {
      try {
        const result = await getConfigWithCompletenessAction({
          academicYear: parseInt(academicYear),
          semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2",
        });
        
        if (result.success && result.data) {
          return result.data;
        }
        return null;
      } catch (error) {
        console.error("Error fetching config:", error);
        return null;
      }
    }
  );

  useEffect(() => {
    const checkSetTimeslot = tableConfig.data?.config != undefined;
    setIsSetTimeslot(checkSetTimeslot);
    if (tableConfig.data?.config) {
      setConfigData(tableConfig.data.config.Config);
    }
  }, [tableConfig.isValidating, academicYear, semester]);

  // Validate on change
  useEffect(() => {
    const result = validateConfig(configData);
    if (!result.success && result.error) {
      setValidationErrors([result.error]);
    } else {
      setValidationErrors([]);
    }
  }, [configData]);

  // Update break slots when TimeslotPerDay changes
  useEffect(() => {
    const currentValue = configData.TimeslotPerDay;
    const breakJVal = configData.BreakTimeslots.Junior;
    const breakSVal = configData.BreakTimeslots.Senior;

    if (breakJVal > currentValue || breakSVal > currentValue) {
      const jVal = breakJVal > currentValue ? currentValue : breakJVal;
      const sVal = breakSVal > currentValue ? currentValue : breakSVal;
      setConfigData((prev) => ({
        ...prev,
        BreakTimeslots: { Junior: jVal, Senior: sVal },
      }));
    }
  }, [configData.TimeslotPerDay]);

  const handleReset = () => {
    setConfigData({
      Days: ["MON", "TUE", "WED", "THU", "FRI"],
      AcademicYear: parseInt(academicYear),
      Semester: `SEMESTER_${semester}`,
      StartTime: "08:30",
      BreakDuration: 50,
      BreakTimeslots: {
        Junior: 4,
        Senior: 5,
      },
      Duration: 50,
      TimeslotPerDay: 8,
      MiniBreak: {
        Duration: 10,
        SlotNumber: 2,
      },
      HasMinibreak: false,
    });
    enqueueSnackbar("คืนค่าเริ่มต้นสำเร็จ", { variant: "success" });
  };

  const handleSave = async () => {
    // Validate before save
    const result = validateConfig(configData);
    if (!result.success) {
      enqueueSnackbar(result.error || "ข้อมูลไม่ถูกต้อง", { variant: "error" });
      return;
    }

    setIsSetTimeslot(true);
    const saving = enqueueSnackbar("กำลังตั้งค่าตาราง", {
      variant: "info",
      persist: true,
    });

    try {
      await createTimeslotsAction({
        ...configData,
        AcademicYear: parseInt(academicYear),
        Semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2",
      });

      // Update completeness after saving
      await updateConfigCompletenessAction({
        academicYear: parseInt(academicYear),
        semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2",
      });

      closeSnackbar(saving);
      enqueueSnackbar("ตั้งค่าตารางสำเร็จ", { variant: "success" });
      tableConfig.mutate();
    } catch (error) {
      console.error(error);
      closeSnackbar(saving);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      enqueueSnackbar("เกิดข้อผิดพลาด: " + errorMessage, { variant: "error" });
      setIsSetTimeslot(false);
    }
  };

  // Generate slot numbers for dropdowns (memoized)
  const slotNumbers = useMemo(
    () => Array.from({ length: configData.TimeslotPerDay }, (_, i) => i + 1),
    [configData.TimeslotPerDay]
  );

  // Memoize counts for completeness indicator
  const completenessData = useMemo(() => {
    if (!tableConfig.data?.config) return null;
    return {
      completeness: tableConfig.data.config.configCompleteness || 0,
      counts: {
        timeslots: tableConfig.data.timeslotCount || 0,
        teachers: tableConfig.data.teacherCount || 0,
        subjects: tableConfig.data.subjectCount || 0,
        classes: tableConfig.data.classCount || 0,
        rooms: tableConfig.data.roomCount || 0,
      },
    };
  }, [tableConfig.data]);

  if (tableConfig.isLoading && !isCopying) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ConfigContentSkeleton />
      </Container>
    );
  }

  if (tableConfig.error) {
    return <NetworkErrorEmptyState onRetry={() => tableConfig.mutate()} />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Modals */}
      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          closeModal={() => setIsDeleteModalOpen(false)}
          mutate={tableConfig.mutate}
          academicYear={academicYear}
          semester={semester}
        />
      )}
      {isCloneModalOpen && (
        <CloneTimetableDataModal
          setIsCopying={setIsCopying}
          closeModal={() => setIsCloneModalOpen(false)}
          mutate={tableConfig.mutate}
          academicYear={academicYear}
          semester={semester}
        />
      )}

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <Typography variant="h4" fontWeight="bold">
                ตั้งค่าตารางเรียน
              </Typography>
              {tableConfig.data?.config && (
                <ConfigStatusBadge
                  configId={tableConfig.data.config.ConfigId}
                  currentStatus={tableConfig.data.config.status || "DRAFT"}
                  completeness={tableConfig.data.config.configCompleteness || 0}
                  onStatusChange={() => tableConfig.mutate()}
                  readOnly={isSetTimeslot}
                />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">
              ภาคเรียนที่ {semester} / {academicYear}
            </Typography>
          </Box>

          {!isSetTimeslot && (
            <Button
              variant="outlined"
              onClick={() => setIsCloneModalOpen(true)}
            >
              เรียกข้อมูลที่มีอยู่
            </Button>
          )}
        </Box>

        {isSetTimeslot && (
          <Alert severity="info" icon={<ScheduleIcon />}>
            ตารางนี้ถูกตั้งค่าแล้ว หากต้องการแก้ไข กรุณาลบเทอมก่อน
          </Alert>
        )}

        {validationErrors.length > 0 && !isSetTimeslot && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {validationErrors.map((error, i) => (
              <div key={i}>{error}</div>
            ))}
          </Alert>
        )}

        {/* Completeness Indicator */}
        {completenessData && (
          <Box sx={{ mt: 2 }}>
            <CompletenessIndicator
              completeness={completenessData.completeness}
              counts={completenessData.counts}
              showBreakdown={true}
            />
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Basic Settings Section */}
        <ConfigSection
          title="การตั้งค่าพื้นฐาน"
          description="กำหนดจำนวนคาบ ระยะเวลา และเวลาเริ่มเรียน"
          icon={<ScheduleIcon />}
        >
          <ConfigField
            icon={<ScheduleIcon />}
            label="จำนวนคาบต่อวัน"
            helperText="ควรมี 6-12 คาบ"
            isEditable={!isSetTimeslot}
            value={
              isSetTimeslot ? (
                <Typography fontWeight="bold">{configData.TimeslotPerDay} คาบ</Typography>
              ) : (
                <NumberInput
                  value={configData.TimeslotPerDay}
                  onChange={(val) => setConfigData({ ...configData, TimeslotPerDay: val })}
                  min={6}
                  max={12}
                  unit="คาบ"
                />
              )
            }
          />

          <ConfigField
            icon={<TimerIcon />}
            label="ระยะเวลาต่อคาบ"
            helperText="30-120 นาที"
            isEditable={!isSetTimeslot}
            value={
              isSetTimeslot ? (
                <Typography fontWeight="bold">{configData.Duration} นาที</Typography>
              ) : (
                <NumberInput
                  value={configData.Duration}
                  onChange={(val) =>
                    setConfigData({
                      ...configData,
                      Duration: val,
                      BreakDuration: val,
                    })
                  }
                  min={30}
                  max={120}
                  step={5}
                  unit="นาที"
                />
              )
            }
          />

          <ConfigField
            icon={<ClockIcon />}
            label="เวลาเริ่มคาบแรก"
            helperText="เช่น 08:30"
            isEditable={!isSetTimeslot}
            value={
              isSetTimeslot ? (
                <Typography fontWeight="bold">{configData.StartTime} น.</Typography>
              ) : (
                <TextField
                  type="time"
                  value={configData.StartTime}
                  onChange={(e) =>
                    setConfigData({ ...configData, StartTime: e.target.value })
                  }
                  size="small"
                  sx={{ width: 140 }}
                />
              )
            }
          />
        </ConfigSection>

        {/* Break Settings Section */}
        <ConfigSection
          title="การตั้งค่าเวลาพัก"
          description="กำหนดคาบพักเที่ยงสำหรับม.ต้นและม.ปลาย"
          icon={<LunchIcon />}
        >
          <ConfigField
            icon={<LunchIcon />}
            label="คาบพักเที่ยง ม.ต้น"
            helperText="พักหลังคาบที่"
            isEditable={!isSetTimeslot}
            value={
              isSetTimeslot ? (
                <Typography fontWeight="bold">คาบที่ {configData.BreakTimeslots.Junior}</Typography>
              ) : (
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={configData.BreakTimeslots.Junior}
                    onChange={(e) =>
                      setConfigData({
                        ...configData,
                        BreakTimeslots: {
                          ...configData.BreakTimeslots,
                          Junior: Number(e.target.value),
                        },
                      })
                    }
                  >
                    {slotNumbers.map((num) => (
                      <MenuItem key={num} value={num}>
                        คาบที่ {num}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )
            }
          />

          <ConfigField
            icon={<LunchIcon />}
            label="คาบพักเที่ยง ม.ปลาย"
            helperText="พักหลังคาบที่"
            isEditable={!isSetTimeslot}
            value={
              isSetTimeslot ? (
                <Typography fontWeight="bold">คาบที่ {configData.BreakTimeslots.Senior}</Typography>
              ) : (
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={configData.BreakTimeslots.Senior}
                    onChange={(e) =>
                      setConfigData({
                        ...configData,
                        BreakTimeslots: {
                          ...configData.BreakTimeslots,
                          Senior: Number(e.target.value),
                        },
                      })
                    }
                  >
                    {slotNumbers.map((num) => (
                      <MenuItem key={num} value={num}>
                        คาบที่ {num}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )
            }
          />

          {!isSetTimeslot && (
            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={configData.HasMinibreak}
                    onChange={(e) =>
                      setConfigData({ ...configData, HasMinibreak: e.target.checked })
                    }
                  />
                }
                label="เพิ่มเวลาพักเล็ก"
              />

              {configData.HasMinibreak && (
                <Box sx={{ mt: 2, display: "flex", gap: 2, alignItems: "center" }}>
                  <CoffeeIcon color="action" />
                  <FormControl size="small">
                    <InputLabel>พักก่อนคาบที่</InputLabel>
                    <Select
                      value={configData.MiniBreak.SlotNumber}
                      label="พักก่อนคาบที่"
                      onChange={(e) =>
                        setConfigData({
                          ...configData,
                          MiniBreak: {
                            ...configData.MiniBreak,
                            SlotNumber: Number(e.target.value),
                          },
                        })
                      }
                      sx={{ minWidth: 140 }}
                    >
                      {slotNumbers.map((num) => (
                        <MenuItem key={num} value={num}>
                          คาบที่ {num}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <NumberInput
                    value={configData.MiniBreak.Duration}
                    onChange={(val) =>
                      setConfigData({
                        ...configData,
                        MiniBreak: {
                          ...configData.MiniBreak,
                          Duration: val,
                        },
                      })
                    }
                    min={5}
                    max={30}
                    unit="นาที"
                  />
                </Box>
              )}
            </Box>
          )}

          {isSetTimeslot && configData.HasMinibreak && (
            <ConfigField
              icon={<CoffeeIcon />}
              label="พักเล็ก"
              isEditable={false}
              value={
                <Typography fontWeight="bold">
                  ก่อนคาบที่ {configData.MiniBreak.SlotNumber} ({configData.MiniBreak.Duration} นาที)
                </Typography>
              }
            />
          )}
        </ConfigSection>

        {/* Days Section */}
        <ConfigSection
          title="วันในตารางสอน"
          description="กำหนดวันที่ใช้ในตารางเรียน"
          icon={<CalendarIcon />}
          defaultExpanded={false}
        >
          <ConfigField
            icon={<CalendarIcon />}
            label="วันเรียน"
            isEditable={false}
            value={
              <Box sx={{ display: "flex", gap: 1 }}>
                <Chip label="จันทร์ - ศุกร์" color="primary" size="small" />
                <Chip label="(ค่าเริ่มต้น)" size="small" variant="outlined" />
              </Box>
            }
          />
        </ConfigSection>

        {/* Preview Section */}
        <TimeslotPreview config={configData} />

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pt: 2,
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={!isSetTimeslot}
          >
            ลบเทอม
          </Button>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleReset}
              disabled={isSetTimeslot}
            >
              คืนค่าเริ่มต้น
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={isSetTimeslot || validationErrors.length > 0}
            >
              ตั้งค่าตาราง
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
