import type { JSX } from "react";

interface ICheckBoxProps {
  label: string;
  value: string | number;
  name: string;
  handleClick: any;
  checked: boolean;
  disabled?: boolean;
}
function CheckBox({
  label = "Checkbox",
  value,
  name,
  handleClick,
  checked = false,
  disabled = false,
}: ICheckBoxProps): JSX.Element {
  return (
    <div className="flex justify-center items-center gap-3 flex-row w-fit h-fit">
      {checked ? (
        <input
          type="checkbox"
          className="outline-none"
          value={value}
          name={name}
          onClick={handleClick}
          checked
          disabled={disabled}
        />
      ) : (
        <input
          type="checkbox"
          className="outline-none"
          value={value}
          name={name}
          onClick={handleClick}
          disabled={disabled}
        />
      )}
      <label className="select-none text-gray-500 text-sm">{label}</label>
    </div>
  );
}

export default CheckBox;
