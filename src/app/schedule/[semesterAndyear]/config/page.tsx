/**"use client";

 * Timetable Configuration Page (Rebuilt)import CheckIcon from "@mui/icons-material/Check";

 * import ReplayIcon from "@mui/icons-material/Replay";

 * Modern config page using Zustand store, MUI v7, and real-time validation.import Dropdown from "@/components/elements/input/selected_input/Dropdown";

 * Features: edit mode, visual preview, validation feedback.import { useParams } from "next/navigation";

 * import React, { useEffect, useState, type JSX } from "react";

 * @module config/pageimport { BsTable, BsCalendar2Day } from "react-icons/bs";

 */import { LuClock10 } from "react-icons/lu";

import { MdSchool, MdLunchDining } from "react-icons/md";

'use client';import { TbTimeDuration45 } from "react-icons/tb";

import CheckBox from "@/components/mui/CheckBox";

import React, { useEffect, useState } from 'react';import PrimaryButton from "@/components/mui/PrimaryButton";

import { useParams } from 'next/navigation';import Counter from "./component/Counter";

import {import ConfirmDeleteModal from "./component/ConfirmDeleteModal";

  Container,import CloneTimetableDataModal from "./component/CloneTimetableDataModal";

  Box,import { closeSnackbar, enqueueSnackbar } from "notistack";

  Stack,import useSWR from "swr";

  Typography,import DeleteIcon from "@mui/icons-material/Delete";

  Button,import Loading from "@/app/loading";

  Alert,import {

  AlertTitle,  PageLoadingSkeleton,

  Chip,  NetworkErrorEmptyState,

  Grid2 as Grid,} from "@/components/feedback";

  Paper,

} from '@mui/material';// Server Actions (Clean Architecture)

