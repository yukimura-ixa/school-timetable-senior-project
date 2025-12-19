"use client";
import MiniButton from "@/components/elements/static/MiniButton";
import React, { Fragment, useEffect, useState } from "react";
import { MdAddCircle } from "react-icons/md";
import { TbTrash } from "react-icons/tb";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import { useLockedSchedules } from "@/hooks";
import LockScheduleForm from "./LockScheduleForm";
import { useConfirmDialog } from "@/components/dialogs";
import type { GroupedLockedSchedule } from "@/features/lock/domain/services/lock-validation.service";
import { deleteLocksAction } from "@/features/lock/application/actions/lock.actions";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import {
  Box,
  Button,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  ViewList as ViewListIcon,
  CalendarMonth as CalendarIcon,
  ContentPaste as TemplateIcon,
  ContentCopy as BulkIcon,
} from "@mui/icons-material";
import {
  CardSkeleton,
  NoLockedSchedulesEmptyState,
  NetworkErrorEmptyState,
} from "@/components/feedback";
import LockCalendarView from "./LockCalendarView";
import BulkLockModal from "./BulkLockModal";
import LockTemplatesModal from "./LockTemplatesModal";

type ViewMode = "list" | "calendar";

type LockScheduleProps = {
  initialData: GroupedLockedSchedule[];
  semester: number;
  academicYear: number;
};

