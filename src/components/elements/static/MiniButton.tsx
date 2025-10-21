import { hexToRGB } from "@/functions/componentFunctions";
import React, { useState } from "react";

import { IoIosRemoveCircle } from "react-icons/io";

interface IMiniButtonProps {
  title: string;
  buttonColor?: string;
  titleColor?: string;
  width?: string | number;
  height?: string | number;
  border?: boolean;
  borderColor?: string;
  isSelected?: boolean;
  handleClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  hoverable?: boolean;
}
function MiniButton({
  title = "Button",
  titleColor = "#000000",
  buttonColor = "#FFFFFF",
  width,
  height = 30,
  border = false,
  borderColor = "#222222",
  isSelected = false,
  hoverable = false,
  handleClick,
}: IMiniButtonProps): React.JSX.Element {
  interface RGBColor {
    r: number;
    g: number;
    b: number;
  }
  const [isHover, setIsHover] = useState(false);
  const buttonRGB: RGBColor = hexToRGB(buttonColor);
  const buttonRGBString: string = isHover
    ? `rgb(${buttonRGB.r - 20}, ${buttonRGB.g - 20}, ${buttonRGB.b - 20})`
    : `rgb(${buttonRGB.r}, ${buttonRGB.g}, ${buttonRGB.b})`;
  const titleRGB: RGBColor = hexToRGB(titleColor);
  const titleRGBString: string = `rgb(${titleRGB.r}, ${titleRGB.g}, ${titleRGB.b})`;
  const borderRGB: RGBColor = hexToRGB(borderColor);
  const borderRGBString: string = `rgb(${borderRGB.r}, ${borderRGB.g}, ${borderRGB.b})`;
  return (
    <div>
      <div
        onClick={handleClick}
        className={
          "flex justify-center items-center px-2 gap-2 rounded cursor-pointer select-none duration-300"
        }
        style={{
          width: width == null ? "fit-content" : width,
          height: height,
          borderWidth: border ? 1 : "none",
          borderColor: borderRGBString,
          backgroundColor: buttonRGBString,
        }}
        onMouseEnter={() => {
          hoverable ? setIsHover(true) : null;
        }}
        onMouseLeave={() => {
          hoverable ? setIsHover(false) : null;
        }}
      >
        <p className="text-sm" style={{ color: titleRGBString }}>
          {title}
        </p>
        {isSelected ? <IoIosRemoveCircle className="fill-red-500" /> : null}
      </div>
    </div>
  );
}

export default MiniButton;
