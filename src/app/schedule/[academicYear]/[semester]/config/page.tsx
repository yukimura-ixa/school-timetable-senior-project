"use client";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Box, Button } from "@mui/material";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { BsTable, BsCalendar2Day } from "react-icons/bs";
import { LuClock10 } from "react-icons/lu";
import { MdLunchDining } from "react-icons/md";
import { TbTimeDuration45 } from "react-icons/tb";
import ConfirmDeleteModal from "./component/ConfirmDeleteModal";
import CloneTimetableDataModal from "./component/CloneTimetableDataModal";
import useSWR from "swr";
import Loading from "@/app/loading";
import { PageLoadingSkeleton } from "@/components/feedback";
import { PublishReadinessCard } from "@/features/config/presentation/components/PublishReadinessCard";
import { ConfigStatusBadge } from "@/app/schedule/[academicYear]/[semester]/config/_components/ConfigStatusBadge";
import { ConfigureTimeslotsDialog } from "@/app/dashboard/_components/ConfigureTimeslotsDialog";
import { parseConfigData } from "@/features/config/domain/types/config-data.types";

type TableConfigResponse = {
  ConfigID: string;
  AcademicYear: number;
  Semester: string;
  Config: unknown;
  status: "DRAFT" | "PUBLISHED" | "LOCKED" | "ARCHIVED";
} | null;

