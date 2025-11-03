import MiniButton from "@/components/elements/static/MiniButton";
import React, { Fragment } from "react";
import { BsInfo } from "react-icons/bs";
import { useGradeLevels } from "@/hooks";

type Props = {
  Grade: any;
  classRoomHandleChange: any;
  required:boolean
};

function SelectedClassRoom(props: Props) {
  const { data, isLoading, error, mutate } = useGradeLevels();
  const asdas = () => {
    let a = data.filter((item) => item.Year == 1).map((item) => item)
    console.log(props.Grade)
  }
  return (
    <>
      <div className="flex flex-col gap-3 justify-between w-full">
        <div className="text-sm flex gap-2 items-center">
          <div className="text-sm flex gap-1">
            <p onClick={() => asdas()}>เลือกชั้นเรียน</p>
            <p className="text-red-500">*</p>
          </div>
          <p className="text-blue-500">(คลิกที่ชั้นเรียนเพื่อเลือก)</p>
            {props.required ? (
            <div className="ml-3 flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
              <BsInfo className="bg-red-500 rounded-full fill-white" />
              <p className="text-red-500 text-sm">ต้องการ</p>
            </div>
            ) : null}
        </div>
        {[1, 2, 3, 4, 5, 6].map((grade) => (
          <Fragment key={`selectGrade${grade}`}>
            <div className="flex justify-between p-2 w-full h-fit border border-[#EDEEF3] items-center">
              <p>{`ม.${grade}`}</p>
              {/* <CheckBox label={`ม.${grade}`} /> */}
              <div className="flex flex-wrap w-1/2 justify-end gap-3">
                {data
                  .filter((item) => item.Year == grade)
                  .map((classroom: any) => (
                    <Fragment key={`${classroom.GradeID}`}>
                      <MiniButton
                        titleColor={
                          props.Grade.filter((item: any) => item.GradeID === classroom.GradeID).length > 0
                            ? "#008022"
                            : "#222222"
                        }
                        borderColor={
                          props.Grade.filter((item: any) => item.GradeID === classroom.GradeID).length > 0
                            ? "#abffc1"
                            : "#888888"
                        }
                        buttonColor={
                          props.Grade.filter((item: any) => item.GradeID === classroom.GradeID).length > 0
                            ? "#abffc1"
                            : "#ffffff"
                        }
                        border={true}
                        title={`ม.${classroom.Year}/${classroom.Number}`}
                        handleClick={() => {
                          props.classRoomHandleChange(
                            classroom
                          );
                        }}
                        width={""}
                        height={""}
                        isSelected={false}
                        hoverable={false}
                      />
                    </Fragment>
                  ))}
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </>
  );
}

export default SelectedClassRoom;
