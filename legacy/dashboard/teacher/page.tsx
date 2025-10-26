"use client";
import React, { Fragment, useEffect, useState, type JSX } from "react";
import axios from "axios";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import teacher_resp from "@/raw-data/teahcer_responsib";
type Props = {};

function TeacherIndividualDashboard({}: Props) {
  const [teacher, setTeacher] = useState([]);
  const [teacherFilter, setTeacherFilter] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [teacherData, setTeacherData] = useState(teacher_resp);
  const searchName = (name: string) => {
    //อันนี้แค่ทดสอบเท่านั่น ยังคนหาได้ไม่สุด เช่น ค้นหาแบบตัด case sensitive ยังไม่ได้
    let res = teacherFilter.filter((item) =>
      `${item.SubjectCode} ${item.SubjectName}`.match(name)
    );
    setTeacher(res);
  };
  const searchHandle = (event: any) => {
    let text = event.target.value;
    setSearchText(text);
    searchName(text);
  };
  useEffect(() => {
    const getData = () => {
      axios
        .get("http://localhost:3000/api/teacher")
        .then((res) => {
          let data = res.data;
          setTeacher(() => data);
          setTeacherFilter(() => data);
        })
        .catch((err) => console.log(err));
    };
    return () => getData();
  }, []);
  const handleChange = (value: any) => {
    console.log(value);
    setTeacherData(() => ({ ...teacherData, Teacher: value }));
  };
  return (
    <>
      <div className="flex flex-col">
        <div className="flex w-full h-[80px] justify-between items-center border-b border-[#EDEEF3] mb-7">
          <h1 className="text-lg">สรุปข้อมูลครูรายบุคคล</h1>
        </div>
        <div className="flex justify-between items-center border border-[#EDEEF3] p-4">
          <p>เลือกครู</p>
          <Dropdown
            data={teacher}
            width={400}
            height={45}
            renderItem={({ data }: { data: any }): JSX.Element => (
              <li className="w-full text-sm">
                {data.Firstname} {data.Lastname} - {data.Department}
              </li>
            )}
            placeHolder="ตัวเลือก"
            currentValue={`${teacherData.Teacher.Firstname} ${teacherData.Teacher.Lastname} - ${teacherData.Teacher.Department}`}
            handleChange={handleChange}
            useSearchBar={true}
            searchFunction={searchHandle}
          />
        </div>
        <table className="flex flex-col mt-3 gap-3 h-screen">
          <thead>
            <tr className="flex gap-3">
              <th className="flex grow justify-center items-center bg-gray-100 p-4 rounded select-none">
                <span className="flex w-[125px] h-[24px] justify-center">
                  <p className="text-black">วิชา</p>
                </span>
              </th>
              <th className="flex grow justify-center items-center bg-gray-100 p-4 rounded select-none">
                <span className="flex w-[50px] h-[24px] justify-center">
                  <p className="text-black">ชั้น</p>
                </span>
              </th>
              {["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"].map((item) => (
                <Fragment key={`day${item}`}>
                  <th className="flex grow justify-center items-center bg-gray-100 p-4 rounded select-none">
                    <span className="flex w-[50px] h-[24px] justify-center">
                      <p className="text-black">{item}</p>
                    </span>
                  </th>
                </Fragment>
              ))}
              <th className="flex grow justify-center items-center bg-gray-100 p-4 rounded select-none">
                <span className="flex w-[50px] h-[24px] justify-center">
                  <p className="text-black">รวม</p>
                </span>
              </th>
            </tr>
          </thead>
          <tbody
            className={`flex flex-col gap-3 h-96 overflow-y-scroll 2xl:w-[1078px]`}
          >
            {teacherData.Grade.map((grade) => (
              <Fragment key={`year${grade.Year}eiei`}>
                {grade.ClassRooms.map((room) => (
                  <Fragment key={`room${room.GradeID}eiei`}>
                    {/* เหลือดูวันสอนว่าสอนวันไหนวิชาอะไร */}
                    {room.Subjects.map((subj, index) => (
                      <Fragment key={`subj${index}${subj.SubjectCode}eiei`}>
                        <tr className="flex gap-3">
                          <td className="flex grow justify-center items-center border border-[#EDEEF3] p-4 rounded select-none">
                            <span className="flex flex-col w-[125px] h-[60px] justify-center">
                              <p className="text-gray-600 font-bold">
                                {subj.SubjectCode}
                              </p>
                              <p className="text-gray-600">
                                {subj.SubjectName}
                              </p>
                            </span>
                          </td>
                          <td className="flex grow justify-center items-center border border-[#EDEEF3] p-4 rounded select-none">
                            <span className="flex w-[50px] h-[24px] justify-center">
                              <p className="text-gray-600">
                                ม.{room.GradeID.toString().slice(0, 1)}/
                                {room.GradeID.toString().slice(2)}
                              </p>
                            </span>
                          </td>
                          {["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"].map(
                            (day) => (
                              <Fragment key={`${day}eiei`}>
                                {day == subj.DayOfWeek ? (
                                  <td className="flex grow justify-center items-center bg-blue-100 p-4 rounded select-none">
                                    <span className="flex w-[50px] h-[24px] justify-center">
                                      <p className="text-blue-600">
                                        {subj.TeachHour}
                                      </p>
                                    </span>
                                  </td>
                                ) : (
                                  <td className="flex grow justify-center items-center bg-gray-100 p-4 rounded select-none">
                                    <span className="flex w-[50px] h-[24px] justify-center">
                                      {/* <p className="text-gray-600">{subj.TeachHour}</p> */}
                                    </span>
                                  </td>
                                )}
                              </Fragment>
                            )
                          )}
                          <td className="flex grow justify-center items-center border border-[#EDEEF3] p-4 rounded select-none">
                            <span className="flex w-[50px] h-[24px] justify-center">
                              <p className="text-gray-600">1</p>
                            </span>
                          </td>
                        </tr>
                      </Fragment>
                    ))}
                  </Fragment>
                ))}
              </Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr className="flex gap-3">
              <td className="flex grow justify-center items-center border border-[#EDEEF3] p-4 rounded select-none">
                <span className="flex w-[250px] h-[24px] justify-center">
                  <p className="text-gray-600">รวม</p>
                </span>
              </td>
              <td className="flex grow justify-center items-center border border-[#EDEEF3] p-4 rounded select-none">
                <span className="flex w-[50px] h-[24px] justify-center">
                  <p className="text-gray-600">1</p>
                </span>
              </td>
              <td className="flex grow justify-center items-center border border-[#EDEEF3] p-4 rounded select-none">
                <span className="flex w-[50px] h-[24px] justify-center">
                  <p className="text-gray-600">2</p>
                </span>
              </td>
              <td className="flex grow justify-center items-center border border-[#EDEEF3] p-4 rounded select-none">
                <span className="flex w-[50px] h-[24px] justify-center">
                  <p className="text-gray-600">3</p>
                </span>
              </td>
              <td className="flex grow justify-center items-center border border-[#EDEEF3] p-4 rounded select-none">
                <span className="flex w-[50px] h-[24px] justify-center">
                  <p className="text-gray-600">4</p>
                </span>
              </td>
              <td className="flex grow justify-center items-center border border-[#EDEEF3] p-4 rounded select-none">
                <span className="flex w-[50px] h-[24px] justify-center">
                  <p className="text-gray-600">5</p>
                </span>
              </td>
              <td className="flex grow justify-center items-center border border-[#EDEEF3] p-4 rounded select-none">
                <span className="flex w-[50px] h-[24px] justify-center">
                  <p className="text-gray-600">6</p>
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}

export default TeacherIndividualDashboard;