function LockSchedule({ initialData, semester, academicYear }: LockScheduleProps) {
  const [lockScheduleFormActive, setLockScheduleFormActive] =
    useState<boolean>(false);
  const [bulkLockModalOpen, setBulkLockModalOpen] = useState<boolean>(false);
  const [templatesModalOpen, setTemplatesModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");

  const { confirm, dialog } = useConfirmDialog();

  const [showMoreteachherData, setShowMoreteacherData] = useState<
    number | null
  >(null); //index

  // Use SWR with server-provided initial data for revalidation
  const lockData = useLockedSchedules(
    academicYear,
    semester,
    initialData, // Pass initial data from server
  );

  // Derive ConfigID from semesterAndyear params
  const configId = `${semester}-${academicYear}`;

  const [selectedLock, setSelectedLock] =
    useState<GroupedLockedSchedule | null>(null);

  // Load view preference after hydration (avoid SSR/client mismatch)
  useEffect(() => {
    const saved = localStorage.getItem("lockScheduleViewMode");
    if (saved === "list" || saved === "calendar") {
      setViewMode(saved);
    }
  }, []);

  // Save view preference
  useEffect(() => {
    localStorage.setItem("lockScheduleViewMode", viewMode);
  }, [viewMode]);

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: ViewMode | null,
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleClickAddLockSchedule = () => {
    setSelectedLock(null);
    setLockScheduleFormActive(true);
  };

  const handleClickDeleteLockSchedule = async (item: GroupedLockedSchedule) => {
    const confirmed = await confirm({
      title: "ลบข้อมูลคาบล็อก",
      message: `คุณต้องการลบข้อมูลคาบล็อก "${item.SubjectCode} - ${item.SubjectName}" ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`,
      variant: "danger",
      confirmText: "ลบ",
      cancelText: "ยกเลิก",
    });

    if (!confirmed) return;

    const loadbar = enqueueSnackbar("กำลังลบข้อมูลคาบล็อก", {
      variant: "info",
      persist: true,
    });

    try {
      // Use ClassIDs from grouped schedule
      await deleteLocksAction({ ClassIDs: item.ClassIDs });
      closeSnackbar(loadbar);
      enqueueSnackbar("ลบข้อมูลคาบล็อกสำเร็จ", { variant: "success" });
      await lockData.mutate();
    } catch (error: unknown) {
      closeSnackbar(loadbar);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      enqueueSnackbar("ลบข้อมูลคาบล็อกไม่สำเร็จ: " + errorMessage, {
        variant: "error",
      });
      console.error(error);
    }
  };

  if (lockData.isLoading) {
    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, py: 2 }}>
        {[...Array(4)].map((_, i) => (
          <Box key={i} sx={{ width: "49%" }}>
            <CardSkeleton />
          </Box>
        ))}
      </Box>
    );
  }

  if (lockData.error) {
    return <NetworkErrorEmptyState onRetry={() => void lockData.mutate()} />;
  }

  const hasData = !!lockData.data && lockData.data.length > 0;

  return (
    <>
      {dialog}
      {lockScheduleFormActive ? (
        <LockScheduleForm
          closeModal={() => setLockScheduleFormActive(false)}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data={selectedLock as any}
          mutate={() => void lockData.mutate()}
        />
      ) : null}

      {/* Action Buttons and View Toggle (always visible to allow creating first lock) */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<BulkIcon />}
            onClick={() => setBulkLockModalOpen(true)}
            data-testid="bulk-lock-btn"
          >
            ล็อกหลายคาบ
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<TemplateIcon />}
            onClick={() => setTemplatesModalOpen(true)}
            data-testid="template-lock-btn"
          >
            ใช้เทมเพลต
          </Button>
        </Stack>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="view mode"
          size="small"
        >
          <ToggleButton value="calendar" aria-label="calendar view">
            <CalendarIcon sx={{ mr: 1 }} fontSize="small" />
            <Typography variant="body2">ปฏิทิน</Typography>
          </ToggleButton>
          <ToggleButton value="list" aria-label="list view">
            <ViewListIcon sx={{ mr: 1 }} fontSize="small" />
            <Typography variant="body2">รายการ</Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Empty state when no data */}
      {!hasData && (
        <Box sx={{ mb: 4 }}>
          <NoLockedSchedulesEmptyState />
        </Box>
      )}

      {/* Calendar View */}
      {hasData && viewMode === "calendar" && (
        <LockCalendarView
          lockData={lockData.data}
          academicYear={academicYear}
          semester={semester}
          onEditLock={(lock) => {
            const index = lockData.data.findIndex(
              (item) => item.SubjectCode === lock.SubjectCode,
            );
            if (index !== -1 && lockData.data[index]) {
              setSelectedLock(lockData.data[index]);
              setLockScheduleFormActive(true);
            }
          }}
          onDeleteLock={(lock) => {
            void handleClickDeleteLockSchedule(lock);
          }}
        />
      )}

      {/* List View */}
      {hasData && viewMode === "list" && (
        <div className="w-full flex flex-wrap gap-4 py-4 justify-between">
          {lockData.data.map((item, lockIndex) => (
            <Fragment key={`${item.SubjectCode}-${lockIndex}`}>
              <div className="relative flex flex-col cursor-pointer p-4 gap-4 w-[49%] h-fit bg-white hover:bg-slate-50 duration-300 drop-shadow rounded">
                <div className="flex justify-between items-center gap-3">
                  <p className="text-lg font-medium">
                    {item.SubjectCode} - {item.SubjectName}
                  </p>
                  <div className="flex gap-3">
                    <div
                      onClick={() => {
                        void handleClickDeleteLockSchedule(item);
                      }}
                      className="cursor-pointer hover:bg-gray-100 duration-300 rounded p-1 flex-end"
                    >
                      <TbTrash size={24} className="text-red-500" />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  สถานที่ : {item.room?.RoomName || "ไม่ระบุ"}
                </p>
                <p className="text-sm text-gray-500">
                  คาบที่ :{" "}
                  {item.timeslots
                    .map((item) =>
                      item.TimeslotID.substring(
                        item.TimeslotID.length > 11
                          ? item.TimeslotID.length - 2
                          : item.TimeslotID.length - 1,
                      ),
                    )
                    .join(",")}
                </p>
                <p className="text-sm text-gray-500">
                  วัน :{" "}
                  {item.timeslots[0]?.DayOfWeek
                    ? dayOfWeekThai[item.timeslots[0].DayOfWeek]
                    : "ไม่ระบุ"}
                </p>
                {/* ชั้นเรียนที่กำหนดให้คาบล็อก */}
                <div className="flex flex-row justify-between items-center">
                  <p className="text-gray-500 text-sm">ชั้นเรียน</p>
                  <div className="flex flex-wrap w-[365px] h-fit gap-2">
                    {item.GradeIDs.map((grade, index) => (
                      <Fragment key={`gradeid${index}`}>
                        <MiniButton
                          width={54}
                          height={25}
                          border={true}
                          borderColor="#c7c7c7"
                          titleColor="#4F515E"
                          buttonColor="#ffffff"
                          title={`ม.${grade.toString()[0]}/${
                            grade.toString()[2]
                          }`}
                          handleClick={() => {}}
                          isSelected={false}
                          hoverable={false}
                        />
                        {/* {index < 9 ? (
                        <MiniButton
                          width={54}
                          height={25}
                          border={true}
                          borderColor="#c7c7c7"
                          titleColor="#4F515E"
                          title={`ม.${item.toString().substring(0, 1)}/${item
                            .toString()
                            .substring(2)}`}
                        />
                      ) : index < 10 ? (
                        <div
                          onMouseEnter={() => {}}
                          onMouseLeave={() => {}}
                          className="hover:bg-gray-100 duration-300 w-[45px] h-[25px] border rounded text-center border-[#c7c7c7] text-[#4F515E]"
                        >
                          <p>...</p>
                        </div>
                      ) : null} */}
                      </Fragment>
                    ))}
                  </div>
                </div>
                {/* ครูที่เลือก */}
                <div className="flex flex-row justify-between items-center">
                  <p className="text-gray-500 text-sm">ครูผู้สอน</p>
                  <div className="flex flex-wrap w-[365px] h-fit gap-2">
                    {item.teachers.map((teacher, index) => (
                      <Fragment key={`${teacher.TeacherID}${index}`}>
                        {index < 3 ? (
                          <MiniButton
                            width="fit-content"
                            height={25}
                            border={true}
                            borderColor="#c7c7c7"
                            titleColor="#4F515E"
                            buttonColor="#ffffff"
                            title={`${teacher.Firstname} - ${
                              teacher.Department &&
                              teacher.Department.length > 10
                                ? `${teacher.Department.substring(0, 10)}...`
                                : teacher.Department || "ไม่ระบุ"
                            }`}
                            handleClick={() => {}}
                            isSelected={false}
                            hoverable={false}
                          />
                        ) : index < 4 ? (
                          <>
                            <div
                              onMouseEnter={() => {
                                setShowMoreteacherData(lockIndex);
                              }}
                              onMouseLeave={() => setShowMoreteacherData(null)}
                              className="relative hover:bg-gray-100 duration-300 w-[100px] h-[25px] border rounded text-center border-[#c7c7c7] text-[#4F515E]"
                            >
                              <p>...</p>
                              <div
                                style={{
                                  display:
                                    lockIndex === showMoreteachherData
                                      ? "block"
                                      : "none",
                                }}
                                className="absolute bottom-[23px] right-[0px] text-left border w-[200px] h-fit p-3 bg-white rounded drop-shadow-sm"
                                onMouseEnter={() => {
                                  setShowMoreteacherData(lockIndex);
                                }}
                                onMouseLeave={() =>
                                  setShowMoreteacherData(null)
                                }
                              >
                                {item.teachers.map((item, index) => (
                                  <Fragment key={`moredata${index}`}>
                                    <div className="flex gap-2">
                                      <p className="font-bold text-sm">
                                        {item.Firstname}
                                      </p>
                                      <p className="text-sm">
                                        {item.Department &&
                                        item.Department.length > 10
                                          ? `${item.Department.substring(
                                              0,
                                              10,
                                            )}...`
                                          : item.Department || "ไม่ระบุ"}
                                      </p>
                                    </div>
                                  </Fragment>
                                ))}
                              </div>
                            </div>
                          </>
                        ) : null}
                      </Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </Fragment>
          ))}
          <div
            onClick={handleClickAddLockSchedule}
            className="flex justify-center cursor-pointer items-center p-4 gap-3 w-[49%] h-[255px] border border-[#EDEEF3] rounded hover:bg-gray-100 duration-300"
          >
            <MdAddCircle size={24} className="fill-gray-500" />
            <p className="text-lg font-bold">เพิ่มคาบล็อก</p>
          </div>
        </div>
      )}

      {/* Bulk Lock Modal */}
      <BulkLockModal
        open={bulkLockModalOpen}
        onClose={() => setBulkLockModalOpen(false)}
        _configId={configId}
        onSuccess={() => {
          void lockData.mutate();
          setBulkLockModalOpen(false);
        }}
      />

      {/* Lock Templates Modal */}
      <LockTemplatesModal
        open={templatesModalOpen}
        onClose={() => setTemplatesModalOpen(false)}
        academicYear={academicYear}
        semester={semester}
        configId={configId}
        onSuccess={() => {
          void lockData.mutate();
          setTemplatesModalOpen(false);
        }}
      />
    </>
  );
}

export default LockSchedule;
