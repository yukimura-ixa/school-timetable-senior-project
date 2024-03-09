"use client";
import React from "react";
import ChooseTeacher from "./component/ChooseTeacher";
type Props = {};

const ArrangeTimetable = (props: Props) => {

  return (
    <>
      <div className="flex flex-col gap-3 my-5">
        <ChooseTeacher />
      </div>
    </>
  );
};

export default ArrangeTimetable;
