import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import axios from "axios";
import React, { useEffect, useState } from "react";

type Props = {};

function SelectTeacherTimetable(props: Props) {
  const [teachers, setTeachers] = useState([]);
  const [teachersFilter, setTeachersFilter] = useState([]);
  const [teacherCurrentValue, setTeacherCurrentValue] = useState("");
  const [classRoomValue, setClassRoomValue] = useState("");
  const [searchText, setSearchText] = useState("");
  const [allClassRoom, setAllClassRoom] = useState([]);
  useEffect(() => {
    const getData = () => {
      axios
        .get("http://localhost:3000/api/teacher")
        .then((res) => {
          let data: teacher[] = res.data;
          setTeachers(() => [...data]);
          setTeachersFilter(() => [...data]);
        })
        .catch((err) => {
          console.log(err);
        });
      axios
        .get("http://localhost:3000/api/classroom_of_allclass")
        .then((res) => {
          let data = res.data.map((item) =>
              item.rooms.map((room) =>
                parseInt(`${item.Year}${room < 10 ? `0${room}` : room}`)
              )
            );
          let spreadMap = [
            ...data[0],
            ...data[1],
            ...data[2],
            ...data[3],
            ...data[4],
            ...data[5],
          ];
          setAllClassRoom(() => spreadMap);
          // console.log(mapClassRoom());
        })
        .catch((err) => console.log(err));
    };
    return () => getData();
  }, []);
  // const mapClassRoom = () => {
  //   let classRoomsmap = allClassRoom.map((item) =>
  //     item.rooms.map((room) =>
  //       parseInt(`${item.Year}${room < 10 ? `0${room}` : room}`)
  //     )
  //   );
  //   let spreadMap = [
  //     ...classRoomsmap[0],
  //     ...classRoomsmap[1],
  //     ...classRoomsmap[2],
  //     ...classRoomsmap[3],
  //     ...classRoomsmap[4],
  //     ...classRoomsmap[5],
  //   ];
  //   return classRoomsmap;
  // };
  const searchName = (name: string) => {
    //อันนี้แค่ทดสอบเท่านั่น ยังคนหาได้ไม่สุด เช่น ค้นหาแบบตัด case sensitive ยังไม่ได้
    let res = teachersFilter.filter((item) =>
      `${item.Firstname} ${item.Lastname} - ${item.Department}`.match(name)
    );
    setTeachers(res);
  };
  const searchHandle = (event: any) => {
    let text = event.target.value;
    setSearchText(text);
    searchName(text);
  };
  return (
    <>
      <div className="flex flex-col w-full p-3 gap-3 h-fit border border-[#EDEEF3]">
        {/* Select Teacher */}
        <div className="flex justify-between items-center">
          <p>เลือกครู</p>
          <Dropdown
            data={teachers}
            width={400}
            renderItem={({ data }): JSX.Element => (
              <li className="w-full text-sm">
                {data.Firstname} {data.Lastname} - {data.Department}
              </li>
            )}
            placeHolder={"ตัวเลือก"}
            currentValue={teacherCurrentValue}
            handleChange={(data: any) => {
              setTeacherCurrentValue(
                `${data.Firstname} ${data.Lastname} - ${data.Department}`
              );
            }}
            useSearchBar={true}
            searchFunciton={searchHandle}
          />
        </div>
        {/* Select Classroom */}
        {/* <div className="flex justify-between items-center">
          <p>เลือกชั้นเรียน</p>
          <Dropdown
            data={allClassRoom}
            width={200}
            renderItem={({ data }): JSX.Element => (
              <li className="w-full text-sm">ม.{data.toString().slice(0, 1)}/{data.toString().slice(2)}</li>
            )}
            placeHolder={"ตัวเลือก"}
            currentValue={classRoomValue}
            handleChange={(data: any) => {
              setClassRoomValue(`ม.${data.toString().slice(0, 1)}/${data.toString().slice(2)}`);
            }}
            // useSearchBar={true}
            // searchFunciton={searchHandle}
          />
        </div> */}
      </div>
    </>
  );
}

export default SelectTeacherTimetable;
