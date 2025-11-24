import { useTeachers } from "@/hooks";
import MiniButton from "@/components/elements/static/MiniButton";
import React, { Fragment, useEffect, useState } from "react";
import type { gradelevel } from "@/prisma/generated/client";

import { AiOutlineClose } from "react-icons/ai";
import { useGradeLevels } from "@/hooks";
import Loading from "@/app/loading";

import type { ModalCloseHandler } from "@/types/events";

interface ClassRoomItem {
  GradeID: string;
  isSelected?: boolean;
  SubjectCode?: string;
  SubjectName?: string;
  TeachHour?: number;
}

type props = {
  closeModal: ModalCloseHandler;
  classList: ClassRoomItem[];
  confirmChange: (selectedClasses: ClassRoomItem[], year: number) => void;
  year: number;
};
function SelectClassRoomModal({
  closeModal,
  classList,
  confirmChange,
  year,
}: props) {
  const { data, isLoading, error, mutate } = useGradeLevels();
  const [classRoomList, setClassRoomList] = useState<ClassRoomItem[]>([]);
  useEffect(() => {
    // ตัวอย่างข้อมูลแบบคร่าวๆ //
    // {GradeID : 101}
    // {GradeID : 201}
    // {GradeID : 301}
    // {GradeID : 401}
    // {GradeID : 501}
    // {GradeID : 601}
    const filterYear = data.filter((item) => item.Year == year); //filter เอาชั้นปีที่เลือก เช่น กดของมอหนึ่ง ก็จะเอาแค่มอหนึ่งออกมา ก็จะได้แค่ {GradeID: 101}
    const mapClassRoomData: ClassRoomItem[] = filterYear.map((item, index) => {
      const existingClass = classList.find(
        (gid) => item.GradeID === gid.GradeID,
      );
      return existingClass
        ? { ...existingClass, isSelected: true } //ถ้ามี ก็ใส่ isSelected: true เพื่อบ่งบอกว่าวิชานี้ได้เคยเลือกไว้ก่อนหน้าแล้ว
        : ({ GradeID: item.GradeID || "", isSelected: false } as ClassRoomItem); //ถ้าไม่ ก็ map ขึ้นมาให้ใหม่
    }); //ตรงนี่จะ Map ข้อมูลด้วยการเช็คว่า ข้อมูลที่ส่งมานั้นเคยมีแล้วหรือยัง ถ้ามาแล้วจะใส่ isSelected = true ถ้าไม่เคยมีก็ false
    //ทำเพื่ออะไร ? เพื่อตอนกดสลับเลือกห้องเรียนไปมา ข้อมูลของวิชาที่ติดอยู่กับห้องเรียนที่เคยเลือกแล้วจะได้ไม่หายไปไหน ของเก่าเนี่ย ถ้าเรากดลบห้องเรียนแล้วเพิ่มกลับมาใหม่ ข้อมูลวิชาในนั้นจะหายไป
    setClassRoomList(mapClassRoomData); //นำข้อมูลมา set state
  }, [isLoading]);
  const addSelectedList = (item: ClassRoomItem) => {
    setClassRoomList(() =>
      classRoomList.map((classRoom) =>
        classRoom.GradeID == item.GradeID
          ? { ...classRoom, isSelected: true }
          : classRoom,
      ),
    ); //ถ้ามีการกด Add ห้องเรียนเข้ามาใหม่ ก็จะเปลี่ยนแค่ boolean ของ isSelected ด้วยการเช็คว่า GradeID ไหนต้องการเปลี่ยน
  };
  const removeSelectedList = (item: ClassRoomItem) => {
    setClassRoomList(() =>
      classRoomList.map((classRoom) =>
        classRoom.GradeID == item.GradeID
          ? { ...classRoom, isSelected: false }
          : classRoom,
      ),
    ); //เหมือนกับฟังก์ชั่น addSelectedlist
  };
  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div
          style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
          className="z-40 flex w-full h-screen items-center justify-center fixed left-0 top-0"
        >
          <div className="flex flex-col w-[550px] h-auto p-[50px] gap-8 bg-white rounded">
            {/* Content */}
            <div className="flex flex-col w-full gap-3 h-auto">
              <div className="flex justify-between">
                <p
                  className="text-lg select-none"
                  onClick={() =>
                    console.log(
                      classRoomList
                        .filter((item) => item.isSelected)
                        .map((classRoom) => ({
                          GradeID: classRoom.GradeID,
                        })),
                    )
                  }
                >
                  เลือกชั้นเรียน
                </p>
                <AiOutlineClose
                  className="cursor-pointer"
                  onClick={closeModal}
                />
              </div>
              <p className="text-xs text-gray-300">
                เลือกชั้นเรียนของคุณครูที่รับผิดชอบในห้องนั้นๆ
              </p>
            </div>
            {/* ระดับชั้นที่เลือกแล้ว */}
            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-500">
                ชั้นเรียนที่เลือกแล้ว (ม.{year})
              </p>
              <div
                className={`flex items-center flex-wrap gap-4 w-full ${
                  classRoomList.filter((item) => item.isSelected).length === 0
                    ? "h-[45px]"
                    : null
                } border border-gray-300 px-3 py-3 rounded`}
              >
                {classRoomList.map((classRoom) => (
                  <Fragment key={`is-selected${classRoom.GradeID}`}>
                    {classRoom.isSelected ? (
                      <MiniButton
                        handleClick={() => removeSelectedList(classRoom)}
                        width={60}
                        height={25}
                        buttonColor="#fff"
                        titleColor="#000"
                        border={true}
                        borderColor="#c7c7c7"
                        isSelected={true}
                        hoverable={true}
                        title={`ม.${classRoom.GradeID.substring(
                          0,
                          1,
                        )}/${classRoom.GradeID.substring(2)}`}
                      />
                    ) : null}
                  </Fragment>
                ))}
              </div>
            </div>
            {/* เลือกระดับชั้นจากที่นี่ */}
            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-500">
                เลือกชั้นเรียนได้จากที่นี่ (ม.{year})
              </p>
              <div
                className={`flex items-center flex-wrap gap-4 w-full ${
                  classRoomList.filter((item) => !item.isSelected).length === 0
                    ? "h-[45px]"
                    : null
                } border border-gray-300 px-3 py-3 rounded`}
              >
                {classRoomList.map((classRoom) => (
                  <Fragment key={`not-selected-${classRoom.GradeID}`}>
                    {!classRoom.isSelected ? (
                      <MiniButton
                        handleClick={() => addSelectedList(classRoom)}
                        width={60}
                        height={25}
                        buttonColor="#fff"
                        titleColor="#000"
                        border={true}
                        borderColor="#c7c7c7"
                        isSelected={false}
                        hoverable={true}
                        title={`ม.${classRoom.GradeID.substring(
                          0,
                          1,
                        )}/${classRoom.GradeID.substring(2)}`}
                      />
                    ) : null}
                  </Fragment>
                ))}
              </div>
            </div>
            <span className="w-full flex justify-end">
              <button
                onClick={() =>
                  confirmChange(
                    classRoomList
                      .filter((item) => item.isSelected)
                      .map((classRoom) => ({
                        GradeID: classRoom.GradeID,
                      })),
                    year,
                  )
                }
                className=" w-[100px] bg-green-100 hover:bg-green-200 duration-500 text-green-600 py-2 px-4 rounded text-sm"
              >
                ยืนยัน
              </button>
            </span>
          </div>
        </div>
      )}
    </>
  );
}

export default SelectClassRoomModal;
