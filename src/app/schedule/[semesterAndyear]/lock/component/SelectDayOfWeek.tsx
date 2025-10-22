import Dropdown from "@/components/elements/input/selected_input/Dropdown";
import { dayOfWeekThai } from "@/models/dayofweek-thai";
import { BsInfo } from "react-icons/bs";

type Props = {
  dayOfWeek: string;
  handleDayChange: (value: string) => void;
  required: boolean;
};

function SelectDayOfWeek(props: Props) {
  return (
    <>
      <div className="flex justify-between w-full items-center">
        <div className="text-sm flex gap-1 items-center">
          <p>วัน</p>
          <p className="text-red-500">*</p>
          {props.required ? (
            <div className="ml-3 flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
              <BsInfo className="bg-red-500 rounded-full fill-white" />
              <p className="text-red-500 text-sm">ต้องการ</p>
            </div>
          ) : null}
        </div>
        <Dropdown
          data={["MON", "TUE", "WED", "THU", "FRI"]}
          renderItem={({ data }: { data: string }): JSX.Element => (
            <li className="w-full text-sm">{dayOfWeekThai[data]}</li>
          )}
          width={200}
          height={40}
          currentValue={dayOfWeekThai[props.dayOfWeek]}
          placeHolder={"ตัวเลือก"}
          handleChange={props.handleDayChange}
        />
      </div>
    </>
  );
}

export default SelectDayOfWeek;
