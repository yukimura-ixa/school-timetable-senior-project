"use client";
import React, { Fragment, useEffect, useState } from "react";
import SelectSubjectToTimeslotModal from "./SelectSubjectToTimeslotModal";
import { DragDropContext, Draggable } from "react-beautiful-dnd";
import { StrictModeDroppable } from "@/components/elements/dnd/StrictModeDroppable";
import api, { fetcher } from "@/libs/axios";
import { useParams, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import Loading from "@/app/loading";
import { subjectCreditValues } from "@/models/credit-value";
import { teacher } from "@prisma/client";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { dayOfWeekColor } from "@/models/dayofweek-color";
import { dayOfWeekTextColor } from "@/models/dayofWeek-textColor";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HttpsIcon from "@mui/icons-material/Https";
import PrimaryButton from "@/components/elements/static/PrimaryButton";
import SaveIcon from "@mui/icons-material/Save";
import BlockIcon from "@mui/icons-material/Block";
import { closeSnackbar, enqueueSnackbar } from "notistack";
type Props = {};
// TODO: เพิ่ม Tab มุมมองแต่ละชั้นเรียน ไว้ทีหลังเลย
// TODO: เสริม => เลือกห้องใส่วิชาไปเลยเพื่อความสะดวก
// TODO: ทำกรอบสีพักเที่ยง ม.ต้น/ปลาย  (ไว้ทีหลัง ยังไม่สำคัญ)
// TODO: ใช้ useMemo หรืออะไรก็ได้มา Cache ข้อมูลไว้ที
//! คาบล็อกชอบไม่โหลด ต้องอาศัยการกด reload อยู่ตลอด;

function TimeSlot(props: Props) {
  const params = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const searchTeacherID = useSearchParams().get("TeacherID");
  const searchGradeID = useSearchParams().get("GradeID");
  const [yearSelected, setYearSelected] = useState(null); //เก็บค่าของระดับชั้นที่ต้องสอนในวิชานั้นๆเพื่อใช้เช็คกับคาบพักเที่ยง
  const [storeSelectedSubject, setStoreSelectedSubject] = useState({}); //เก็บวิชาที่เรากดเลือก
  const [changeTimeSlotSubject, setChangeTimeSlotSubject] = useState({}); //สำหรับเก็บวิชาที่ต้องการเปลี่ยนในการเลือกวิชาครั้งแรก
  const [subjectPayload, setSubjectPayload] = useState({
    timeslotID: "",
    selectedSubject: {},
  }); //ใช้กับตอนเพิ่มห้องเรียนให้วิชา
  const [semester, academicYear] = (params.semesterAndyear as string).split(
    "-",
  ); //from "1-2566" to ["1", "2566"]
  const checkConflictData = useSWR(
    () =>
      "/class/checkConflict?AcademicYear=" +
      academicYear +
      "&Semester=SEMESTER_" +
      semester +
      "&TeacherID=" +
      searchTeacherID,
    fetcher,
    { revalidateOnFocus: false },
  );

  const fetchAllClassData = useSWR(
    () =>
      `/class?AcademicYear=${academicYear}&Semester=SEMESTER_${semester}&TeacherID=${searchTeacherID}`,
    fetcher,
    { revalidateOnFocus: false },
  );
  // const lockTimeslotData = useLockData(
  //   parseInt(academicYear),
  //   parseInt(semester)
  // );
  const fetchTeacher = useSWR(
    //ข้อมูลหลักที่ fetch มาจาก api
    () => `/teacher?TeacherID=` + searchTeacherID,
    fetcher,
    { revalidateOnFocus: false },
  );
  const fetchAllSubject = useSWR(
    //ข้อมูลหลักที่ fetch มาจาก api
    () =>
      `/assign?AcademicYear=` +
      academicYear +
      `&Semester=SEMESTER_` +
      semester +
      `&TeacherID=` +
      searchTeacherID,
    fetcher,
    { revalidateOnFocus: false },
  );
  // /timeslot?AcademicYear=2566&Semester=SEMESTER_2
  const fetchTimeSlot = useSWR(
    () =>
      `/timeslot?AcademicYear=` +
      academicYear +
      `&Semester=SEMESTER_` +
      semester,
    fetcher,
    { revalidateOnFocus: false },
  );
  const [isActiveModal, setIsActiveModal] = useState(false);
  const [subjectData, setSubjectData] = useState([]); //เก็บวิชากล่องบน
  const [lockData, setLockData] = useState([]);
  const [teacherData, setTeacherData] = useState<teacher>({
    Firstname: "",
    Lastname: "",
    Department: "",
    Prefix: "",
    TeacherID: null,
    Email: "",
  });
  const [timeSlotData, setTimeSlotData] = useState({
    AllData: [], //ใช้กับตารางด้านล่าง
    SlotAmount: [],
    StartTime: { Hours: 8, Minutes: 30 },
    Duration: 50,
    DayOfWeek: [],
    BreakSlot: [],
  });

  function fetchTimeslotData() {
    if (!fetchTimeSlot.isValidating) {
      let data = fetchTimeSlot.data;
      let dayofweek = data
        .map((day) => day.DayOfWeek)
        .filter(
          (item, index) =>
            data.map((day) => day.DayOfWeek).indexOf(item) === index,
        )
        .map((item) => ({
          Day: dayOfWeekThai[item],
          TextColor: dayOfWeekTextColor[item],
          BgColor: dayOfWeekColor[item],
        })); //filter เอาตัวซ้ำออก ['MON', 'MON', 'TUE', 'TUE'] => ['MON', 'TUE'] แล้วก็ map เป็นชุดข้อมูล object
      let slotAmount = data
        .filter((item) => item.DayOfWeek == "MON") //filter ข้อมูลตัวอย่างเป้นวันจันทร์ เพราะข้อมูลเหมือนกันหมด
        .map((item, index) => index + 1); //ใช้สำหรับ map หัวตารางในเว็บ จะ map จาก data เป็น number of array => [1, 2, 3, 4, 5, 6, 7]
      let breakTime = data
        .filter(
          (item) =>
            (item.Breaktime == "BREAK_BOTH" ||
              item.Breaktime == "BREAK_JUNIOR" ||
              item.Breaktime == "BREAK_SENIOR") &&
            item.DayOfWeek == "MON", //filter ข้อมูลตัวอย่างเป้นวันจันทร์ เพราะข้อมูลเหมือนกันหมด
        )
        .map((item) => ({
          TimeslotID: item.TimeslotID,
          Breaktime: item.Breaktime,
          SlotNumber: parseInt(item.TimeslotID.substring(10)),
        })); //เงื่อนไขที่ใส่คือเอาคาบพักออกมา
      let startTime = {
        Hours: new Date(data[0].StartTime).getHours() - 7, //พอแปลงมันเอาเวลาของ indo เลย -7 กลับไป
        Minutes: new Date(data[0].StartTime).getMinutes(),
      };
      let duration = getMinutes(
        new Date(data[0].EndTime).getTime() -
          new Date(data[0].StartTime).getTime(),
      ); //เอาเวลาจบลบเริ่มจะได้ duration
      setTimeSlotData(() => ({
        AllData: data.map((data) => ({ ...data, subject: {} })),
        SlotAmount: slotAmount,
        StartTime: startTime,
        Duration: duration,
        DayOfWeek: dayofweek,
        BreakSlot: breakTime,
      }));
    }
  }
  const [scheduledSubjects, setScheduledSubjects] = useState([]); //วิชาที่อยู่ในตารางอยู่แล้ว
  function fetchSubject() {
    const data = fetchAllSubject.data; //get data
    const mapSubjectByCredit = []; //สร้าง array เปล่ามาเก็บ
    for (const resp of data) {
      let loopCredit = subjectCreditValues[resp.Credit] * 2; //เอาค่าหน่วยกิตมา
      let filterSubjectLength = scheduledSubjects.filter(
        (item) => item.SubjectCode == resp.SubjectCode,
      ).length; //หาว่าจำนวนคาบอยู่ในตารางเท่าไหร่
      if (
        scheduledSubjects
          .map((item) => item.subject.SubjectCode)
          .includes(resp.SubjectCode)
      ) {
        //ถ้าเจอวิชาที่อยู่ใน timeslot
        loopCredit -= filterSubjectLength;
      }
      let delTime = loopCredit < 0 ? 0 : loopCredit;
      for (let i = 0; i < delTime; i++) {
        //map ตามหน่วยกิต * 2 จะได้จำนวนคาบที่ต้องลงช่องตารางจริงๆในหนึงวิชา
        mapSubjectByCredit.push(resp);
      }
    }
    setSubjectData(() =>
      mapSubjectByCredit.map((item, index) => ({ itemID: index + 1, ...item })),
    );
  }
  useEffect(() => {
    if (!fetchTeacher.isValidating) {
      setTeacherData(() => fetchTeacher.data);
    }
    if (!fetchTimeSlot.isLoading) {
      fetchTimeslotData();
    }
    if (!fetchAllClassData.isValidating) {
      fetchClassData();
    }
    if (!fetchAllSubject.isLoading) {
      fetchSubject();
    }
  }, [
    fetchTeacher.isValidating,
    fetchAllSubject.isLoading,
    fetchTimeSlot.isLoading,
    fetchAllClassData.isValidating,
  ]);

  function fetchClassData() {
    let puredata = fetchAllClassData.data;
    let data = puredata.map((item) => ({
      ...item,
      SubjectName: item.subject.SubjectName,
      RoomName: item.room?.RoomName || "ไม่มีห้องเรียน",
    }));
    let filterLock = data.filter((item) => item.IsLocked);
    let filterNotLock = data.filter((item) => !item.IsLocked);
    //คัดข้อมูลคาบล็อก
    let resFilterLock = []; //เก็บวิชาที่คัดซ้ำแล้ว
    let keepId = []; //สำหรับเก็บ timeSlotID เพื่อเช็คซ้ำ
    for (let i = 0; i < filterLock.length; i++) {
      if (keepId.length == 0 || !keepId.includes(filterLock[i].TimeslotID)) {
        //ถ้ายังไม่เคยมีการเช็คมาก่อนหรือยังไม่เจอไอเทมซ้ำ
        keepId.push(filterLock[i].TimeslotID); //เก็บไอดีที่เคยเพิ่มเอาไว้
        resFilterLock.push({
          ...filterLock[i],
          GradeID: [filterLock[i].GradeID],
        }); //เพิ่มข้อมูลลงไป
      } else {
        //ถ้าเจอไอเทมซ้ำ
        let tID = filterLock[i].TimeslotID; //get TimeslotID
        resFilterLock = resFilterLock.map((item) =>
          item.TimeslotID == tID //เช็คว่าเจอไอดีไหนให้ map ใส่อันนั้น
            ? { ...item, GradeID: [...item.GradeID, filterLock[i].GradeID] }
            : item,
        );
      }
    }
    //คัดข้อมูลคาบล็อก
    //หลังจากคัดข้อมูลเสร็จ นำข้อมูลคาบล็อกมารวมกับวิชาใน slot
    let concatClassData = filterNotLock.concat(resFilterLock);
    setScheduledSubjects(() => concatClassData);
    setLockData(() => resFilterLock);
    if (!fetchTimeSlot.isValidating && timeSlotData.AllData.length > 0) {
      setTimeSlotData(() => ({
        //นำวิชาลงไปใน Timeslot
        ...timeSlotData,
        AllData: timeSlotData.AllData.map((data) => {
          let checkMatchTimeslotID = concatClassData
            .map((id) => id.TimeslotID)
            .includes(data.TimeslotID); //เช็คว่า TimeslotID ตรงกันไหม
          if (checkMatchTimeslotID) {
            const addSubject = concatClassData.find(
              (item) => item.TimeslotID == data.TimeslotID,
            );
            const addData = {
              ...data,
              subject: addSubject,
            };
            return addData;
            //เอาข้อมูลที่เจอมาใส่
          } else {
            return {
              ...data,
            };
          }
        }),
      }));
    }
  }

  //convert millisec to min
  const getMinutes = (milliseconds: number) => {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    return minutes;
  };
  //get Hours
  const addHours = (time: Date, hours: number): Date => {
    //set เวลาด้วยการบวกตาม duration และคูณ hours ถ้าจะให้ skip ไปหลายชั่วโมง
    time.setMinutes(time.getMinutes() + timeSlotData.Duration * hours);
    return time;
  };
  const mapTime = () => {
    let map = [
      ...timeSlotData.SlotAmount.map((hour) => {
        //สร้าง format เวลา ตัวอย่าง => 2023-07-27T17:24:52.897Z
        let timeFormat = `0${timeSlotData.StartTime.Hours}:${
          timeSlotData.StartTime.Minutes == 0
            ? "00"
            : timeSlotData.StartTime.Minutes
        }`;
        //แยก เวลาเริ่มกับเวลาจบไว้ตัวแปรละอัน
        const timeStart = new Date(`2024-03-14T${timeFormat}:00.000Z`);
        const timeEnd = new Date(`2024-03-14T${timeFormat}:00.000Z`);
        //นำไปใส่ใน function addHours เพื่อกำหนดเวลาเริ่ม-จบ
        let start = addHours(timeStart, hour - 1); //เวลาเริ่มใส่ hours-1 เพราะคาบแรกไม่ต้องการให้บวกเวลา
        let end = addHours(timeEnd, hour); //จะต้องมากกว่า start ตาม duration ที่กำหนดไว้
        //แปลงจาก 2023-07-27T17:24:52.897Z เป็น 17:24 โดยใช้ slice
        return {
          Start: start.toISOString().slice(11, 16),
          End: end.toISOString().slice(11, 16),
        };
      }),
    ];
    return map;
  };
  async function postData() {
    let data = {
      TeacherID: parseInt(searchTeacherID),
      AcademicYear: parseInt(academicYear),
      Semester: "SEMESTER_" + semester,
      Schedule: timeSlotData.AllData,
    };
    // console.log(data);
    setIsSaving(true)
    const savingSnackbar = enqueueSnackbar("กำลังบันทึกข้อมูล...", { variant: "info", persist: true})

    try {
      const response = await api.post("/arrange", data);
      if (response.status == 200) {
        closeSnackbar(savingSnackbar)
        enqueueSnackbar("บันทึกข้อมูลสำเร็จ", { variant: "success" });
        fetchAllClassData.mutate();
        setIsSaving(false)
      }
    } catch (error) {
      console.log(error);
      closeSnackbar(savingSnackbar)
      enqueueSnackbar("เกิดข้อผิดพลาดในการบันทึกข้อมูล", { variant: "error" });
      setIsSaving(false)
    }
  }
  const addSubjectToSlot = (subject: object, timeSlotID: string) => {
    let data = timeSlotData.AllData; //นำช้อมูลตารางมา
    setTimeSlotData(() => ({
      ...timeSlotData,
      AllData: data.map((item) =>
        item.TimeslotID == timeSlotID ? { ...item, subject: subject } : item,
      ),
    })); //map วิชาลงไปใน slot
    setSubjectData(() =>
      subjectData.filter((item) => item.itemID != subject.itemID),
    ); //เอาวิชาที่ถูกจัดลงออกไป
    setStoreSelectedSubject({}), setYearSelected(null); //หลังจากเพิ่มวิชาแล้วก็ต้องรีการ select วิชา
    setIsActiveModal(false);
  };
  const cancelAddRoom = (subject: object, timeSlotID: string) => {
    //ถ้ามีการกดยกเลิกหรือปิด modal
    removeSubjectFromSlot(subject, timeSlotID); //ลบวิชาออกจาก timeslot ที่ได้ไป hold ไว้ตอนแรก
    setStoreSelectedSubject({}), setYearSelected(null);
    setIsActiveModal(false);
  };
  const removeSubjectFromSlot = (subject: object, timeSlotID: string) => {
    //ถ้ามีการกดลบวิชาออกจาก timeslot
    let data = timeSlotData.AllData; //ดึงข้อมูล timeslot มา
    returnSubject(subject); // คืนวิชาลงกล่องพักวิชา
    setTimeSlotData(() => ({
      ...timeSlotData,
      AllData: data.map((item) =>
        item.TimeslotID == timeSlotID ? { ...item, subject: {} } : item,
      ),
    }));
  };
  const returnSubject = (subject: object) => {
    delete subject.RoomName; //ลบ property RoomName ออกจาก object ก่อนคืน
    delete subject.ClassID; //ลบ property ClassID ออกจาก object ก่อนคืน
    setSubjectData(() => [...subjectData, subject]);
  };
  useEffect(() => {
    if (!checkConflictData.isValidating) {
      onSelectSubject();
    }
  }, [storeSelectedSubject, changeTimeSlotSubject]);

  function onSelectSubject() {
    const clearScheduledData = () => {
      setTimeSlotData({
        ...timeSlotData,
        AllData: timeSlotData.AllData.map((item) =>
          item.subject.Scheduled ? { ...item, subject: {} } : item,
        ),
      });
    };
    if (!isSelectedToAdd() && !isSelectedToChange()) {
      clearScheduledData();
    } else {
      const selectedGradeID = !isSelectedToChange()
        ? storeSelectedSubject.GradeID
        : changeTimeSlotSubject.GradeID;
      const scheduledGradeIDTimeslot = checkConflictData.data
        .filter((item) => item.GradeID == selectedGradeID)
        .map((slot) => ({
          ...slot,
          Scheduled: true,
          SubjectName: slot.subject.SubjectName,
          RoomName: slot.room.RoomName,
        }));
      if (scheduledGradeIDTimeslot.length > 0) {
        clearScheduledData();
        setTimeSlotData({
          ...timeSlotData,
          AllData: timeSlotData.AllData.map((item) =>
            Object.keys(item.subject).length !== 0
              ? item
              : scheduledGradeIDTimeslot
                    .map((slot) => slot.TimeslotID)
                    .includes(item.TimeslotID)
                ? {
                    ...item,
                    subject: scheduledGradeIDTimeslot.filter(
                      (data) => data.TimeslotID == item.TimeslotID,
                    )[0],
                  }
                : item,
          ),
        });
      } else {
        clearScheduledData();
      }
    }
  }
  const handleDragStart = (result) => {
    const { source } = result;
    let index = source.index;
    if (source.droppableId == "SUBJECTS") {
      //ถ้ามีการลากวิชาออกมา จะ set ว่า isDragging = true เพื่อบอกว่า เรากำลังลากอยู่นะ
      if (Object.keys(storeSelectedSubject).length == 0) {
        clickOrDragToSelectSubject(subjectData[index]);
      }
    } else {
      //ถ้าลากวิชาเพื่อสลับวิชา
      let timeslotID = source.droppableId; //นำ timeslotID ขึ้นมา
      let getSubjectFromTimeslot = timeSlotData.AllData.filter(
        (item) => item.TimeslotID == timeslotID,
      )[0]; //เอาวิชาที่อยู่ใน timeslot ออกมา
      if (Object.keys(changeTimeSlotSubject).length == 0) {
        //ถ้า action คือการเพิ่มวิชา
        clickOrDragToChangeTimeSlot(
          getSubjectFromTimeslot.subject,
          timeslotID,
          false,
        );
      }
    }
    // console.log(result);
  };
  const handleDragEnd = (result) => {
    const { source, destination, type } = result;
    if (!destination) return;
    if (
      source.droppableId == "SUBJECTS" &&
      destination.droppableId !== "SUBJECTS"
    ) {
      //ถ้าลากวิชามาลงกล่องเพิ่อเพื่ม
      addRoomModal(destination.droppableId); //destination.droppableId = timeslotID
      clickOrDragToSelectSubject(subjectData[source.index]);
    } else if (
      source.droppableId !== "SUBJECTS" &&
      destination.droppableId !== "SUBJECTS"
    ) {
      //ถ้าเป็นการลากสลับ/เปลี่ยนช่อง
      let desti_tID = destination.droppableId; //นำ timeslotID ปลายทางขึ้นมา
      let getSubjectFromTimeslot = timeSlotData.AllData.filter(
        (item) => item.TimeslotID == desti_tID,
      )[0]; //เอาวิชาที่อยู่ใน timeslot ออกมา
      clickOrDragToChangeTimeSlot(
        getSubjectFromTimeslot.subject,
        desti_tID,
        false,
      );
    }
    // console.log(result);
  };
  const dropOutOfZone = (subject: object) => {
    //function เช็คว่าถ้ามีการ Drop item นอกพื้นที่ Droppable จะให้นับเวลาถอยหลัง 0.5 วิเพื่อยกเลิกการเลือกวิชาที่ลาก
    setTimeout(() => {
      if (Object.keys(changeTimeSlotSubject).length == 0) {
        //ถ้าเป็นลากเพิ่มวิชา
        clickOrDragToSelectSubject(subject);
      } else {
        //ถ้าเป็นการลากเปลี่ยนวิชา
        clickOrDragToChangeTimeSlot(subject, "", false); //param ตัวที่สองไม่ต้องใส่อยู่แล้วเพราะไม่ได้ใช้ในการยกเลิกรายการ
      }
    }, 500);
  };
  const clickOrDragToSelectSubject = (subject: object) => {
    let checkDulpicateSubject = subject === storeSelectedSubject ? {} : subject; //ถ้าวิชาที่ส่งผ่าน params เข้ามาเป็นตัวเดิมจะให้มัน unselected วิชา
    if (
      Object.keys(storeSelectedSubject).length == 0 ||
      checkDulpicateSubject
    ) {
      let year = subject.gradelevel.Year; //เอาปีมา
      setYearSelected(subject === storeSelectedSubject ? null : year); //set ชั้นปีที่เรากดเลือกไว้
    }
    setStoreSelectedSubject(checkDulpicateSubject); //ละก็นำวิชาไป hold
    setChangeTimeSlotSubject({}); //set ให้เป็น object เปล่าเนื่องจากถ้ากดเปลี่ยนแล้วไปกดเพิ่มวิชามันจะได้ไม่แสดงปุ่มซ้อนกัน
    setTimeslotIDtoChange(() => ({ source: "", destination: "" }));
  };
  const addRoomModal = (timeslotID: string) => {
    //เพิ่มห้องเรียนลงในวิชาผ่านโมดอล
    if (Object.keys(storeSelectedSubject).length == 0)
      return; //ดักไว้เฉยๆว่าถ้าไม่ได้เลือกวิชาจะไม่สามารถทำไรได้
    else {
      setSubjectPayload(() => ({
        timeslotID: timeslotID,
        selectedSubject: storeSelectedSubject,
      })); //set ข้อมูลก่อนส่งไปให้ modal
      addSubjectToSlot(storeSelectedSubject, timeslotID); //เพิ่มวิชาลงไปใน slot ก่อน ทำเนียนๆไป
      setIsActiveModal(true);
      setScheduledSubjects([...scheduledSubjects, storeSelectedSubject]);
    }
  };
  const [destinationSubject, setDestinationSubject] = useState({}); //วิชาปลายทางที่จะเปลี่ยน
  const [timeslotIDtoChange, setTimeslotIDtoChange] = useState({
    source: "",
    destination: "",
  }); //เก็บ timeslotID ต้นทางและปลายทางเพื่อใช้สลับวิชา
  const [isCilckToChangeSubject, setIsCilckToChangeSubject] =
    useState<boolean>(false); //ถ้าคลิกเพื่อเปลี่ยนวิชาจะ = true และนำไปใช้กับ disabledDrag ทำให้ลากไอเทมมั่วซั่วตอนคลิกเปลี่ยนวิชา
  const [showErrorMsgByTimeslotID, setShowErrorMsgByTimeslotID] =
    useState<string>(""); //
  const [showLockDataMsgByTimeslotID, setShowLockDataMsgByTimeslotID] =
    useState<string>(""); //
  const clickOrDragToChangeTimeSlot = (
    subject: object,
    timeslotID: string,
    isClickToChange: boolean,
  ) => {
    let checkDulpicateSubject = subject === changeTimeSlotSubject; //เช็คว่ามีการกดวิชาที่เลือกอยู่แล้วหรือไม่
    if (
      Object.keys(changeTimeSlotSubject).length == 0 ||
      checkDulpicateSubject
    ) {
      //ถ้ายังไม่มีการกดเพิ่มวิชาหรือมีวิชาที่กดซ้ำแล้ว ให้ set วิชาตามเงื่อนไขของ toggleChange
      let year = subject.gradelevel.Year;
      setIsCilckToChangeSubject(() =>
        checkDulpicateSubject ? false : isClickToChange,
      ); //DRAG = false, CLICK = true
      setChangeTimeSlotSubject(() => (checkDulpicateSubject ? {} : subject));
      setTimeslotIDtoChange(() =>
        checkDulpicateSubject
          ? { source: "", destination: "" }
          : { ...timeslotIDtoChange, source: timeslotID },
      );
      setYearSelected(checkDulpicateSubject ? null : year);
    } else if (timeslotIDtoChange.source !== "") {
      //ถ้าเกิดเลือกวิชาไว้แล้ว แล้วกดเลือกปลายทาง
      setTimeslotIDtoChange(() => ({
        ...timeslotIDtoChange,
        destination: timeslotID,
      })); //เพิ่ม timeslotID ปลายทาง
      setDestinationSubject(() => subject); //เพิ่มวิชาปลายทาง
      setIsCilckToChangeSubject(() => false);
      //เมื่อ timeslotID ปลายทางถูกเพิ่มแล้ว useEffect ด้านล่างจะรับหน้าที่ต่อเอง
    }
    setStoreSelectedSubject({}); //set ให้เป็น object เปล่าเนื่องจากถ้ากดเปลี่ยนแล้วไปกดเพิ่มวิชามันจะได้ไม่แสดงปุ่มซ้อนกัน
  };
  useEffect(() => {
    //useEfftct ตัวนี้จะคอยจับการเปลี่ยนแปลงของวิชาปลายทางที่จะเปลี่ยน ถ้ามีการกดวิชาปลายทาง ในนี้จะทำงานในเงื่อนไข if
    if (timeslotIDtoChange.destination !== "") {
      changeSubjectSlot(); //ทำการเรียกฟังก์ชั่นเปลี่ยนวิชา
      setTimeslotIDtoChange(() => ({ source: "", destination: "" })); //reset timeslotID ต้นทางและปลายทาง
      setChangeTimeSlotSubject({}), setDestinationSubject({}); //reset วิชาต้นทางและปลายทางที่เลือกไว้
      setYearSelected(null); //reset ปีที่ทำการเช็คคาบพักเที่ยง
    }
  }, [timeslotIDtoChange.destination]);
  const changeSubjectSlot = () => {
    let sourceSubj = changeTimeSlotSubject; //เก็บวิชาต้นทาง
    let destinationSubj = destinationSubject; //เก็บวิชาปลายทาง
    let sourceTimeslotID = timeslotIDtoChange.source;
    let destinationTimeslotID = timeslotIDtoChange.destination;
    setTimeSlotData(() => ({
      ...timeSlotData,
      AllData: timeSlotData.AllData.map((item) =>
        item.TimeslotID == sourceTimeslotID
          ? { ...item, subject: destinationSubj }
          : item.TimeslotID == destinationTimeslotID
            ? { ...item, subject: sourceSubj }
            : item,
      ),
    })); //map สลับวิชา
  };
  const checkBreakTimeOutOfRange = (
    breakTimeState: string,
    year: number,
  ): boolean => {
    //เช็คคาบพักจากการกดเปลี่ยนวิชานอกคาบพัก
    //สรุปสั้นๆเป็นตัวอย่าง => การเช็คของฟังก์ชั่นนี้ก็คือ ถ้าเลือกสลับวิชามอต้นที่อยู่ในคาบพัก(วิชามอต้นจะอยู่ในคาบพักมอปลาย) จะแลกได้แค่วิชาของมอต้นเท่านั้น แต่ถ้าเลือกสลับวิชามอต้นที่อยู่นอกคาบพักก็จะแลกไม่ได้แค่วิชาที่อยู่ในคาบพักมอต้น
    if (timeslotIDtoChange.source !== "") {
      let getBreaktime = timeSlotData.AllData.filter(
        (item) => item.TimeslotID == timeslotIDtoChange.source,
      )[0].Breaktime; //หาสถานะของคาบเรียนจากการกดปุ่มเปลี่ยนที่ TimeslotID นั้นๆ
      if (getBreaktime == "BREAK_JUNIOR") {
        //ถ้ากดโดนคาบพักมอต้น
        return [4, 5, 6].includes(year) ? false : true; //เช็คว่าเป็นวิชามอปลายมั้ย ถ้าใช้ก็ส่ง false ไป
        //ในจุดที่เรียกใช้ func นี้ สถานะ false จะเป็นการแสดงปุ่มเปลี่ยนวิชา
      } else if (getBreaktime == "BREAK_SENIOR") {
        //ถ้ากดโดนคาบพักมอปลาย
        return [1, 2, 3].includes(year) ? false : true; //เช็คว่าเป็นวิชามอต้นมั้ย
      } else {
        return checkBreakTime(breakTimeState); //ถ้าไม่ใช่คาบพักให้ส่ง state มาเช็คกับคาบพัก ถ้าเป็นคาบพักมันก็จะ disabled ให้เอง
      }
    } else {
      //ถ้าไม่มีการกดปุ่มเปลี่ยน ก็จะ return false เป็น default
      return false;
    }
  };
  const checkRelatedYearDuringDragging = (year: number) => {
    //ใช้กับ isDropDisabled
    if (timeslotIDtoChange.source !== "") {
      let getBreaktime = timeSlotData.AllData.filter(
        (item) => item.TimeslotID == timeslotIDtoChange.source,
      )[0].Breaktime; //หาสถานะของคาบเรียนจากการกดปุ่มเปลี่ยนที่ TimeslotID นั้นๆ
      let findYearRange = [1, 2, 3].includes(yearSelected)
        ? [1, 2, 3]
        : [4, 5, 6]; //หา range ก่อนว่าวิชาที่จะเปลี่ยนนั้น drag วิชาของชั้นปีไหนไว้
      return getBreaktime !== "NOT_BREAK"
        ? !findYearRange.includes(year)
        : false; //พอเจอแล้วก็เอาปีที่เราส่งค่าไปหา ถ้าค่าสัมพันธ์กันก็จะใส่นิเสธให้เป็น false เพื่อเปิดช่องให้สลับวิชาได้
    }
  };
  const checkBreakTime = (breakTimeState: string): boolean => {
    //เช็คคาบพักแบบมอต้นและปลาย
    let result: boolean =
      ((isSelectedToAdd() || isSelectedToChange()) && //ถ้ามีการกดเลือกวิชาหรือกดเปลี่ยนวิชา
        breakTimeState == "BREAK_JUNIOR" &&
        [1, 2, 3].includes(yearSelected)) || //สมมติเช็คว่าถ้าคาบนั้นเป็นคาบพักของมอต้น จะนำวิชาที่คลิกเลือกมาเช็คว่า Year มันอยู่ใน [1, 2, 3] หรือไม่
      (breakTimeState == "BREAK_SENIOR" && [4, 5, 6].includes(yearSelected));
    return breakTimeState == "BREAK_BOTH" ? true : result;
  };
  const timeSlotCssClassName = (
    breakTimeState: string,
    subjectInSlot: object,
  ) => {
    let isSubjectInSlot = Object.keys(subjectInSlot).length !== 0; //ถ้ามีวิชาในตาราง
    //เช็คคาบพักเมื่อไมีมีการกดเลือกวิชา (ตอนยังไม่มี action ไรเกิดขึ้น)
    // let condition: boolean =
    //   Object.keys(storeSelectedSubject).length <= 1 &&
    //   Object.keys(changeTimeSlotSubject).length == 0
    //   && //ถ้าไม่มีการกดเลือกหรือเปลี่ยนวิชาเลย
    //   (breakTimeState == "BREAK_BOTH" ||
    //     breakTimeState == "BREAK_JUNIOR" ||
    //     breakTimeState == "BREAK_SENIOR") &&
    //   Object.keys(subjectInSlot).length == 0; //เช็คว่ามีคาบพักมั้ย
    let disabledSlot = `grid flex justify-center h-[76px] text-center items-center rounded border relative border-[#ABBAC1] bg-gray-100 duration-200
                        ${
                          subjectInSlot.Scheduled ? "opacity-35" : "opacity-100"
                        }`; //slot ปิดตาย (คาบพัก)
    let enabledSlot = `grid items-center justify-center h-[76px] rounded border-2 relative border-[#ABBAC1] bg-white
                      ${
                        isSelectedToAdd() && !isSubjectInSlot //ถ้ามีการเกิด action กำลังลากวิชาหรือมีการกดเลือกวิชา จะแสดงสีเขียวพร้อมกระพริบๆช่องที่พร้อมลง
                          ? "border-emerald-300 cursor-pointer border-dashed"
                          : (
                                isSubjectInSlot
                                  ? displayErrorChangeSubject(
                                      breakTimeState,
                                      subjectInSlot.gradelevel.Year,
                                    )
                                  : false
                              )
                            ? "border-red-300"
                            : isSelectedToChange() //ถ้ากดเปลี่ยนวิชา จะให้กรอบสีฟ้า
                              ? "border-blue-300 border-dashed"
                              : isSubjectInSlot //ถ้ามีวิชาที่ลงแล้ว จะให้กรอบเป็นสีแดง
                                ? "border-red-300"
                                : "border-dashed" //ถ้าไม่มีวิชาอยู่ในช่อง จะให้แสดงเป็นเส้นกรอบขีดๆเอาไว้
                      } 
                      duration-200`;
    return subjectInSlot.Scheduled
      ? disabledSlot
      : typeof subjectInSlot.GradeID !== "string" &&
          Object.keys(subjectInSlot).length !== 0
        ? disabledSlot //ถ้าเป็นคาบล็อก (ตอนนี้เช็คจาก GradeID ของคาบที่อยู่ใน slot แล้ว)
        : checkBreakTime(breakTimeState) &&
            Object.keys(subjectInSlot).length == 0
          ? disabledSlot
          : enabledSlot; //ถ้าเงื่อนไขคาบพักเป็นจริง จะปิด slot ไว้
    //condition คือเงื่อนไขที่เช็คว่า timeslot มีคาบพัก default และไม่มีการ action เลือกวิชาใช่หรือไม่ ถ้าใช้ก็จะปิด slot
    //checkBreakTime(breakTimeState) คือการส่งสถานะของคาบพักไปเช็คว่าเป็นคาบพักของมอต้นหรือมอปลาย จะใชร่วมกับตอนกดเลือกวิชาเพื่อเพิ่มหรือเลือกวิชาเพื่อสลับวืชา
    //&& Object.keys(subjectInSlot).length == 0 ส่วนอันนี้คือเช็คว่าถ้าไม่มีวิชาใน slot จะปิดคาบไว้
  };
  const isSelectedToAdd = (): boolean => {
    return Object.keys(storeSelectedSubject).length !== 0; //ถ้ามีการกดเลือกวิชาเพื่อเพิ่มข้อมูล จะ = true
  };
  const isSelectedToChange = (): boolean => {
    return Object.keys(changeTimeSlotSubject).length !== 0;
  };
  const displayErrorChangeSubject = (
    Breaktime: string,
    Year: number,
  ): boolean => {
    // Object.keys(storeSelectedSubject).length !== 0 ? 'none' //ถ้าเกิดกดเลือกวิชาเพื่อจะเพิ่มลง จะไม่แสดงปุ่มสลับวิชา
    // : //เงื่อนไขต่อมา ถ้ามีการกดเพื่อที่จะสลับวิชาแต่เลือกวิชาที่อยู่ใน slot คาบพัก จะให้ปุ่มแสดงแค่แถวพักแถวเดียว (กดเลือกชั้นปีมอปลาย แต่อยู่ใน break มอต้น มันจะ return false)
    // checkBreakTime(Breaktime)
    // || //เงื่อนไขสุดท้าย ถ้าไม่ได้เลือกวิชาที่อยู่ในคาบพัก จะให้เรียก function นี้ มันทำงานยังไงก็ไปดูข้างบนเอา มึนแล้ว ;-;
    // Breaktime == "NOT_BREAK" ? checkBreakTimeOutOfRange(Breaktime, Year) : false
    return checkBreakTime(Breaktime) || Breaktime == "NOT_BREAK"
      ? checkBreakTimeOutOfRange(Breaktime, Year)
      : false;
  };
  return (
    <>
      {isActiveModal ? (
        <SelectSubjectToTimeslotModal
          addSubjectToSlot={addSubjectToSlot} //ส่ง function
          cancelAddRoom={cancelAddRoom} //ส่ง function
          payload={subjectPayload} //ส่งชุดข้อมูล
        />
      ) : null}
      {fetchAllClassData.isValidating ? (
        <Loading />
      ) : (
        <>
          <div className="w-full flex justify-between items-center">
            <div className="p-4 mt-4 flex gap-3">
              <p className="text-sm">ตารางสอนของ</p>
              <p className="text-sm font-bold">
                คุณครู {teacherData.Firstname} {teacherData.Lastname}
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <div className="flex gap-3 items-center">
                <div className="w-6 h-6 bg-white border border-dashed rounded border-gray-500" />
                <p className="text-xs select-none">คาบว่าง</p>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-6 h-6 bg-gray-200 border border-gray-300 rounded" />
                <p className="text-xs select-none">คาบพัก</p>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-6 h-6 bg-white border-green-300 border border-dashed rounded flex items-center justify-center">
                  <AddCircleIcon style={{ width: "12px", color: "#10b981" }} />
                </div>
                <p className="text-xs select-none">เพิ่มคาบ</p>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-6 h-6 bg-white border-blue-300 border border-dashed rounded flex items-center justify-center">
                  <ChangeCircleIcon
                    style={{ width: "12px", color: "#345eeb" }}
                    className="rotate-90"
                  />
                </div>
                <p className="text-xs select-none">สลับคาบ</p>
              </div>
              <div className="flex gap-3 items-center">
                <div className="relative w-6 h-6 bg-white border-red-300 border rounded flex items-center justify-center"></div>
                <p className="text-xs select-none">มีวิชาแล้ว</p>
              </div>
              <div className="flex gap-3 items-center relative">
                <div className="w-6 h-6 bg-gray-200 border border-gray-300 rounded flex items-center justify-center">
                  <HttpsIcon
                    style={{ width: "12px", color: "#3d3d3d" }}
                    className="absolute top-[-10px] left-[-4px]"
                  />
                </div>
                <p className="text-xs select-none">คาบล็อก</p>
              </div>
            </div>
          </div>
          <DragDropContext
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
          >
            {/* กล่องบน */}
            <div className="flex flex-col w-full border border-[rgb(237,238,243)] p-4 gap-4 mt-4">
              <p
                className="text-sm"
                onClick={() => {
                  // console.log(timeSlotData.AllData.map((data) => ({ ...data, subject: lockData.filter(ts => ts.timeslots.map(id => id.TimeslotID).includes(data.TimeslotID))[0] })))
                  console.log(timeSlotData);
                  console.log(1062 / timeSlotData.SlotAmount.length - 10);
                  console.log(fetchAllClassData);
                }}
              >
                วิชาที่สามารถจัดลงได้ <b>(คลิกหรือลากวิชาที่ต้องการ)</b>
              </p>
              <div className="flex w-full text-center">
                <StrictModeDroppable
                  droppableId="SUBJECTS"
                  direction="horizontal"
                >
                  {(provided, snapshot) => (
                    <div
                      className="grid w-full h-[125px] text-center grid-cols-8 overflow-y-scroll overflow-x-hidden"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {subjectData.map((item, index) => (
                        <Fragment
                          key={`${item.SubjectCode}-${item.GradeID}-${index}`}
                        >
                          <Draggable
                            draggableId={`${item.SubjectCode}-Grade-${item.GradeID}-Index-${index}`}
                            key={`${item.SubjectCode}-Grade-${item.GradeID}-Index-${index}`}
                            index={index}
                          >
                            {(provided, snapshot) => {
                              if (snapshot.isDropAnimating) {
                                //เช็คว่ามีการปล่อยเมาส์มั้ย
                                dropOutOfZone(item); //ถ้ามีก็เรียกใช้ฟังก์ชั่นพร้อมส่งวิชาที่เลือกลงไป
                              }
                              return (
                                <>
                                  <div
                                    className={`w-[85%] h-fit flex flex-col my-1 py-1 border rounded cursor-grab ${
                                      storeSelectedSubject == item //ถ้าคลิกหรือลากวิชา จะแสดงเขียวๆกะพริบๆ
                                        ? "bg-green-200 hover:bg-green-300 border-green-500 animate-pulse"
                                        : "bg-white hover:bg-slate-50"
                                    } duration-100 select-none`}
                                    {...provided.dragHandleProps}
                                    {...provided.draggableProps}
                                    ref={provided.innerRef}
                                    onClick={() =>
                                      clickOrDragToSelectSubject(item)
                                    }
                                  >
                                    <b className="text-sm">
                                      {item.SubjectCode}
                                    </b>
                                    <p className="text-sm">
                                      {item.SubjectName.substring(0, 8)}...
                                    </p>
                                    <b className="text-xs">
                                      ม.{item.GradeID[0]}/
                                      {parseInt(item.GradeID.substring(1, 2)) <
                                      10
                                        ? item.GradeID[2]
                                        : item.GradeID.substring(1, 2)}
                                    </b>
                                    <p className="text-xs">
                                      {teacherData.Firstname}
                                    </p>
                                  </div>
                                </>
                              );
                            }}
                          </Draggable>
                        </Fragment>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </StrictModeDroppable>
              </div>
            </div>
            <div className="w-full flex justify-end items-center mt-3">
              <PrimaryButton
                handleClick={postData}
                title={"บันทึกข้อมูล"}
                color={"success"}
                Icon={<SaveIcon />}
                reverseIcon={false}
                isDisabled={isSaving}
              />
            </div>
            <table className="table-auto w-full flex flex-col gap-3 mt-4 mb-10">
              <thead>
                <tr className="flex gap-4">
                  <th className="flex items-center bg-gray-100 justify-center p-[10px] h-[53px] rounded select-none">
                    <span className="flex text-gray-600 font-light w-[50px] h-[24px] justify-center">
                      คาบที่
                    </span>
                  </th>
                  {/* Map จำนวนคาบ */}
                  {timeSlotData.SlotAmount.map((item) => (
                    <Fragment key={`woohoo${item}`}>
                      <th className="flex font-light bg-gray-100 grow items-center justify-center p-[10px] h-[53px] rounded select-none">
                        <p className="text-gray-600">
                          {item < 10 ? `0${item}` : item}
                        </p>
                      </th>
                    </Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className="flex flex-col gap-3">
                <tr className="flex gap-4">
                  <td className="flex items-center bg-gray-100 justify-center p-[10px] h-full rounded">
                    <span className="flex w-[50px] justify-center">
                      <p className="text-gray-600">เวลา</p>
                    </span>
                  </td>
                  {/* Map duration ของคาบเรียน */}
                  {mapTime().map((item) => (
                    <Fragment key={`Time${item.Start}${item.End}`}>
                      <td className="flex flex-col min-[1440px]:flex-row grow items-center justify-center py-[10px] rounded bg-gray-100 select-none">
                        <p className="flex text-xs w-full items-center justify-center text-gray-600">
                          {item.Start}
                        </p>
                        <p className="flex text-xs items-center justify-center text-gray-600">
                          -
                        </p>
                        <p className="flex text-xs w-full items-center justify-center text-gray-600">
                          {item.End}
                        </p>
                      </td>
                    </Fragment>
                  ))}
                </tr>
                {timeSlotData.DayOfWeek.map((day) => (
                  <Fragment key={`Day-${day.Day}`}>
                    <tr className="flex gap-4">
                      <td
                        className={`flex items-center justify-center p-[10px] h-[76px] rounded select-none`}
                        style={{ backgroundColor: day.BgColor }}
                      >
                        <span
                          className={`flex w-[50px] h-[24px] justify-center`}
                        >
                          <p style={{ color: day.TextColor }}>{day.Day}</p>
                        </span>
                      </td>
                      {timeSlotData.AllData.filter(
                        (item) => dayOfWeekThai[item.DayOfWeek] == day.Day,
                      ).map((item, index) => (
                        <Fragment key={`DROPZONE${item.TimeslotID}`}>
                          <StrictModeDroppable
                            //จะลากลงไม่ได้ก็ต่อเมื่อเป็นคาบพักและเป็นวิชาที่มีอยู่ใน slot แล้ว (ไม่รวมสลับวิชาระหว่างช่อง)
                            isDropDisabled={
                              //ถ้ามีพักเที่ยงก็ปิดช่องเลย
                              checkBreakTime(item.Breaktime) ||
                              //ถ้าเป็นวิชาล็อก GradeID จะเป็น array
                              (typeof item.subject.GradeID !== "string" &&
                                Object.keys(item.subject).length !== 0) ||
                              //ถ้าลากเพิ่มวิชา ต้องลากลงได้แค่ช่องว่างเท่านั้น
                              (isSelectedToAdd() &&
                                Object.keys(item.subject).length !== 0) ||
                              //ถ้าลากในออกนอก ให้เช็คว่าคาบ NOT_BREAK ที่มีวิชา related กับ yearSelected ไหม
                              (item.Breaktime == "NOT_BREAK" &&
                              Object.keys(item.subject).length !== 0
                                ? checkRelatedYearDuringDragging(
                                    item.subject.gradelevel.Year,
                                  )
                                : false)
                            }
                            droppableId={`${item.TimeslotID}`}
                          >
                            {(provided, snapshot) => (
                              <td
                                style={{
                                  backgroundColor: snapshot.isDraggingOver
                                    ? "white"
                                    : null,
                                  width : `${1062 / timeSlotData.SlotAmount.length - 10}px`
                                }}
                                className={timeSlotCssClassName(
                                  item.Breaktime,
                                  item.subject,
                                )}
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                // onClick={() => console.log(item)}
                              >
                                {Object.keys(item.subject).length === 0 ? ( //ถ้าไม่มีวิชาใน timeslot
                                  //ถ้ายังไม่กดเลือกวิชาจะซ่อนปุ่ม + เอาไว้
                                  <>
                                    <div
                                      style={{
                                        display:
                                          checkBreakTime(item.Breaktime) &&
                                          (isSelectedToAdd() || isSelectedToChange())
                                            ? "flex"
                                            : "none",
                                      }}
                                      className="flex-col"
                                    >
                                      <b className="text-sm">พัก</b>
                                      <p className="text-sm">
                                        {item.Breaktime == "BREAK_JUNIOR"
                                          ? "มัธยมต้น"
                                          : "มัธยมปลาย"}
                                      </p>
                                    </div>
                                    <AddCircleIcon
                                      style={{
                                        color: "#10b981",
                                        display:
                                          Object.keys(storeSelectedSubject)
                                            .length == 0 ||
                                          checkBreakTime(item.Breaktime) ||
                                          snapshot.isDraggingOver
                                            ? "none"
                                            : "flex",
                                      }}
                                      className={`cursor-pointer hover:fill-emerald-600 duration-300 animate-pulse`}
                                      onClick={() =>
                                        addRoomModal(item.TimeslotID)
                                      } //เพิ่ม timeslotID ที่เลือกไว้ลงไป
                                    />
                                    <ChangeCircleIcon
                                      style={{
                                        color: "#345eeb",
                                        display:
                                          Object.keys(changeTimeSlotSubject)
                                            .length == 0 ||
                                          checkBreakTime(item.Breaktime)
                                            ? "none"
                                            : "flex",
                                      }}
                                      className={`cursor-pointer hover:fill-blue-600 duration-300 animate-pulse rotate-90`}
                                      onClick={() =>
                                        clickOrDragToChangeTimeSlot(
                                          item.subject,
                                          item.TimeslotID,
                                          true,
                                        )
                                      }
                                    />
                                  </>
                                ) : (
                                  //ถ้ามีวิชาอยู่ใน timeslot
                                  <>
                                    <Draggable
                                      isDragDisabled={
                                        (isCilckToChangeSubject &&
                                          item.TimeslotID !==
                                            timeslotIDtoChange.source) ||
                                        typeof item.subject.GradeID !==
                                          "string" ||
                                        item.subject.Scheduled
                                      } //true ถ้าเราสลับวิชาด้วยการกด จะไปลากอันอื่นไม่ได้นอกจากลากอันที่เคยกดเลือกไว้
                                      draggableId={`Slot-${item.TimeslotID}-Index-${index}`}
                                      key={`Slot-${item.TimeslotID}-Index-${index}`}
                                      index={index}
                                    >
                                      {(provided, snapshot) => {
                                        if (snapshot.isDropAnimating) {
                                          //เช็คว่ามีการปล่อยเมาส์มั้ย
                                          dropOutOfZone(item.subject); //ถ้ามีก็เรียกใช้ฟังก์ชั่นพร้อมส่งวิชาที่เลือกลงไป
                                        }
                                        return (
                                          <>
                                            <div
                                              // style={{
                                              //   display:
                                              //     Object.keys(item.subject)
                                              //       .length == 0
                                              //       ? "none"
                                              //       : "flex",
                                              // }}
                                              className={`text-center select-none flex flex-col ${
                                                snapshot.isDragging
                                                  ? "w-fit h-fit bg-white rounded"
                                                  : ""
                                              }`}
                                              {...provided.dragHandleProps}
                                              {...provided.draggableProps}
                                              ref={provided.innerRef}
                                            >
                                              <b className="text-sm">
                                                {item.subject.SubjectCode}
                                              </b>
                                              <b className="text-xs">
                                                {item.subject.SubjectName.substring(
                                                  0,
                                                  8,
                                                )}
                                                ...
                                              </b>
                                              <b className="text-xs">
                                                {typeof item.subject.GradeID !==
                                                "string"
                                                  ? null
                                                  : `ม.${
                                                      item.subject.GradeID[0]
                                                    }/${
                                                      parseInt(
                                                        item.subject.GradeID.substring(
                                                          1,
                                                          2,
                                                        ),
                                                      ) < 10
                                                        ? item.subject
                                                            .GradeID[2]
                                                        : item.subject.GradeID.substring(
                                                            1,
                                                            2,
                                                          )
                                                    }`}
                                              </b>
                                              <p className="text-xs">
                                                ห้อง {item.subject.RoomName}
                                              </p>
                                            </div>
                                            <ChangeCircleIcon
                                              onClick={() => {
                                                clickOrDragToChangeTimeSlot(
                                                  item.subject,
                                                  item.TimeslotID,
                                                  true,
                                                )
                                              }}
                                              style={{
                                                color:
                                                  item.TimeslotID ==
                                                  timeslotIDtoChange.source
                                                    ? "#fcba03"
                                                    : "#2563eb",
                                                display:
                                                  Object.keys(
                                                    storeSelectedSubject,
                                                  ).length !== 0 ||
                                                  typeof item.subject
                                                    .GradeID !== "string"
                                                    ? "none"
                                                    : item.subject.Scheduled
                                                      ? "none"
                                                      : displayErrorChangeSubject(
                                                            item.Breaktime,
                                                            item.subject
                                                              .gradelevel.Year,
                                                          )
                                                        ? "none"
                                                        : "flex",
                                              }}
                                              className={`cursor-pointer ${
                                                item.TimeslotID ==
                                                timeslotIDtoChange.source
                                                  ? "hover:fill-amber-500 animate-pulse"
                                                  : "hover:fill-blue-700"
                                              } bg-white rounded-full duration-300 absolute left-[-11px] top-[-10px] rotate-90`}
                                            />
                                            <ErrorIcon
                                              onMouseEnter={() =>
                                                setShowErrorMsgByTimeslotID(
                                                  item.TimeslotID,
                                                )
                                              }
                                              onMouseLeave={() =>
                                                setShowErrorMsgByTimeslotID("")
                                              }
                                              style={{
                                                color: "#ef4444",
                                                display:
                                                  Object.keys(
                                                    storeSelectedSubject,
                                                  ).length !== 0 ||
                                                  typeof item.subject
                                                    .GradeID !== "string"
                                                    ? "none"
                                                    : item.subject.Scheduled
                                                      ? "none"
                                                      : displayErrorChangeSubject(
                                                            item.Breaktime,
                                                            item.subject
                                                              .gradelevel.Year,
                                                          )
                                                        ? "flex"
                                                        : "none",
                                              }}
                                              className="cursor-pointer hover:fill-red-600 bg-white rounded-full duration-300 absolute left-[-11px] top-[-10px]"
                                            />
                                            <div
                                              onMouseEnter={() =>
                                                setShowErrorMsgByTimeslotID(
                                                  item.TimeslotID,
                                                )
                                              }
                                              onMouseLeave={() =>
                                                setShowErrorMsgByTimeslotID("")
                                              }
                                              style={{
                                                display:
                                                  item.TimeslotID ==
                                                  showErrorMsgByTimeslotID
                                                    ? "flex"
                                                    : "none",
                                              }}
                                              className="absolute top-[-50px] left-2 p-1 w-[150px] h-fit z-50 rounded border bg-white"
                                            >
                                              <p className="text-[12px]">
                                                ไม่สามารถจัดวิชาที่เลือกลงในเวลาพักเที่ยง
                                              </p>
                                            </div>
                                            <RemoveCircleIcon
                                              onClick={() =>
                                                removeSubjectFromSlot(
                                                  item.subject,
                                                  item.TimeslotID,
                                                )
                                              }
                                              style={{
                                                color: "#ef4444",
                                                display:
                                                  typeof item.subject
                                                    .GradeID !== "string"
                                                    ? "none"
                                                    : Object.keys(
                                                          changeTimeSlotSubject,
                                                        ).length !== 0
                                                      ? "none"
                                                      : item.subject.Scheduled
                                                        ? "none"
                                                        : "flex",
                                              }}
                                              className="cursor-pointer hover:fill-red-600 bg-white rounded-full duration-300 absolute right-[-11px] top-[-10px]"
                                            />
                                            <HttpsIcon
                                              onMouseEnter={() =>
                                                setShowLockDataMsgByTimeslotID(
                                                  item.TimeslotID,
                                                )
                                              }
                                              onMouseLeave={() =>
                                                setShowLockDataMsgByTimeslotID(
                                                  "",
                                                )
                                              }
                                              style={{
                                                color: "#3d3d3d",
                                                display:
                                                  typeof item.subject
                                                    .GradeID !== "string"
                                                    ? "flex"
                                                    : "none",
                                              }}
                                              className="rounded-full duration-300 absolute left-[-11px] top-[-10px]"
                                            />
                                            <div
                                              onMouseEnter={() =>
                                                setShowLockDataMsgByTimeslotID(
                                                  item.TimeslotID,
                                                )
                                              }
                                              onMouseLeave={() =>
                                                setShowLockDataMsgByTimeslotID(
                                                  "",
                                                )
                                              }
                                              style={{
                                                display:
                                                  item.TimeslotID ==
                                                  showLockDataMsgByTimeslotID
                                                    ? "flex"
                                                    : "none",
                                              }}
                                              className="absolute top-[-68px] text-left left-2 p-1 w-[150px] h-fit z-50 rounded border bg-white"
                                            >
                                              <p className="text-[12px]">
                                                คาบนี้ถูกล็อก
                                                สามารถจัดการคาบล็อกได้ที่แท็บ{" "}
                                                <b>ล็อกคาบสอน</b>
                                              </p>
                                            </div>
                                          </>
                                        );
                                      }}
                                    </Draggable>
                                  </>
                                )}
                                {provided.placeholder}
                              </td>
                            )}
                          </StrictModeDroppable>
                        </Fragment>
                      ))}
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </DragDropContext>
        </>
      )}
    </>
  );
}

export default TimeSlot;
