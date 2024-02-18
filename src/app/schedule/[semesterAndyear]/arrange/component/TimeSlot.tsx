"use client";
import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import SelectSubjectToTimeslotModal from "./SelectSubjectToTimeslotModal";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { StrictModeDroppable } from "@/components/elements/dnd/StrictModeDroppable";
import { fetcher } from "@/libs/axios";
import { useParams, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import Loading from "@/app/loading";
import { subjectCreditValues } from "@/models/credit-value";
import { useClassData } from "@/app/_hooks/classData";
import { teacher } from "@prisma/client";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { dayOfWeekColor } from "@/models/dayofweek-color";
import { dayOfWeekTextColor } from "@/models/dayofWeek-textColor";
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
type Props = {};
// TODO: เพิ่ม Tab มุมมองแต่ละชั้นเรียน ไว้ทีหลังเลย
// TODO: ลากสลับวิชาระหว่างช่อง
// TODO: ลากหรือคลิกวิชาจากด้านบนมาทับช่องตารางแล้วจะสลับกัน (ไว้ค่อยว่ากัน)
// TODO: ทำปุ่มบันทึกข้อมูล
// TODO: ทำกรอบสีพักเที่ยง ม.ต้น/ปลาย + สัญลักษณ์
// TODO: ดึงวิชาที่ลงให้ครูแต่ละคนแล้วมาจาก database เพื่อนำมาแสดงบนช่องตาราง
// TODO: เช็ควิชาที่ map กับหน่วยกิตให้สัมพันธ์กับวิชาที่อยู่ในตารางหลังจากทำ TODO ด้านบน
// TODO: ใช้ useMemo หรืออะไรก็ได้มา Cache ข้อมูลไว้ที
function TimeSlot(props: Props) {
  const params = useParams();
  const [semester, academicYear] = (params.semesterAndyear as string).split(
    "-"
  ); //from "1-2566" to ["1", "2566"]
  const searchTeacherID = useSearchParams().get("TeacherID");
  const searchGradeID = useSearchParams().get("GradeID");
  const classData = useClassData(
    parseInt(academicYear),
    parseInt(semester),
    parseInt(searchTeacherID)
  );
  const fetchTeacher = useSWR(
    //ข้อมูลหลักที่ fetch มาจาก api
    () => `/teacher?TeacherID=` + searchTeacherID,
    fetcher
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
    fetcher
  );
  // /timeslot?AcademicYear=2566&Semester=SEMESTER_2
  const fetchTimeSlot = useSWR(
    () =>
      `/timeslot?AcademicYear=` +
      academicYear +
      `&Semester=SEMESTER_` +
      semester,
    fetcher
  );
  const [isActiveModal, setIsActiveModal] = useState(false);
  const [subjectData, setSubjectData] = useState([]);
  const [teacherData, setTeacherData] = useState<teacher>({
    Firstname: "",
    Lastname: "",
    Department: "",
    Prefix: "",
    TeacherID: null,
  });
  const [timeSlotData, setTimeSlotData] = useState({
    AllData: [],
    SlotAmount: [],
    StartTime: { Hours: 8, Minutes: 30 },
    Duration: 50,
    DayOfWeek: [],
    BreakSlot: [],
  });
  useEffect(() => {
    if (!fetchTeacher.isLoading) {
      setTeacherData(() => fetchTeacher.data);
    }
  }, [fetchTeacher.isLoading]);
  //for subject
  useEffect(() => {
    if (!fetchAllSubject.isLoading) {
      const data = fetchAllSubject.data; //get data
      const mapSubjectByCredit = []; //สร้าง array เปล่ามาเก็บ
      for (let i = 0; i < data.length; i++) {
        //for loop ตามข้อมูลที่มี
        for (let j = 0; j < subjectCreditValues[data[i].Credit] * 2; j++) {
          //map ตามหน่วยกิต * 2 จะได้จำนวนคาบที่ต้องลงช่องตารางจริงๆในหนึงวิชา
          mapSubjectByCredit.push(data[i]);
        }
      }
      setSubjectData(() => mapSubjectByCredit.map((item, index) => ({itemID : index+1 ,...item})));
      console.log(mapSubjectByCredit);
    }
  }, [fetchAllSubject.isLoading]);
  //for all data
  useEffect(() => {
    if (!fetchTimeSlot.isLoading) {
      let data = fetchTimeSlot.data;
      let dayofweek = data
        .map((day) => day.DayOfWeek)
        .filter(
          (item, index) =>
            data.map((day) => day.DayOfWeek).indexOf(item) === index
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
            item.DayOfWeek == "MON" //filter ข้อมูลตัวอย่างเป้นวันจันทร์ เพราะข้อมูลเหมือนกันหมด
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
          new Date(data[0].StartTime).getTime()
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
  }, [fetchTimeSlot.isLoading]);
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
  const addSubjectToSlot = (subject: object, timeSlotID: string) => {
    let data = timeSlotData.AllData; //นำช้อมูลตารางมา
    setTimeSlotData(() => ({
      ...timeSlotData,
      AllData: data.map((item) =>
        item.TimeslotID == timeSlotID ? { ...item, subject: subject } : item
      ),
    })); //map วิชาลงไปใน slot
    setSubjectData(() => subjectData.filter(item => item.itemID != subject.itemID)); //เอาวิชาที่ถูกจัดลงออกไป
    setStoreSelectedSubject({}); //หลังจากเพิ่มวิชาแล้วก็ต้องรีการ select วิชา
    setIsActiveModal(false);
  };
  const cancelAddRoom = (subject: object, timeSlotID: string) => { //ถ้ามีการกดยกเลิกหรือปิด modal
    removeSubjectFromSlot(subject, timeSlotID) //ลบวิชาออกจาก timeslot ที่ได้ไป hold ไว้ตอนแรก
    setStoreSelectedSubject({});
    setIsActiveModal(false);
  }
  const removeSubjectFromSlot = (subject: object, timeSlotID: string) => { //ถ้ามีการกดลบวิชาออกจาก timeslot
    let data = timeSlotData.AllData; //ดึงข้อมูล timeslot มา
    returnSubject(subject); // คืนวิชาลงกล่องพักวิชา
    setTimeSlotData(() => ({
      ...timeSlotData,
      AllData: data.map((item) =>
        item.TimeslotID == timeSlotID ? { ...item, subject: {} } : item
      ),
    }));
  };
  const returnSubject = (subject: object) => {
    delete subject.RoomID; //ลบ property RoomID ออกจาก object ก่อนคืน 
    setSubjectData(() => [...subjectData, subject]);
  };
  const [yearSelected, setYearSelected] = useState(null); //เก็บค่าของระดับชั้นที่ต้องสอนในวิชานั้นๆเพื่อใช้เช็คกับคาบพักเที่ยง
  const [storeSelectedSubject, setStoreSelectedSubject] = useState({}); //เก็บวิชาที่เรากดเลือก
  const [subjectPayload, setSubjectPayload] = useState({
    timeslotID : "",
    selectedSubject : {},
  })
  const handleDragStart = (result) => {
    const {source} = result; 
    let index = source.index
    if(source.droppableId == "SUBJECTS"){ //ถ้ามีการลากวิชาออกมา จะ set ว่า isDragging = true เพื่อบอกว่า เรากำลังลากอยู่นะ
      if(Object.keys(storeSelectedSubject).length == 0){
        clickOrDragToSelectSubject(subjectData[index]); 
      }
    }
    console.log(result);
  }
  const handleDragEnd = (result) => {
    const { source, destination, type } = result;
    if (!destination) return;
    if (source.droppableId !== destination.droppableId) {
      //ถ้ามีการ Drag and Drop เกิดขึ้น
      addRoomModal(destination.droppableId) //destination.droppableId = timeslotID
    }
    clickOrDragToSelectSubject(subjectData[source.index])
    console.log(result);
  };
  const dropOutOfZone = (subject: object) => { //function เช็คว่าถ้ามีการ Drop item นอกพื้นที่ Droppable จะให้นับเวลาถอยหลัง 0.5 วิเพื่อยกเลิกการเลือกวิชาที่ลาก
    setTimeout(() => {
      clickOrDragToSelectSubject(subject);
    }, 500)
  }
  const clickOrDragToSelectSubject = (subject : object) => {
    let itemToAdd = subject === storeSelectedSubject ? {} : subject //ถ้าวิชาที่ส่งผ่าน params เข้ามาเป็นตัวเดิมจะให้มัน unselected วิชา
    let year = subject.gradelevel.Year; //เอาปีมา
    setYearSelected(subject === storeSelectedSubject ? null : year) //set ชั้นปีที่เรากดเลือกไว้
    setStoreSelectedSubject(itemToAdd); //ละก็นำวิชาไป hold
    setChangeTimeSlotSubject({}); //set ให้เป็น object เปล่าเนื่องจากถ้ากดเปลี่ยนแล้วไปกดเพิ่มวิชามันจะได้ไม่แสดงปุ่มซ้อนกัน
    setTimeslotIDtoChange(() => ({source : "", destination : ""}));
  }
  const addRoomModal = (timeslotID: string) => { //เพิ่มห้องเรียนลงในวิชาผ่านโมดอล
    if(Object.keys(storeSelectedSubject).length == 0) return; //ดักไว้เฉยๆว่าถ้าไม่ได้เลือกวิชาจะไม่สามารถทำไรได้
    else {
      setSubjectPayload(() => ({
        timeslotID : timeslotID,
        selectedSubject : storeSelectedSubject,
      })) //set ข้อมูลก่อนส่งไปให้ modal
      addSubjectToSlot(storeSelectedSubject, timeslotID); //เพิ่มวิชาลงไปใน slot ก่อน ทำเนียนๆไป
      setIsActiveModal(true);
    }
  }
  const [changeTimeSlotSubject, setChangeTimeSlotSubject] = useState({}); //สำหรับเก็บวิชาที่ต้องการเปลี่ยนในการเลือกวิชาครั้งแรก
  const [destinationSubject, setDestinationSubject] = useState({}); //วิชาปลายทางที่จะเปลี่ยน
  const [timeslotIDtoChange, setTimeslotIDtoChange] = useState({source : "", destination : ""}); //เก็บ timeslotID ต้นทางและปลายทางเพื่อใช้สลับวิชา
  const clickOrDragToChangeTimeSlot = (subject: object, timeslotID: string) => {
    let checkDulpicateSubject = subject === changeTimeSlotSubject; //เช็คว่ามีการกดวิชาที่เลือกอยู่แล้วหรือไม่
    if(Object.keys(changeTimeSlotSubject).length == 0 || checkDulpicateSubject){ //ถ้ายังไม่มีการกดเพิ่มวิชาหรือมีวิชาที่กดซ้ำแล้ว ให้ set วิชาตามเงื่อนไขของ toggleChange
      let year = subject.gradelevel.Year;
      setChangeTimeSlotSubject(() => checkDulpicateSubject ? {} : subject);
      setTimeslotIDtoChange(() => checkDulpicateSubject ? ({source : "", destination : ""}) : ({...timeslotIDtoChange, source : timeslotID}));
      setYearSelected(checkDulpicateSubject ? null : year);
    }
    else if(timeslotIDtoChange.source !== ""){
      setTimeslotIDtoChange(() => ({...timeslotIDtoChange, destination : timeslotID}));
      setDestinationSubject(() => subject);
    }
    setStoreSelectedSubject({}); //set ให้เป็น object เปล่าเนื่องจากถ้ากดเปลี่ยนแล้วไปกดเพิ่มวิชามันจะได้ไม่แสดงปุ่มซ้อนกัน
  }
  const changeSubjectSlot = () => {
    let sourceSubj = changeTimeSlotSubject; //เก็บวิชาต้นทาง
    let destinationSubj = destinationSubject; //เก็บวิชาปลายทาง
    let sourceTimeslotID = timeslotIDtoChange.source;
    let destinationTimeslotID = timeslotIDtoChange.destination;
    console.log(timeslotIDtoChange);
    setTimeSlotData(() => ({
      ...timeSlotData,
      AllData: timeSlotData.AllData.map((item) =>
        item.TimeslotID == sourceTimeslotID ? { ...item, subject: destinationSubj } : item.TimeslotID == destinationTimeslotID ? { ...item, subject: sourceSubj } : item
      ),
    })); //map วิชาลงไปใน slot
  }
  useEffect(() => {
    if(timeslotIDtoChange.destination !== ""){
      changeSubjectSlot();
      setTimeslotIDtoChange(() => ({source : "", destination : ""}));
      setChangeTimeSlotSubject({}), setDestinationSubject({});
    }
  }, [timeslotIDtoChange.destination])
  const checkBreakTime = (breakTimeState: string):boolean => { //เช็คคาบพักแบบมอต้นและปลาย
    let result:boolean = (Object.keys(storeSelectedSubject).length !== 0 || Object.keys(changeTimeSlotSubject).length !== 0) && //ถ้ามีการกดเลือกวิชาหรือกดเปลี่ยนวิชา
    (breakTimeState == "BREAK_JUNIOR" && [1, 2, 3].includes(yearSelected)) 
    || (breakTimeState == "BREAK_SENIOR" && [4, 5, 6].includes(yearSelected)) //เช็คว่าถ้าคาบนั้นเป็นคาบพักของมอต้น จะนำวิชาที่คลิกเลือกมาเช็คว่า Year มันอยู่ใน [1, 2, 3] หรือไม่
    // && Object.keys(subjectInSlot).length === 0 //เงื่อนไขสุดท้ายคือ ถ้า slot นั้นๆไม่มีวิชาก็แสดงว่าพักเที่ยง ถ้าไม่ ก็แสดงวิชาที่ลงเอาไว้
    return breakTimeState == "BREAK_BOTH" ? true : result;
  }
  const timeSlotCssClassName = (breakTimeState: string, subjectInSlot: object) => { //เช็คคาบพักรวม
    let condition:boolean = (Object.keys(storeSelectedSubject).length <= 1 && Object.keys(changeTimeSlotSubject).length == 0) //ถ้าไม่มีการกดเลือกหรือเปลี่ยนวิชาเลย
    && (breakTimeState == "BREAK_BOTH" || breakTimeState == "BREAK_JUNIOR" || breakTimeState == "BREAK_SENIOR") && Object.keys(subjectInSlot).length == 0; //เช็คว่ามีคาบพักมั้ย
    let disabledSlot = `grid w-[100%] flex justify-center h-[76px] text-center items-center rounded border relative border-[#ABBAC1] bg-gray-100 duration-200` //slot ปิดตาย (คาบพัก)
    let enabledSlot = `grid w-[100%] items-center justify-center h-[76px] rounded border-2 relative border-[#ABBAC1] bg-white
                      ${
                        (Object.keys(storeSelectedSubject).length !== 0 && Object.keys(subjectInSlot).length == 0) //ถ้ามีการเกิด action กำลังลากวิชาหรือมีการกดเลือกวิชา จะแสดงสีเขียวพร้อมกระพริบๆช่องที่พร้อมลง
                          ? "border-emerald-300 cursor-pointer"
                          : Object.keys(changeTimeSlotSubject).length !== 0 //ถ้ากดเปลี่ยนวิชา จะให้กรอบสีฟ้า
                          ? "border-blue-300" 
                          : Object.keys(subjectInSlot).length !== 0 //ถ้ามีวิชาที่ลงแล้ว จะให้กรอบเป็นสีแดง
                          ? "border-red-300"
                          : "border-dashed" //ถ้าไม่มีวิชาอยู่ในช่อง จะให้แสดงเป็นเส้นกรอบขีดๆเอาไว้
                      } 
                      duration-200` //slot ที่เป็นช่องว่าง
    return condition ? disabledSlot : checkBreakTime(breakTimeState) && Object.keys(subjectInSlot).length == 0 ? disabledSlot : enabledSlot; //ถ้าเงื่อนไขคาบพักเป็นจริง จะปิด slot ไว้
  }
  return (
    <>
      {isActiveModal ? (
        <SelectSubjectToTimeslotModal
          addSubjectToSlot={addSubjectToSlot}
          cancelAddRoom={cancelAddRoom}
          payload={subjectPayload}
        />
      ) : null}
      {fetchTimeSlot.isLoading ? (
        <Loading />
      ) : (
        <>
          <div className="p-4 mt-4 flex gap-3">
            <p className="text-sm">ตารางสอนของ</p>
            <p className="text-sm font-bold">
              คุณครู {teacherData.Firstname} {teacherData.Lastname}
            </p>
          </div>
          <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
            <div className="flex flex-col w-full border border-[rgb(237,238,243)] p-4 gap-4 mt-4">
              <p
                className="text-sm"
                onClick={() => {
                  console.log(yearSelected)
                  console.log(changeTimeSlotSubject)
                  console.log(destinationSubject)
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
                      className="grid w-full h-[125px] text-center grid-cols-8 overflow-y-scroll"
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
                              if(snapshot.isDropAnimating){ //เช็คว่ามีการปล่อยเมาส์มั้ย
                                dropOutOfZone(item); //ถ้ามีก็เรียกใช้ฟังก์ชั่นพร้อมส่งวิชาที่เลือกลงไป
                              }
                              return(
                              <>
                                <div
                                  className={`w-[85%] h-fit flex flex-col my-1 py-1 border rounded cursor-pointer ${
                                    storeSelectedSubject == item //ถ้าคลิกหรือลากวิชา จะแสดงเขียวๆกะพริบๆ
                                      ? "bg-green-200 hover:bg-green-300 border-green-500 animate-pulse"
                                      : "bg-white hover:bg-slate-50"
                                  } duration-100 select-none`}
                                  {...provided.dragHandleProps}
                                  {...provided.draggableProps}
                                  ref={provided.innerRef}
                                  onClick={() => clickOrDragToSelectSubject(item)}
                                >
                                  <b className="text-sm">{item.SubjectCode}</b>
                                  <p className="text-sm">
                                    {item.SubjectName.substring(0, 8)}...
                                  </p>
                                  <b className="text-xs">
                                    ม.{item.GradeID[0]}/
                                      {parseInt(item.GradeID.substring(1, 2)) < 10
                                      ? item.GradeID[2]
                                      : item.GradeID.substring(1, 2)}
                                  </b>
                                  <p className="text-xs">
                                    {teacherData.Firstname}
                                  </p>
                                </div>
                              </>
                              )
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
                  <td className="flex items-center bg-gray-100 justify-center p-[10px] h-[40px] rounded">
                    <span className="flex w-[50px] h-[24px] justify-center">
                      <p className="text-gray-600">เวลา</p>
                    </span>
                  </td>
                  {/* Map duration ของคาบเรียน */}
                  {mapTime().map((item) => (
                    <Fragment key={`woohoo${item.Start}${item.End}`}>
                      <td className="flex grow items-center justify-center py-[10px] h-[40px] rounded bg-gray-100 select-none">
                        <p className="flex text-xs w-full items-center justify-center h-[24px] text-gray-600">
                          {item.Start}-{item.End}
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
                        (item) => dayOfWeekThai[item.DayOfWeek] == day.Day
                      ).map((item, index) => (
                        <Fragment key={`DROPZONE${item.TimeslotID}`}>
                            <StrictModeDroppable
                              isDropDisabled={checkBreakTime(item.Breaktime) || Object.keys(item.subject).length !== 0}
                              droppableId={`${item.TimeslotID}`}
                            >
                              {(provided, snapshot) => (
                                <td
                                  style={{
                                    backgroundColor: snapshot.isDraggingOver
                                      ? "white"
                                      : null,
                                  }}
                                  className={timeSlotCssClassName(item.Breaktime, item.subject)}
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                >
                                  {Object.keys(item.subject).length === 0 ? ( //ถ้าไม่มีวิชาใน timeslot
                                    //ถ้ายังไม่กดเลือกวิชาจะซ่อนปุ่ม + เอาไว้
                                    <>
                                    <AddCircleIcon
                                      style={{ color: "#10b981", display : Object.keys(storeSelectedSubject).length == 0 || checkBreakTime(item.Breaktime) || snapshot.isDraggingOver ? "none" : "flex" }}
                                      className={`cursor-pointer hover:fill-emerald-600 duration-300 animate-pulse`}
                                      onClick={() => addRoomModal(item.TimeslotID)} //เพิ่ม timeslotID ที่เลือกไว้ลงไป
                                    />
                                    <ChangeCircleIcon
                                      style={{ color: "#345eeb", display : Object.keys(changeTimeSlotSubject).length == 0 || checkBreakTime(item.Breaktime) ? "none" : "flex" }}
                                      className={`cursor-pointer hover:fill-blue-600 duration-300 animate-pulse rotate-90`}
                                      onClick={() => clickOrDragToChangeTimeSlot(item.subject, item.TimeslotID)}
                                    />
                                    </>
                                  ) : ( //ถ้ามีวิชาอยู่ใน timeslot
                                    <>
                                      <div
                                        style={{display : Object.keys(item.subject).length == 0 ? 'none' : 'flex'}}
                                        className={`text-center select-none flex-col`}
                                      >
                                        <b className="text-sm">{item.subject.SubjectCode}</b>
                                        <b className="text-xs">{item.subject.SubjectName.substring(0,8)}...</b>
                                        <b className="text-xs">
                                          ม.{item.subject.GradeID[0]}/
                                          {parseInt(
                                            item.subject.GradeID.substring(1, 2)
                                          ) < 10
                                            ? item.subject.GradeID[2]
                                            : item.subject.GradeID.substring(
                                                1,
                                                2
                                              )}
                                        </b>
                                        <p className="text-xs">
                                          ห้อง {item.subject.RoomID}
                                        </p>
                                      </div>
                                      <ChangeCircleIcon 
                                        onClick={() => clickOrDragToChangeTimeSlot(item.subject, item.TimeslotID)} 
                                        style={{ 
                                          color: item.TimeslotID == timeslotIDtoChange.source ? "#fcba03" : "#2563eb", 
                                          display : checkBreakTime(item.Breaktime) || Object.keys(storeSelectedSubject).length !== 0 ? 'none' : 'flex'
                                        }}
                                        className={`cursor-pointer ${item.TimeslotID == timeslotIDtoChange.source ? "hover:fill-amber-500 animate-pulse" : "hover:fill-blue-700"} bg-white rounded-full duration-300 absolute left-[-11px] top-[-10px] rotate-90`} />
                                      <RemoveCircleIcon
                                        onClick={() =>
                                          removeSubjectFromSlot(item.subject, item.TimeslotID)
                                        }
                                        style={{ color: "#ef4444", display : (Object.keys(changeTimeSlotSubject).length !== 0) ? 'none' : 'flex'}}
                                        className="cursor-pointer hover:fill-red-600 bg-white rounded-full duration-300 absolute right-[-11px] top-[-10px]"
                                      />
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
