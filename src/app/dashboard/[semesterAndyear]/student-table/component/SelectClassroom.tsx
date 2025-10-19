import Loading from "@/app/loading";
import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import ErrorState from "@/components/elements/static/ErrorState";
import type { gradelevel } from "@prisma/client";
import React, { useEffect, useState } from "react";

type Props = {
  setGradeID: (gradeId: string | null) => void;
  currentGrade: string | null;
  gradeLevels: gradelevel[];
  isLoading: boolean;
  error?: unknown;
};

const formatGradeLabel = (gradeId: string | null) => {
  if (!gradeId) {
    return "";
  }

  const roomNumber = Number.parseInt(gradeId.substring(1), 10);
  return `ม.${gradeId[0]}/${Number.isNaN(roomNumber) ? "" : roomNumber}`;
};

function SelectClassRoom({
  setGradeID,
  currentGrade,
  gradeLevels,
  isLoading,
  error,
}: Props) {
  const [classRoom, setClassRoom] = useState<string>(formatGradeLabel(currentGrade));

  useEffect(() => {
    setClassRoom(formatGradeLabel(currentGrade));
  }, [currentGrade]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorState message="ไม่สามารถโหลดข้อมูลระดับชั้นได้" />;
  }

  return (
    <div className="flex w-full items-center justify-between h-fit border border-[#EDEEF3] p-4">
      <p>เลือกชั้นเรียน</p>
      <Dropdown
        width={300}
        data={gradeLevels}
        placeHolder="ตัวเลือก"
        renderItem={({ data }: { data: gradelevel }) => (
          <li>
            <p>{formatGradeLabel(data.GradeID)}</p>
          </li>
        )}
        currentValue={classRoom}
        handleChange={(data: gradelevel) => {
          const gradeId = data.GradeID;
          setClassRoom(formatGradeLabel(gradeId));
          setGradeID(gradeId);
        }}
        searchFunction={undefined}
      />
    </div>
  );
}

export default SelectClassRoom;
