import { hexToRGB } from "@/app/functions/componentFunctions";
import React, { useState } from "react";

//SVG
import closeicon from "@/svg/crud/closeicon.svg";
import Image from "next/image";

interface MiniButton {
  title: string;
  buttonColor: string;
  titleColor: string;
  width: string | number;
  height: string | number;
  border: boolean;
  borderColor: string;
  isSelected: boolean;
}
function MiniButton({
  title = "Button",
  titleColor = "#000000",
  buttonColor = "#FFFFFF",
  width,
  height = 30,
  border = false,
  borderColor = "#222222",
  isSelected=false,
}: MiniButton): JSX.Element {
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
        className={
          "flex justify-center items-center px-2 gap-2 rounded cursor-pointer select-none duration-300 hover:scale-[1.05]"
        }
        style={{
          width: width == null ? "fit-content" : width,
          height: height,
          borderWidth: border ? 1 : "none",
          borderColor: borderRGBString,
          backgroundColor: buttonRGBString,
        }}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <p style={{ color: titleRGBString }}>{title}</p>
        {isSelected ? <Image src={closeicon} alt="closeicon" /> : null}
      </div>
    </div>
  );
}

export default MiniButton;
