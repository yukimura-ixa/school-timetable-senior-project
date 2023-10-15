"use client";
import React from "react";
import { subjectData } from "@/raw-data/subject-table";
import Table from "@/app/management/subject/component/SubjectTable";

type Props = {};

const SubjectManage = (props: Props) => {
  const tableData = ({ data, handleChange, index }) => (
    <>
      <td
        className="font-bold px-6 whitespace-nowrap select-none"
        onClick={() => handleChange(index)}
      >
        {data.SubjectID}
      </td>
      <td
        className="px-6 whitespace-nowrap select-none"
        onClick={() => handleChange(index)}
      >
        {data.SubjectName}
      </td>
      <td
        className="px-6 whitespace-nowrap select-none"
        onClick={() => handleChange(index)}
      >
        {data.Credit}
      </td>
      <td
        className="px-6 whitespace-nowrap select-none"
        onClick={() => handleChange(index)}
      >
        {data.Category}
      </td>
    </>
  );
  const sortData = (data: any[], orderState: boolean, orderType: string) => {
    switch (orderType) {
      case "รหัสวิชา":
        console.log(orderType);
        return data.sort((a, b) =>
          orderState
            ? a.SubjectID.localeCompare(b.SubjectID)
            : b.SubjectID.localeCompare(a.SubjectID)
        );
      case "ชื่อวิชา":
        console.log(orderType);
        return data.sort((a, b) =>
          orderState
            ? a.SubjectName.toLowerCase().localeCompare(b.SubjectName)
            : b.SubjectName.toLowerCase().localeCompare(a.SubjectName)
        );
      case "หน่วยกิต":
        console.log(orderType);
        return data.sort((a, b) =>
          orderState ? a.Credit - b.Credit : b.Credit - a.Credit
        );
      case "กลุ่มสาระ":
        console.log(orderType);
        return data.sort((a, b) =>
          orderState
            ? a.Category.toLowerCase().localeCompare(b.Category)
            : b.Category.toLowerCase().localeCompare(a.Category)
        );
      default:
        return data.sort((a, b) => a.SubjectID - b.SubjectID);
    }
  };
  return (
    <>
      <Table
        data={subjectData}
        tableHead={["รหัสวิชา", "ชื่อวิชา", "หน่วยกิต", "กลุ่มสาระ"]}
        tableData={tableData}
        orderByFunction={sortData}
      />
    </>
  );
};

export default SubjectManage;