function TimetableConfigValue() {
  const params = useParams();
  const academicYear = params.academicYear
    ? parseInt(params.academicYear as string, 10)
    : null;
  const semester = params.semester
    ? parseInt(params.semester as string, 10)
    : null;
  const hasTerm = Boolean(academicYear && semester);

  const [isCopying, setIsCopying] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [isCloneModal, setIsCloneModal] = useState(false);
  const [isEditDialog, setIsEditDialog] = useState(false);

  const tableConfig = useSWR(
    hasTerm ? `config-${academicYear}-${semester}` : null,
    async () => {
      if (!academicYear || !semester) return null;
      const response = await fetch(
        `/api/schedule-config/${academicYear}/${semester}`,
        { credentials: "include" },
      );
      if (!response.ok) throw new Error("Failed to load timetable config");
      const result = (await response.json()) as {
        success: boolean;
        data: TableConfigResponse;
      };
      return result.success ? result.data : null;
    },
  );

  if (tableConfig.isLoading && !isCopying) return <PageLoadingSkeleton />;
  if (!academicYear || !semester) return <PageLoadingSkeleton />;

  const configId = `${semester}-${academicYear}`;
  const configStatus = tableConfig.data?.status ?? "DRAFT";
  const hasConfig = Boolean(tableConfig.data?.Config);
  const parsedConfig = hasConfig
    ? (() => {
        try {
          return parseConfigData(tableConfig.data!.Config);
        } catch {
          return null;
        }
      })()
    : null;

  return (
    <>
      {isCopying ? <Loading /> : null}
      {tableConfig.error ? (
        <div className="mx-3 mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          โหลดข้อมูลตั้งค่าตารางไม่สำเร็จ
        </div>
      ) : null}

      <Box sx={{ mx: 1.5, mb: 2 }}>
        <ConfigStatusBadge
          configId={configId}
          currentStatus={configStatus}
          completeness={0}
          onStatusChange={() => tableConfig.mutate()}
        />
        {configStatus === "DRAFT" && (
          <Box sx={{ mt: 1.5 }}>
            <PublishReadinessCard
              configId={configId}
              onStatusChange={() => tableConfig.mutate()}
            />
          </Box>
        )}
      </Box>

      {isDeleteModal && hasTerm ? (
        <ConfirmDeleteModal
          closeModal={() => setIsDeleteModal(false)}
          mutate={tableConfig.mutate}
          academicYear={academicYear}
          semester={semester}
        />
      ) : null}
      {isCloneModal && hasTerm ? (
        <CloneTimetableDataModal
          setIsCopying={setIsCopying}
          closeModal={() => setIsCloneModal(false)}
          mutate={tableConfig.mutate}
          academicYear={academicYear}
          semester={semester}
        />
      ) : null}
      {isEditDialog && hasConfig && parsedConfig ? (
        <ConfigureTimeslotsDialog
          open={isEditDialog}
          onClose={() => setIsEditDialog(false)}
          onSuccess={() => tableConfig.mutate()}
          academicYear={academicYear}
          semester={semester as 1 | 2}
          configId={configId}
          mode="edit"
          initialConfig={parsedConfig}
        />
      ) : null}

      <span className="flex flex-col gap-3 my-5 px-3">
        {!hasConfig ? (
          <div className="flex flex-col items-center gap-4 py-10 text-center text-gray-500">
            <p>ยังไม่มีการตั้งค่าตารางเรียน</p>
            <p className="text-sm">กรุณาตั้งค่าจากหน้า Dashboard</p>
            <u
              onClick={() => setIsCloneModal(true)}
              className="text-blue-500 cursor-pointer hover:text-blue-600 duration-300 text-sm"
            >
              หรือเรียกข้อมูลตารางสอนที่มีอยู่
            </u>
          </div>
        ) : (
          <>
            <div className="flex w-full h-[65px] justify-between py-4 items-center">
              <div className="flex items-center gap-4">
                <BsTable size={25} className="fill-gray-500" />
                <p className="text-md">กำหนดคาบต่อวัน</p>
              </div>
              <p className="text-gray-600">
                <b>{parsedConfig?.TimeslotPerDay}</b> คาบ
              </p>
            </div>

            <div className="flex w-full h-[65px] justify-between py-4 items-center">
              <div className="flex items-center gap-4">
                <TbTimeDuration45 size={25} className="stroke-gray-500" />
                <p className="text-md">กำหนดระยะเวลาต่อคาบ</p>
              </div>
              <p className="text-gray-600">
                <b>{parsedConfig?.Duration}</b> นาที
              </p>
            </div>

            <div className="flex w-full h-[65px] justify-between py-4 items-center">
              <div className="flex items-center gap-4">
                <LuClock10 size={25} className="stroke-gray-500" />
                <p className="text-md">กำหนดเวลาเริ่มคาบแรก</p>
              </div>
              <p className="text-gray-600">
                <b>{parsedConfig?.StartTime}</b> นาฬิกา
              </p>
            </div>

            {parsedConfig?.HasMinibreak && (
              <div className="flex w-full h-[65px] justify-between py-4 items-center mt-3">
                <div className="flex items-center gap-4">
                  <MdLunchDining size={25} className="fill-gray-500" />
                  <p className="text-md">กำหนดคาบพักเล็ก</p>
                </div>
                <p className="text-gray-600">
                  ก่อนคาบที่ <b>{parsedConfig.MiniBreak?.SlotNumber}</b> ระยะเวลา{" "}
                  <b>{parsedConfig.MiniBreak?.Duration}</b> นาที
                </p>
              </div>
            )}

            <div className="flex w-full h-auto justify-between py-4 items-center">
              <div className="flex items-center gap-4">
                <MdLunchDining size={25} className="fill-gray-500" />
                <p className="text-md">กำหนดคาบพักเที่ยง</p>
              </div>
              <div className="flex flex-col gap-2 text-right">
                <p className="text-gray-600">
                  มัธยมปลาย คาบที่ <b>{parsedConfig?.BreakTimeslots.Senior}</b>
                </p>
                <p className="text-gray-600">
                  มัธยมต้น คาบที่ <b>{parsedConfig?.BreakTimeslots.Junior}</b>
                </p>
              </div>
            </div>

            <div className="flex w-full h-[65px] justify-between py-4 items-center">
              <div className="flex items-center gap-4">
                <BsCalendar2Day size={25} className="fill-gray-500" />
                <p className="text-md">วันที่เรียน</p>
              </div>
              <p className="text-gray-600">
                {parsedConfig?.Days.join(", ")}
              </p>
            </div>

            <div className="flex w-full h-[65px] justify-between items-center">
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setIsDeleteModal(true)}
              >
                ลบเทอม
              </Button>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setIsEditDialog(true)}
                disabled={configStatus !== "DRAFT"}
                title={configStatus !== "DRAFT" ? `ไม่สามารถแก้ไขได้ในสถานะ ${configStatus}` : undefined}
              >
                แก้ไขตั้งค่า
              </Button>
            </div>
          </>
        )}
      </span>
    </>
  );
}

export default TimetableConfigValue;
