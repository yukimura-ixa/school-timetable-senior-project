"use client";
import React from "react";
import AllStudyProgram from "./component/AllStudyProgram";

type Props = {};

function StudyProgram(props: Props) {

  return (
    <>
      <div className="my-4">
        <h1 className="text-xl font-bold">หลักสูตรทั้งหมด (เดี๋ยวค่อยมาทำให้สวยงาม คิด design ไม่ออก)</h1>
      </div>
      <AllStudyProgram />
    </>
  );
}

export default StudyProgram;