import {import { getConfigByTermAction } from "@/features/config/application/actions/config.actions";

  Save as SaveIcon,import { createTimeslotsAction } from "@/features/timeslot/application/actions/timeslot.actions";

  Edit as EditIcon,function TimetableConfigValue() {

  Cancel as CancelIcon,  const params = useParams();

  Refresh as RefreshIcon,  const [semester, academicYear] = (params.semesterAndyear as string).split(

  Delete as DeleteIcon,    "-",

  ContentCopy as CopyIcon,  ); //from "1-2566" to ["1", "2566"]

} from '@mui/icons-material';  const [isCopying, setIsCopying] = useState(false);

import { enqueueSnackbar, closeSnackbar } from 'notistack';  const [isActiveModal, setIsActiveModal] = useState<boolean>(false);

import useSWR from 'swr';  const [isCloneDataModal, setIsCloneDataModal] = useState<boolean>(false);

  const [isSaved, setIsSaved] = useState<boolean>(false);

// Store  const [addMiniBreak, setAddMiniBreak] = useState<boolean>(false);

import { useConfigStore } from '@/features/config/presentation/stores/timetable-config.store';  const [configData, setConfigData] = useState({

    Days: ["MON", "TUE", "WED", "THU", "FRI"],

// Components    AcademicYear: parseInt(academicYear),

import { ConfigForm } from './_components/ConfigForm';    Semester: `SEMESTER_${semester}`,

import { TimeslotPreviewGrid } from './_components/TimeslotPreviewGrid';    StartTime: "08:30",

import { ValidationSummary } from './_components/ValidationSummary';    BreakDuration: 50,

import { PageLoadingSkeleton, NetworkErrorEmptyState } from '@/components/feedback';    BreakTimeslots: {

import ConfirmDeleteModal from './component/ConfirmDeleteModal';      Junior: 4,

import CloneTimetableDataModal from './component/CloneTimetableDataModal';      Senior: 5,

    },

// Actions    Duration: 50,

import { getConfigByTermAction } from '@/features/config/application/actions/config.actions';    TimeslotPerDay: 8,

import { createTimeslotsAction } from '@/features/timeslot/application/actions/timeslot.actions';    MiniBreak: {

import { updateConfigWithTimeslotsAction } from '@/features/config/application/actions/config.actions';      Duration: 10,

      SlotNumber: 2,

/**    },

 * Main config page component    HasMinibreak: false,

 */  });

export default function TimetableConfigPage() {  const [isSetTimeslot, setIsSetTimeslot] = useState(false); //ตั้งค่าไปแล้วจะ = true

  const params = useParams();  

  const [semester, academicYear] = (params.semesterAndyear as string).split('-');  // Fetch config data using Server Action

  const tableConfig = useSWR<any>(

  // Local state    `config-${academicYear}-${semester}`,

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);    async () => {

  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);      try {

  const [isCopying, setIsCopying] = useState(false);        const result = await getConfigByTermAction({

          AcademicYear: parseInt(academicYear),

  // Store state          Semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2",

  const mode = useConfigStore((state) => state.mode);        });

  const config = useConfigStore((state) => state.config);        return result;

  const isDirty = useConfigStore((state) => state.isDirty);      } catch (error) {

  const hasErrors = useConfigStore((state) => state.hasErrors);        console.error("Error fetching config:", error);

  const isLoading = useConfigStore((state) => state.isLoading);        return null;

  const validationErrors = useConfigStore((state) => state.validationErrors);      }

    },

  // Store actions  );

  const loadConfig = useConfigStore((state) => state.loadConfig);

  const setMode = useConfigStore((state) => state.setMode);  useEffect(() => {

  const resetToDefault = useConfigStore((state) => state.resetToDefault);    const checkSetTimeslot = tableConfig.data != undefined;

  const validateConfig = useConfigStore((state) => state.validateConfig);    console.log(tableConfig.isLoading);

  const setLoading = useConfigStore((state) => state.setLoading);    setIsSetTimeslot(() => checkSetTimeslot);

    if (tableConfig.data) {

  // Fetch existing config      setConfigData(tableConfig.data.Config);

  const { data: existingConfig, error, isLoading: isLoadingConfig, mutate } = useSWR(    }

    `config-${academicYear}-${semester}`,  }, [tableConfig.isValidating, academicYear, semester]);

    async () => {  const handleChangeStartTime = (e: any) => {

      try {    let value = e.target.value;

        const result = await getConfigByTermAction({    setConfigData(() => ({ ...configData, StartTime: value }));

          AcademicYear: parseInt(academicYear),  };

          Semester: `SEMESTER_${semester}` as 'SEMESTER_1' | 'SEMESTER_2',  const [breakSlotMap, setBreakSlotMap] = useState([]); //เอาไว้แมพเพื่อใช้กับ กำหนดคาบพักเที่ยง ข้อมูลตัวอย่าง => [1, 2, 3, 4, 5]

        });  useEffect(() => {

        return result;    let breakSlot = []; //ก่อน render เสร็จจะให้ set ค่า default หรือค่าที่ได้มาก่อน

      } catch (error) {    for (let i = 0; i < configData.TimeslotPerDay; i++) {

        return null;      breakSlot.push(i + 1);

      }    }

    }    setBreakSlotMap(breakSlot);

  );    let currentValue = configData.TimeslotPerDay;

    let breakJVal = configData.BreakTimeslots.Junior;

  // Initialize store on mount    let breakSVal = configData.BreakTimeslots.Senior;

  useEffect(() => {    if (breakJVal > currentValue || breakSVal > currentValue) {

    if (existingConfig?.data) {      let jVal = breakJVal > currentValue ? currentValue : breakJVal; //ถ้า range เกินจะเซ็ทเป็นค่าสูงสุดของ TimeSlotPerDay

      loadConfig(existingConfig.data.Config as any);      let sVal = breakSVal > currentValue ? currentValue : breakSVal;

    } else {      setConfigData(() => ({

      resetToDefault(parseInt(academicYear), `SEMESTER_${semester}`);        ...configData,

      setMode('create');        BreakTimeslots: { Junior: jVal, Senior: sVal },

    }      }));

  }, [existingConfig, academicYear, semester]);    } //เช็คว่าถ้าคาบพักเที่ยงมี range ที่เกินจำนวนคาบต่อวัน จะให้ set เป็นค่าสูงสุดของจำนวนคาบโดยอัตโนมัติ

  }, [configData.TimeslotPerDay]);

  // Handle save (create or update)  const handleChangeTimeSlotPerDay = (currentValue: number) => {

  const handleSave = async () => {    if (currentValue < 7 || currentValue > 10) {

    // Validate first      return;

    const isValid = validateConfig();    }

    if (!isValid) {    setConfigData(() => ({ ...configData, TimeslotPerDay: currentValue }));

      enqueueSnackbar('กรุณาแก้ไขข้อผิดพลาดก่อนบันทึก', { variant: 'error' });  };

      return;  const handleChangeDuration = (currentValue: number) => {

    }    if (currentValue < 30 || currentValue > 120) {

      return;

    setLoading(true);    }

    const saving = enqueueSnackbar('กำลังบันทึกการตั้งค่า...', {    setConfigData(() => ({

      variant: 'info',      ...configData,

      persist: true,      Duration: currentValue,

    });      BreakDuration: currentValue,

    }));

    try {  };

      if (mode === 'create') {  // const handleChangeBreakDuration = (currentValue: number) => {

        // Create new config with timeslots  //   setConfigData(() => ({ ...configData, BreakDuration: currentValue }));

        await createTimeslotsAction({  // };

          AcademicYear: parseInt(academicYear),  const handleChangeBreakTimeJ = (currentValue: number) => {

          Semester: `SEMESTER_${semester}` as 'SEMESTER_1' | 'SEMESTER_2',    setConfigData(() => ({

          ...config,      ...configData,

        });      BreakTimeslots: {

      } else {        Junior: currentValue,

        // Update existing config and regenerate timeslots        Senior: configData.BreakTimeslots.Senior,

        const configId = `${semester}-${academicYear}`;      },

        await updateConfigWithTimeslotsAction({    }));

          ConfigID: configId,  };

          Config: config as any,

        });  const handleChangeBreakTimeS = (currentValue: number) => {

      }    setConfigData(() => ({

      ...configData,

      closeSnackbar(saving);      BreakTimeslots: {

      enqueueSnackbar('บันทึกการตั้งค่าสำเร็จ', { variant: 'success' });        Senior: currentValue,

              Junior: configData.BreakTimeslots.Junior,

      // Reload config and switch to view mode      },

      await mutate();    }));

      setMode('view');  };

        const handleChangeMiniBreak = (currentValue: number) => {

    } catch (error) {    setConfigData(() => ({

      console.error('Config save error:', error);      ...configData,

      closeSnackbar(saving);      MiniBreak: {

      const errorMessage = error instanceof Error ? error.message : 'ไม่ทราบสาเหตุ';        Duration: configData.MiniBreak.Duration,

      enqueueSnackbar(`เกิดข้อผิดพลาด: ${errorMessage}`, { variant: 'error' });        SlotNumber: currentValue,

    } finally {      },

      setLoading(false);    }));

    }  };

  };  const reset = () => {

    setConfigData(() => ({

  // Handle edit mode      Days: ["MON", "TUE", "WED", "THU", "FRI"],

  const handleEdit = () => {      AcademicYear: parseInt(academicYear),

    setMode('edit');      Semester: `SEMESTER_${semester}`,

  };      StartTime: "08:30",

      BreakDuration: 50,

  // Handle cancel edit      BreakTimeslots: {

  const handleCancelEdit = () => {        Junior: 4,

    if (existingConfig?.data) {        Senior: 5,

      loadConfig(existingConfig.data.Config as any);      },

    }      Duration: 50,

    setMode('view');      TimeslotPerDay: 8,

  };      MiniBreak: {

        Duration: 10,

  // Handle reset to defaults        SlotNumber: 2,

  const handleReset = () => {      },

    resetToDefault(parseInt(academicYear), `SEMESTER_${semester}`);      HasMinibreak: false,

    enqueueSnackbar('คืนค่าเริ่มต้นสำเร็จ', { variant: 'success' });    }));

  };    enqueueSnackbar("คืนค่าเริ่มต้นสำเร็จ", { variant: "success" });

  };

  // Loading state

  if (isLoadingConfig && !isCopying) {  const saved = async () => {

    return <PageLoadingSkeleton />;    setIsSetTimeslot(true);

  }    const saving = enqueueSnackbar("กำลังตั้งค่าตาราง", {

      variant: "info",

  // Error state      persist: true,

  if (error && !existingConfig) {    });

    return (    try {

      <Container maxWidth="lg" sx={{ py: 4 }}>      const result = await createTimeslotsAction({

        <NetworkErrorEmptyState onRetry={() => mutate()} />        ...configData,

      </Container>        HasMinibreak: addMiniBreak,

    );        AcademicYear: parseInt(academicYear),

  }        Semester: `SEMESTER_${semester}` as "SEMESTER_1" | "SEMESTER_2",

      });

  const totalTimeslots = config.TimeslotPerDay * 5; // 5 days      

  const isReadonly = mode === 'view';      closeSnackbar(saving);

  const canSave = isDirty && !hasErrors && !isLoading;      enqueueSnackbar("ตั้งค่าตารางสำเร็จ", { variant: "success" });

      tableConfig.mutate();

  return (    } catch (error) {

    <>      console.log(error);

      {/* Modals */}      closeSnackbar(saving);

      {isDeleteModalOpen && (      const errorMessage = error instanceof Error ? error.message : "Unknown error";

        <ConfirmDeleteModal      enqueueSnackbar("เกิดข้อผิดพลาดในการตั้งค่าตาราง: " + errorMessage, { variant: "error" });

          closeModal={() => setIsDeleteModalOpen(false)}      setIsSetTimeslot(false);

          mutate={mutate}    }

          academicYear={academicYear}  };

          semester={semester}

        />  if (tableConfig.isLoading && !isCopying) {

      )}    return <PageLoadingSkeleton />;

      {isCloneModalOpen && (  }

        <CloneTimetableDataModal

          setIsCopying={setIsCopying}  if (tableConfig.error) {

          closeModal={() => setIsCloneModalOpen(false)}    return <NetworkErrorEmptyState onRetry={() => tableConfig.mutate()} />;

          mutate={mutate}  }

          academicYear={academicYear}

          semester={semester}  return (

        />    <>

      )}      {isCopying ? <Loading /> : null}

      {isActiveModal ? (

      <Container maxWidth="xl" sx={{ py: 4 }}>        <ConfirmDeleteModal

        <Stack spacing={4}>          closeModal={() => setIsActiveModal(false)}

          {/* Header */}          mutate={tableConfig.mutate}

          <Box>          academicYear={academicYear}

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>          semester={semester}

              <Typography variant="h4" fontWeight="bold">        />

                ตั้งค่าตารางเวลา      ) : null}

              </Typography>      {isCloneDataModal ? (

              <Chip        <CloneTimetableDataModal

                label={          setIsCopying={setIsCopying}

                  mode === 'create'          closeModal={() => setIsCloneDataModal(false)}

                    ? 'สร้างใหม่'          mutate={tableConfig.mutate}

                    : mode === 'edit'          academicYear={academicYear}

                    ? 'กำลังแก้ไข'          semester={semester}

                    : 'พร้อมใช้งาน'        />

                }      ) : null}

                color={      <span className="flex flex-col gap-3 my-5 px-3">

                  mode === 'create'        {!isSetTimeslot ? (

                    ? 'warning'          <div className="flex w-full py-4 justify-end items-center">

                    : mode === 'edit'            <u

                    ? 'info'              onClick={() => setIsCloneDataModal(true)}

                    : 'success'              className="text-blue-500 cursor-pointer hover:text-blue-600 duration-300"

                }            >

                variant="filled"              เรียกข้อมูลตารางสอนที่มีอยู่

              />            </u>

            </Stack>          </div>

            <Typography variant="body2" color="text.secondary">        ) : null}

              ภาคเรียนที่ {semester} / ปีการศึกษา {academicYear}        {/* Config timeslot per day */}

            </Typography>        <div className="flex w-full h-[65px] justify-between py-4 items-center">

          </Box>          <div className="flex items-center gap-4">

            <BsTable size={25} className="fill-gray-500" />

          {/* Clone option for new config */}            <p onClick={() => console.log(configData)} className="text-md">

          {mode === 'create' && (              กำหนดคาบต่อวัน

            <Alert severity="info" variant="outlined">            </p>

              <AlertTitle>สร้างการตั้งค่าใหม่</AlertTitle>          </div>

              <Stack direction="row" spacing={2} alignItems="center">          {isSetTimeslot ? (

                <Typography variant="body2">            <p className=" text-gray-600">

                  คุณสามารถเริ่มต้นด้วยค่าเริ่มต้น หรือ              <b>{configData.TimeslotPerDay}</b> คาบ

                </Typography>            </p>

                <Button          ) : (

                  size="small"            <Counter

                  startIcon={<CopyIcon />}              classifier="คาบ"

                  onClick={() => setIsCloneModalOpen(true)}              currentValue={configData.TimeslotPerDay}

                  variant="outlined"              onChange={handleChangeTimeSlotPerDay}

                >              isDisabled={isSetTimeslot}

                  คัดลอกจากเทอมอื่น            />

                </Button>          )}

              </Stack>        </div>

            </Alert>        {/* Config duration */}

          )}        <div className="flex w-full h-[65px] justify-between py-4 items-center">

          <div className="flex items-center gap-4">

          {/* Validation Summary */}            <TbTimeDuration45 size={25} className="stroke-gray-500" />

          <ValidationSummary            <p className="text-md">กำหนดระยะเวลาต่อคาบ</p>

            errors={validationErrors}          </div>

            totalTimeslots={totalTimeslots}          {isSetTimeslot ? (

            showSuccess={!hasErrors && mode !== 'create'}            <p className=" text-gray-600">

          />              <b>{configData.Duration}</b> นาที

            </p>

          {/* Main Content */}          ) : (

          <Grid container spacing={3}>            <Counter

            {/* Left: Config Form */}              classifier="นาที"

            <Grid size={{ xs: 12, lg: 6 }}>              currentValue={configData.Duration}

              <ConfigForm readonly={isReadonly} />              onChange={handleChangeDuration}

            </Grid>              isDisabled={isSetTimeslot}

            />

            {/* Right: Preview */}          )}

            <Grid size={{ xs: 12, lg: 6 }}>        </div>

              <TimeslotPreviewGrid config={config} />        {/* Config time for start class */}

            </Grid>        <div className="flex w-full h-[65px] justify-between py-4 items-center">

          </Grid>          <div className="flex items-center gap-4">

            <LuClock10 size={25} className="stroke-gray-500" />

          {/* Actions */}            <p className="text-md">กำหนดเวลาเริ่มคาบแรก</p>

          <Paper elevation={2} sx={{ p: 3, bgcolor: 'grey.50' }}>          </div>

            <Stack          {isSetTimeslot ? (

              direction={{ xs: 'column', sm: 'row' }}            <p className=" text-gray-600">

              spacing={2}              <b>{configData.StartTime}</b> นาฬิกา

              justifyContent="space-between"            </p>

              alignItems={{ xs: 'stretch', sm: 'center' }}          ) : (

            >            <input

              {/* Left actions */}              type="time"

              <Stack direction="row" spacing={2}>              value={configData.StartTime}

                {mode === 'view' && (              className="text-gray-500 outline-none h-[45px] border px-3 w-[140px]"

                  <Button              onChange={handleChangeStartTime}

                    variant="outlined"            />

                    color="error"          )}

                    startIcon={<DeleteIcon />}        </div>

                    onClick={() => setIsDeleteModalOpen(true)}        {/* Config พักเล็ก */}

                  >        <div className="flex w-full h-[65px] justify-between py-4 items-center mt-3">

                    ลบเทอม          <div className="flex items-center gap-4">

                  </Button>            <MdLunchDining size={25} className="fill-gray-500" />

                )}            <p className="text-md">กำหนดคาบพักเล็ก</p>

              </Stack>          </div>

          <div className="flex flex-col-reverse gap-4">

              {/* Right actions */}            {!addMiniBreak && !isSetTimeslot ? (

              <Stack direction="row" spacing={2}>              <u

                {mode === 'create' && (                className=" text-blue-500 cursor-pointer select-none"

                  <Button                onClick={() => setAddMiniBreak(true)}

                    variant="outlined"              >

                    startIcon={<RefreshIcon />}                เพิ่มเวลาพักเล็ก

                    onClick={handleReset}              </u>

                    disabled={isLoading}            ) : !isSetTimeslot ? (

                  >              <div className="flex gap-3 items-center">

                    คืนค่าเริ่มต้น                <p className="text-md text-gray-500">พักเล็กก่อนคาบที่</p>

                  </Button>                <Dropdown

                )}                  width="100%"

                  height="40px"

                {mode === 'view' && (                  data={breakSlotMap}

                  <Button                  currentValue={String(configData.MiniBreak.SlotNumber)}

                    variant="contained"                  placeHolder="เลือกคาบ"

                    startIcon={<EditIcon />}                  renderItem={({ data }: { data: any }): JSX.Element => (

                    onClick={handleEdit}                    <li className="w-[70px]">{data}</li>

                  >                  )}

                    แก้ไขการตั้งค่า                  handleChange={handleChangeMiniBreak}

                  </Button>                  searchFunction={undefined}

                )}                />

                <p className=" text-gray-500">เวลา</p>

                {mode === 'edit' && (                <input

                  <>                  disabled={isSetTimeslot}

                    <Button                  type="number"

                      variant="outlined"                  className="border w-14 h-10 rounded pl-2"

                      startIcon={<CancelIcon />}                  onChange={(e) =>

                      onClick={handleCancelEdit}                    setConfigData(() => ({

                      disabled={isLoading}                      ...configData,

                    >                      MiniBreak: {

                      ยกเลิก                        Duration: parseInt(e.target.value),

                    </Button>                        SlotNumber: configData.MiniBreak.SlotNumber,

                    <Button                      },

                      variant="contained"                    }))

                      startIcon={<SaveIcon />}                  }

                      onClick={handleSave}                  value={configData.MiniBreak.Duration}

                      disabled={!canSave}                />

                    >                <p className=" text-gray-500">นาที</p>

                      บันทึกการเปลี่ยนแปลง                <u

                    </Button>                  className=" text-blue-500 ml-4 cursor-pointer select-none"

                  </>                  onClick={() => setAddMiniBreak(false)}

                )}                >

                  ยกเลิก

                {mode === 'create' && (                </u>

                  <Button              </div>

                    variant="contained"            ) : (

                    startIcon={<SaveIcon />}              <p className=" text-gray-600">

                    onClick={handleSave}                ก่อนคาบที่ <b>{configData.MiniBreak.SlotNumber}</b> ระยะเวลา{" "}

                    disabled={!canSave}                <b>{configData.MiniBreak.Duration}</b> นาที

                    size="large"              </p>

                  >            )}

                    สร้างตารางเวลา          </div>

                  </Button>        </div>

                )}        {/* Config lunch time */}

              </Stack>        <div className="flex w-full h-auto justify-between py-4 items-center">

            </Stack>          <div className="flex items-center gap-4">

          </Paper>            <MdLunchDining size={25} className="fill-gray-500" />

        </Stack>            <p className="text-md">กำหนดคาบพักเที่ยง</p>

      </Container>          </div>

    </>          <div className="flex flex-col-reverse gap-4">

  );            <div className="flex justify-between items-center gap-3">

}              <p className="text-md text-gray-500">มัธยมปลายคาบที่</p>

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
                  renderItem={({ data }: { data: any }): JSX.Element => (
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
                  renderItem={({ data }: { data: any }): JSX.Element => (
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
