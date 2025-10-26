import { MenuItem, Select } from "@mui/material";
import { semester } from "@/prisma/generated";
import { BsInfo } from "react-icons/bs";

type Props = {
  required: boolean;
  semester: semester | string;
  year?: number;
  handleSemesterChange: any;
  handleYearChange?: any;
};

const YearSemester = (props: Props) => {
  return (
    <div className="flex justify-between items-center align-middle">
      <div className="text-sm flex gap-1 items-center">
        <p>เทอม</p>
        <p className="text-red-500">*</p>
        {props.required ? (
          <div className="ml-3 flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
            <BsInfo className="bg-red-500 rounded-full fill-white" />
            <p className="text-red-500 text-sm">ต้องการ</p>
          </div>
        ) : null}
      </div>
      <div className="flex gap-2">
        <Select
          className="
          min-w-[100px]
      border
      rounded
      bg-white
      px-[15px]
      cursor-pointer
      hover:bg-slate-100
      duration-300"
          value={props.semester ? props.semester : ""}
          onChange={(e: any) => props.handleSemesterChange(e.target.value)}
          variant="standard"
        >
          <MenuItem value={semester["SEMESTER_1"]}>เทอม 1</MenuItem>
          <MenuItem value={semester["SEMESTER_2"]}>เทอม 2</MenuItem>
        </Select>
        {/* <TextField
          placeHolder="2560"
          value={props.year.toString()}
          handleChange={(e: any) => {
            if (e.target.value.length <= 4 && !isNaN(e.target.value)) {
              props.handleYearChange(e.target.value);
            }
          }}
          disabled={false}
        /> */}
      </div>
    </div>
  );
};

export default YearSemester;
