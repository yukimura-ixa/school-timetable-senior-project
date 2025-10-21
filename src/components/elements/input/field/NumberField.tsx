/* eslint-disable no-undef */
interface INumberFieldProps {
  width?: string | number;
  height?: string | number;
  placeHolder?: string;
  disabled?: boolean;
  label?: string;
  value?: number | string;
  borderColor?: string;
  handleChange?: any;
}
function NumberField({
  width = "auto",
  height = "auto",
  placeHolder = "",
  disabled = false,
  value,
  label,
  handleChange,
  borderColor = "",
}: INumberFieldProps): JSX.Element {
  const numberFieldStyleProperty: object = {
    width: width,
    height: height,
    borderWidth: 1,
    borderColor: borderColor,
  };
  return (
    <div className="flex flex-col text-left gap-2">
      <label className="text-sm font-bold">{label}</label>
      <input
        className="rounded text-field px-[15px] py-[10px] text-sm placeholder:text-sm"
        type="number"
        style={numberFieldStyleProperty}
        placeholder={placeHolder}
        onChange={handleChange}
        disabled={disabled}
        value={value}
      />
    </div>
  );
}

export default NumberField;
