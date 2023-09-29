import React from "react";

interface TextField {
  width: string | number;
  height: string | number;
  placeHolder: string;
  disabled: boolean;
  handleChange;
}
function TextField({
  width = "auto",
  height = 'auto',
  placeHolder = "",
  disabled = false,
  handleChange,
}: TextField) {
  const textFieldStyleProperty: object = {
    width: width,
    height: height,
    borderWidth: 1,
    borderColor: "#E0E1E8",
  };
  return (
    <input
      className="rounded text-field px-[15px] py-[10px]"
      type='text'
      style={textFieldStyleProperty}
      placeholder={placeHolder}
      onChange={handleChange}
      disabled={disabled}
    />
  );
}

export default TextField;
