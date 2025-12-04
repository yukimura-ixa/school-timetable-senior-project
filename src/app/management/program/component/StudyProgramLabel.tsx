import TextField from "@/components/mui/TextField";
import { BsInfo } from "react-icons/bs";

type Props = { required: boolean; title: string; handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void };

const StudyProgramLabel = (props: Props) => {
  return (
    <div className="flex justify-between items-center">
      <div className="text-sm flex gap-1 items-center">
        <p>ชื่อหลักสูตร</p>
        <p className="text-red-500">*</p>
        {props.required ? (
          <div className="ml-3 flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
            <BsInfo className="bg-red-500 rounded-full fill-white" />
            <p className="text-red-500 text-sm">ต้องการ</p>
          </div>
        ) : null}
      </div>
      <TextField
        width={275}
        height="auto"
        placeHolder=""
        value={props.title}
        // borderColor={
        //   isEmptyData && teacher.Firstname.length == 0 ? "#F96161" : ""
        // }
        handleChange={props.handleChange}
        disabled={false}
      />
    </div>
  );
};

export default StudyProgramLabel;
