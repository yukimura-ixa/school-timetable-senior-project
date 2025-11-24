"use client";
import CheckIcon from "@mui/icons-material/Check";
import ReplayIcon from "@mui/icons-material/Replay";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { BsTable, BsCalendar2Day } from "react-icons/bs";
import { LuClock10 } from "react-icons/lu";
import { MdSchool, MdLunchDining } from "react-icons/md";
import { TbTimeDuration45 } from "react-icons/tb";
import CheckBox from "@/components/mui/CheckBox";
import PrimaryButton from "@/components/mui/PrimaryButton";
import Counter from "./component/Counter";
import ConfirmDeleteModal from "./component/ConfirmDeleteModal";
import CloneTimetableDataModal from "./component/CloneTimetableDataModal";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import {
  getConfigByTermAction,
  createConfigAction,
} from "@/features/config/application/actions/config.actions";
import useSWR from "swr";
import DeleteIcon from "@mui/icons-material/Delete";
import Loading from "@/app/loading";
import {
  PageLoadingSkeleton,
  NetworkErrorEmptyState,
} from "@/components/feedback";
import { useSemesterSync } from "@/hooks";

function TimetableConfigValue() {
  const params = useParams();

  // Sync URL params with global store
  const { semester, academicYear } = useSemesterSync(
    params.semesterAndyear as string,
  );
  const [isCopying, setIsCopying] = useState(false);
  const [isActiveModal, setIsActiveModal] = useState<boolean>(false);
  const [isCloneDataModal, setIsCloneDataModal] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [addMiniBreak, setAddMiniBreak] = useState<boolean>(false);
  const [configData, setConfigData] = useState({
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
  const [isSetTimeslot, setIsSetTimeslot] = useState(false); //ตั้งค่าไปแล้วจะ = true
  const tableConfig = useSWR(`config-${academicYear}-${semester}`, async () => {
    const result = await getConfigByTermAction({
      AcademicYear: parseInt(academicYear),
      Semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2",
    });
    return result.success ? result.data : null;
  });

  useEffect(() => {
    const checkSetTimeslot = tableConfig.data !== undefined;
    setIsSetTimeslot(() => checkSetTimeslot);
    if (tableConfig.data && tableConfig.data.Config) {
      // Map table_config.Config JSON to legacy local state format
      // Config is stored as unstructured JSON, so we need to parse it carefully
      try {
        const config = tableConfig.data.Config as any;
        setConfigData({
          Days: config.Days || ["MON", "TUE", "WED", "THU", "FRI"],
          AcademicYear: tableConfig.data.AcademicYear,
          Semester: tableConfig.data.Semester,
          StartTime: config.StartTime || "08:30",
          BreakDuration: config.BreakDuration || 50,
          BreakTimeslots: {
            Junior: config.BreakTimeslots?.Junior || 4,
            Senior: config.BreakTimeslots?.Senior || 5,
          },
          Duration: config.Duration || 50,
          TimeslotPerDay: config.TimeslotPerDay || 8,
          MiniBreak: {
            Duration: config.MiniBreak?.Duration || 10,
            SlotNumber: config.MiniBreak?.SlotNumber || 2,
          },
          HasMinibreak: config.HasMinibreak || false,
        });
      } catch (error) {
        console.error("Error parsing config JSON:", error);
      }
    }
  }, [tableConfig.isValidating, academicYear, semester]);
  const handleChangeStartTime = (e: any) => {
    const value = e.target.value;
    setConfigData(() => ({ ...configData, StartTime: value }));
  };
  const [breakSlotMap, setBreakSlotMap] = useState<number[]>([]); //เอาไว้แมพเพื่อใช้กับ กำหนดคาบพักเที่ยง ข้อมูลตัวอย่าง => [1, 2, 3, 4, 5]
  useEffect(() => {
    const breakSlot: number[] = []; //ก่อน render เสร็จจะให้ set ค่า default หรือค่าที่ได้มาก่อน
    for (let i = 0; i < configData.TimeslotPerDay; i++) {
      breakSlot.push(i + 1);
    }
    setBreakSlotMap(breakSlot);
    const currentValue = configData.TimeslotPerDay;
    const breakJVal = configData.BreakTimeslots.Junior;
    const breakSVal = configData.BreakTimeslots.Senior;
    if (breakJVal > currentValue || breakSVal > currentValue) {
      const jVal = breakJVal > currentValue ? currentValue : breakJVal; //ถ้า range เกินจะเซ็ทเป็นค่าสูงสุดของ TimeSlotPerDay
      const sVal = breakSVal > currentValue ? currentValue : breakSVal;
      setConfigData(() => ({
        ...configData,
        BreakTimeslots: { Junior: jVal, Senior: sVal },
      }));
    } //เช็คว่าถ้าคาบพักเที่ยงมี range ที่เกินจำนวนคาบต่อวัน จะให้ set เป็นค่าสูงสุดของจำนวนคาบโดยอัตโนมัติ
  }, [configData.TimeslotPerDay]);
  const handleChangeTimeSlotPerDay = (currentValue: number) => {
    if (currentValue < 7 || currentValue > 10) {
      return;
    }
    setConfigData(() => ({ ...configData, TimeslotPerDay: currentValue }));
  };
  const handleChangeDuration = (currentValue: number) => {
    if (currentValue < 30 || currentValue > 120) {
      return;
    }
    setConfigData(() => ({
      ...configData,
      Duration: currentValue,
      BreakDuration: currentValue,
    }));
  };
  // const handleChangeBreakDuration = (currentValue: number) => {
  //   setConfigData(() => ({ ...configData, BreakDuration: currentValue }));
  // };
  const handleChangeBreakTimeJ = (currentValue: unknown) => {
    setConfigData(() => ({
      ...configData,
      BreakTimeslots: {
        Junior: currentValue as number,
        Senior: configData.BreakTimeslots.Senior,
      },
    }));
  };

  const handleChangeBreakTimeS = (currentValue: unknown) => {
    setConfigData(() => ({
      ...configData,
      BreakTimeslots: {
        Junior: configData.BreakTimeslots.Junior,
        Senior: currentValue as number,
      },
    }));
  };
  const handleChangeMiniBreak = (currentValue: unknown) => {
    setConfigData(() => ({
      ...configData,
      MiniBreak: {
        Duration: configData.MiniBreak.Duration,
        SlotNumber: currentValue as number,
      },
    }));
  };
  const reset = () => {
    setConfigData(() => ({
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
    }));
    enqueueSnackbar("คืนค่าเริ่มต้นสำเร็จ", { variant: "success" });
  };

  const saved = async () => {
    setIsSetTimeslot(true);
    const saving = enqueueSnackbar("กำลังตั้งค่าตาราง", {
      variant: "info",
      persist: true,
    });
    try {
      const result = await createConfigAction({
        ConfigID: `${semester}-${academicYear}`,
        AcademicYear: parseInt(academicYear),
        Semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2",
        Config: {
          ...configData,
          HasMinibreak: addMiniBreak,
        },
      });

      if (result.success) {
        closeSnackbar(saving);
        enqueueSnackbar("ตั้งค่าตารางสำเร็จ", { variant: "success" });
        await tableConfig.mutate();
      } else {
        throw new Error(result.error?.message || "Unknown error");
      }
    } catch (error) {
      console.error("Config save error:", error);
      closeSnackbar(saving);
      enqueueSnackbar("เกิดข้อผิดพลาดในการตั้งค่าตาราง", { variant: "error" });
      setIsSetTimeslot(false);
    }
  };

  if (tableConfig.isLoading && !isCopying) {
    return <PageLoadingSkeleton />;
  }

  if (tableConfig.error) {
    return <NetworkErrorEmptyState onRetry={() => tableConfig.mutate()} />;
  }

  return (
    <>
      {isCopying ? <Loading /> : null}
      {isActiveModal ? (
        <ConfirmDeleteModal
          closeModal={() => setIsActiveModal(false)}
          mutate={tableConfig.mutate}
          academicYear={academicYear}
          semester={semester}
        />
      ) : null}
      {isCloneDataModal ? (
        <CloneTimetableDataModal
          setIsCopying={setIsCopying}
          closeModal={() => setIsCloneDataModal(false)}
          mutate={tableConfig.mutate}
          academicYear={academicYear}
          semester={semester}
        />
      ) : null}
      <span className="flex flex-col gap-3 my-5 px-3">
        {!isSetTimeslot ? (
          <div className="flex w-full py-4 justify-end items-center">
            <u
              onClick={() => setIsCloneDataModal(true)}
              className="text-blue-500 cursor-pointer hover:text-blue-600 duration-300"
            >
              เรียกข้อมูลตารางสอนที่มีอยู่
            </u>
          </div>
        ) : null}
        {/* Config timeslot per day */}
        <div className="flex w-full h-[65px] justify-between py-4 items-center">
          <div className="flex items-center gap-4">
            <BsTable size={25} className="fill-gray-500" />
            <p onClick={() => console.log(configData)} className="text-md">
              กำหนดคาบต่อวัน
            </p>
          </div>
          {isSetTimeslot ? (
            <p className=" text-gray-600">
              <b>{configData.TimeslotPerDay}</b> คาบ
            </p>
          ) : (
            <Counter
              classifier="คาบ"
              currentValue={configData.TimeslotPerDay}
              onChange={handleChangeTimeSlotPerDay}
              isDisabled={isSetTimeslot}
            />
          )}
        </div>
        {/* Config duration */}
        <div className="flex w-full h-[65px] justify-between py-4 items-center">
          <div className="flex items-center gap-4">
            <TbTimeDuration45 size={25} className="stroke-gray-500" />
            <p className="text-md">กำหนดระยะเวลาต่อคาบ</p>
          </div>
          {isSetTimeslot ? (
            <p className=" text-gray-600">
              <b>{configData.Duration}</b> นาที
            </p>
          ) : (
            <Counter
              classifier="นาที"
              currentValue={configData.Duration}
              onChange={handleChangeDuration}
              isDisabled={isSetTimeslot}
            />
          )}
        </div>
        {/* Config time for start class */}
        <div className="flex w-full h-[65px] justify-between py-4 items-center">
          <div className="flex items-center gap-4">
            <LuClock10 size={25} className="stroke-gray-500" />
            <p className="text-md">กำหนดเวลาเริ่มคาบแรก</p>
          </div>
          {isSetTimeslot ? (
            <p className=" text-gray-600">
              <b>{configData.StartTime}</b> นาฬิกา
            </p>
          ) : (
            <input
              type="time"
              value={configData.StartTime}
              className="text-gray-500 outline-none h-[45px] border px-3 w-[140px]"
              onChange={handleChangeStartTime}
            />
          )}
        </div>
        {/* Config พักเล็ก */}
        <div className="flex w-full h-[65px] justify-between py-4 items-center mt-3">
          <div className="flex items-center gap-4">
            <MdLunchDining size={25} className="fill-gray-500" />
            <p className="text-md">กำหนดคาบพักเล็ก</p>
          </div>
          <div className="flex flex-col-reverse gap-4">
            {!addMiniBreak && !isSetTimeslot ? (
              <u
                className=" text-blue-500 cursor-pointer select-none"
                onClick={() => setAddMiniBreak(true)}
              >
                เพิ่มเวลาพักเล็ก
              </u>
            ) : !isSetTimeslot ? (
              <div className="flex gap-3 items-center">
                <p className="text-md text-gray-500">พักเล็กก่อนคาบที่</p>
                <Dropdown
                  width="100%"
                  height="40px"
                  data={breakSlotMap}
                  currentValue={String(configData.MiniBreak.SlotNumber)}
                  placeHolder="เลือกคาบ"
                  renderItem={({ data }: { data: any }): React.JSX.Element => (
                    <li className="w-[70px]">{data}</li>
                  )}
                  handleChange={handleChangeMiniBreak}
                  searchFunction={undefined}
                />
                <p className=" text-gray-500">เวลา</p>
                <input
                  disabled={isSetTimeslot}
                  type="number"
                  className="border w-14 h-10 rounded pl-2"
                  onChange={(e) =>
                    setConfigData(() => ({
                      ...configData,
                      MiniBreak: {
                        Duration: parseInt(e.target.value),
                        SlotNumber: configData.MiniBreak.SlotNumber,
                      },
                    }))
                  }
                  value={configData.MiniBreak.Duration}
                />
                <p className=" text-gray-500">นาที</p>
                <u
                  className=" text-blue-500 ml-4 cursor-pointer select-none"
                  onClick={() => setAddMiniBreak(false)}
                >
                  ยกเลิก
                </u>
              </div>
            ) : (
              <p className=" text-gray-600">
                ก่อนคาบที่ <b>{configData.MiniBreak.SlotNumber}</b> ระยะเวลา{" "}
                <b>{configData.MiniBreak.Duration}</b> นาที
              </p>
            )}
          </div>
        </div>
        {/* Config lunch time */}
        <div className="flex w-full h-auto justify-between py-4 items-center">
          <div className="flex items-center gap-4">
            <MdLunchDining size={25} className="fill-gray-500" />
            <p className="text-md">กำหนดคาบพักเที่ยง</p>
          </div>
          <div className="flex flex-col-reverse gap-4">
            <div className="flex justify-between items-center gap-3">
              <p className="text-md text-gray-500">มัธยมปลายคาบที่</p>
              {isSetTimeslot ? (
                <b className="text-md text-gray-600">
                  {configData.BreakTimeslots.Senior}
                </b>
              ) : (
                <Dropdown
                  width="100%"
                  height="40px"
                  data={breakSlotMap}
                  currentValue={String(configData.BreakTimeslots.Senior)}
                  placeHolder="เลือกคาบ"
                  renderItem={({ data }: { data: any }): React.JSX.Element => (
                    <li className="w-[70px]">{data}</li>
                  )}
                  handleChange={handleChangeBreakTimeS}
                  searchFunction={undefined}
                />
              )}
            </div>
            <div className="flex justify-between items-center gap-3">
              <p className=" text-gray-500">มัธยมต้นคาบที่</p>
              {isSetTimeslot ? (
                <b className=" text-gray-600">
                  {configData.BreakTimeslots.Junior}
                </b>
              ) : (
                <Dropdown
                  width="100%"
                  height="40px"
                  data={breakSlotMap}
                  currentValue={String(configData.BreakTimeslots.Junior)}
                  placeHolder="เลือกคาบ"
                  renderItem={({ data }: { data: any }): React.JSX.Element => (
                    <li className="w-[70px]">{data}</li>
                  )}
                  handleChange={handleChangeBreakTimeJ}
                  searchFunction={undefined}
                />
              )}
            </div>
          </div>
        </div>
        {/* Config day of week */}
        <div className="flex w-full h-[65px] justify-between py-4 items-center">
          <div className="flex items-center gap-4">
            <BsCalendar2Day size={25} className="fill-gray-500" />
            <p className="text-md">กำหนดวันในตารางสอน</p>
          </div>
          <div className="flex gap-3">
            <CheckBox
              label="วันจันทร์ - ศุกร์ (ค่าเริ่มต้น)"
              checked={true}
              disabled={true}
              value={""}
              name={""}
              handleClick={undefined}
            />
          </div>
        </div>
        <div className="flex w-full h-[65px] justify-between items-center">
          {isSaved ? (
            <p className="text-green-400">ตั้งค่าสำเร็จ !</p>
          ) : (
            <>
              <div>
                <PrimaryButton
                  handleClick={() => setIsActiveModal(true)}
                  title={"ลบเทอม"}
                  color={"danger"}
                  Icon={<DeleteIcon />}
                  reverseIcon={false}
                  isDisabled={!isSetTimeslot}
                />
              </div>
              <div className="flex gap-3">
                <PrimaryButton
                  handleClick={reset}
                  title={"คืนค่าเริ่มต้น"}
                  color={"secondary"}
                  Icon={<ReplayIcon />}
                  reverseIcon={false}
                  isDisabled={isSetTimeslot}
                />
                <PrimaryButton
                  handleClick={saved}
                  title={"ตั้งค่า"}
                  color={"success"}
                  Icon={<CheckIcon />}
                  reverseIcon={false}
                  isDisabled={isSetTimeslot}
                />
              </div>
            </>
          )}
        </div>
      </span>
    </>
  );
}

export default TimetableConfigValue;
