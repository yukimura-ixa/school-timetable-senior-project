"use client";
import api, { fetcher } from "@/libs/axios";
import { subjectCreditValues } from "@/models/credit-value";
import { dayOfWeekTextColor } from "@/models/dayofWeek-textColor";
import { dayOfWeekColor } from "@/models/dayofweek-color";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import { teacher } from "@prisma/client";
import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import useSWR from "swr";
import TimeSlot from "../component/TimeSlot";
import PageHeader from "../component/PageHeader";
import SaveIcon from "@mui/icons-material/Save";
import { DragDropContext } from "react-beautiful-dnd";
import SubjectDragBox from "../component/SubjectDragBox";
import { enqueueSnackbar, closeSnackbar } from "notistack";
import PrimaryButton from "@/components/elements/static/PrimaryButton";
import SelectSubjectToTimeslotModal from "../component/SelectSubjectToTimeslotModal";
import Loading from "@/app/loading";

const TeacherArrange = () => {
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
  const [currentTeacherID, setCurrentTeacherID] = useState(searchTeacherID)
  const checkConflictData = useSWR(
    () =>
      "/class/checkConflict?AcademicYear=" +
      academicYear +
      "&Semester=SEMESTER_" +
      semester +
      "&TeacherID=" +
      currentTeacherID,
    fetcher,
    { revalidateOnFocus: false },
  );

  const fetchAllClassData = useSWR(
    () =>
      `/class?AcademicYear=${academicYear}&Semester=SEMESTER_${semester}&TeacherID=${currentTeacherID}`,
    fetcher,
    { revalidateOnFocus: false },
  );

  const fetchTeacher = useSWR(
    //ข้อมูลหลักที่ fetch มาจาก api
    () => `/teacher?TeacherID=` + currentTeacherID,
    fetcher,
    { revalidateOnFocus: false },
  );
  const fetchResp = useSWR(
    //ข้อมูลหลักที่ fetch มาจาก api
    () =>
      `/assign/getAvailableResp?AcademicYear=` +
      academicYear +
      `&Semester=SEMESTER_` +
      semester +
      `&TeacherID=` +
      currentTeacherID,
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
      setTimeSlotData(() => ({
        AllData: data.map((data) => ({ ...data, subject: {} })),
        SlotAmount: slotAmount,
        DayOfWeek: dayofweek,
        BreakSlot: breakTime,
      }));
    }
  }
  const [scheduledSubjects, setScheduledSubjects] = useState([]); //วิชาที่อยู่ในตารางอยู่แล้ว

  function fetchSubjectBox() {
    const data = fetchResp.data; //get data
    setSubjectData(data);
  }

  useEffect(() => {
    if (fetchResp.data) {
      fetchSubjectBox();
    }
  }, [fetchResp.isValidating]);

  useEffect(() => {
    if (!fetchTeacher.isValidating) {
      setTeacherData(() => fetchTeacher.data);
    }
    if (!fetchTimeSlot.isValidating) {
      fetchTimeslotData();
      console.log(fetchTimeSlot.data);
    }
  }, [fetchTeacher.isValidating, fetchTimeSlot.isValidating]);

  useEffect(() => {
    if (!fetchAllClassData.isValidating) {
      fetchClassData();
    }
  }, [fetchAllClassData.isValidating]);

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

  async function postData() {
    let data = {
      TeacherID: parseInt(searchTeacherID),
      AcademicYear: parseInt(academicYear),
      Semester: "SEMESTER_" + semester,
      Schedule: timeSlotData.AllData,
    };

    setIsSaving(true);
    const savingSnackbar = enqueueSnackbar("กำลังบันทึกข้อมูล...", {
      variant: "info",
      persist: true,
    });

    // console.log(data);

    try {
      const response = await api.post("/arrange", data);
      if (response.status == 200) {
        console.log(response);
        closeSnackbar(savingSnackbar);
        enqueueSnackbar("บันทึกข้อมูลสำเร็จ", { variant: "success" });
        fetchAllClassData.mutate();
        setIsSaving(false);
      }
    } catch (error) {
      console.log(error);
      closeSnackbar(savingSnackbar);
      enqueueSnackbar("เกิดข้อผิดพลาดในการบันทึกข้อมูล", { variant: "error" });
      setIsSaving(false);
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
  const clearScheduledData = () => {
    setTimeSlotData({
      ...timeSlotData,
      AllData: timeSlotData.AllData.map((item) =>
        item.subject.Scheduled ? { ...item, subject: {} } : item,
      ),
    });
  };
  function onSelectSubject() {
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
    clearScheduledData();
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
      {isActiveModal && (
        <SelectSubjectToTimeslotModal
          addSubjectToSlot={addSubjectToSlot} //ส่ง function
          cancelAddRoom={cancelAddRoom} //ส่ง function
          payload={subjectPayload} //ส่งชุดข้อมูล
        />
      )}
      {fetchTeacher.isValidating ||
      fetchResp.isValidating ||
      fetchTimeSlot.isValidating ||
      fetchAllClassData.isValidating ? (
        <Loading />
      ) : (
        <>
          <PageHeader teacherData={teacherData} />
          <DragDropContext
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
          >
            <SubjectDragBox
              respData={subjectData}
              dropOutOfZone={dropOutOfZone}
              clickOrDragToSelectSubject={clickOrDragToSelectSubject}
              storeSelectedSubject={storeSelectedSubject}
              teacher={teacherData}
            />
            <div className="w-full flex justify-end items-center mt-3 gap-3">
              <PrimaryButton
                handleClick={postData}
                title={"บันทึกข้อมูล"}
                color={"success"}
                Icon={<SaveIcon />}
                reverseIcon={false}
                isDisabled={isSaving}
              />
            </div>
            <TimeSlot
              timeSlotData={timeSlotData}
              checkBreakTime={checkBreakTime}
              isSelectedToAdd={isSelectedToAdd}
              isSelectedToChange={isSelectedToChange}
              checkRelatedYearDuringDragging={checkRelatedYearDuringDragging}
              timeSlotCssClassName={timeSlotCssClassName}
              storeSelectedSubject={storeSelectedSubject}
              addRoomModal={addRoomModal}
              changeTimeSlotSubject={changeTimeSlotSubject}
              clickOrDragToChangeTimeSlot={clickOrDragToChangeTimeSlot}
              isCilckToChangeSubject={isCilckToChangeSubject}
              timeslotIDtoChange={timeslotIDtoChange}
              dropOutOfZone={dropOutOfZone}
              displayErrorChangeSubject={displayErrorChangeSubject}
              showErrorMsgByTimeslotID={showErrorMsgByTimeslotID}
              removeSubjectFromSlot={removeSubjectFromSlot}
              showLockDataMsgByTimeslotID={showLockDataMsgByTimeslotID}
              setShowErrorMsgByTimeslotID={setShowErrorMsgByTimeslotID}
              setShowLockDataMsgByTimeslotID={setShowLockDataMsgByTimeslotID}
            />
          </DragDropContext>
        </>
      )}
    </>
  );
};

export default TeacherArrange;
