import React, {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type MouseEventHandler,
  type ReactElement,
} from "react";

//Image component from next
import Image, { type StaticImageData } from "next/image";

//Import functions
import { hexToRGB } from "@/functions/componentFunctions";

// ใช้กับ props ที่รับมาให้ component พร้อมกำหนดค่า default
type ButtonProps = {
  icon?: string | StaticImageData | ReactElement<any>; //SVG หรือ React Element สำหรับแสดงไอคอน
  iconAlt?: string; //ข้อความ alt ของ icon
  title?: string; //Label
  buttonColor?: string; //สีปุ่ม
  titleColor?: string; //สีข้อความ
  fontSize?: number; //ขนาดข้อความ
  fontWeight?: CSSProperties["fontWeight"]; //ความหนาของข้อความ
  width?: number | string | null; //ความกว้างปุ่ม ใส่ได้ทั้งค่าตัวเลขและ ค่าเปอร์เซ็นเป็น string ex '75%'
  height?: number | string | null; //เช่นเดียวกันกับความกว้าง
  handleClick?: MouseEventHandler<HTMLButtonElement>; //รับฟังก์ชั่นเพื่อใช้กับ onClick (รองรับชื่อเดิม)
  onClick?: React.MouseEventHandler<HTMLButtonElement>; // standard onClick prop
  className?: string; //className เพิ่มเติมของปุ่ม
  labelClassName?: string; //className เพิ่มเติมของตัวหนังสือ
  labelStyle?: CSSProperties; //style ของตัวหนังสือ
  iconPosition?: "left" | "right"; //กำหนดตำแหน่งของ icon
} & Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "title" | "color"
>;

const clampColorValue = (value: number): number => Math.max(0, Math.min(255, value));

const isStaticImageData = (value: string | StaticImageData | ReactElement<any>): value is StaticImageData => {
  return typeof value === "object" && value !== null && "src" in value && "height" in value && "width" in value;
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    icon,
    iconAlt,
    title,
    buttonColor = "#2F80ED",
    titleColor = "#FFF",
    fontSize = 16,
    fontWeight = 300,
    width,
    height = 45,
    handleClick,
    className,
    labelClassName,
    labelStyle,
    iconPosition = "left",
    style: customStyle,
    disabled: disabledProp = false,
    onClick,
    onMouseEnter: onMouseEnterProp,
    onMouseLeave: onMouseLeaveProp,
    ...rest
  },
  ref
): React.JSX.Element {
  const [isHover, setIsHover] = useState(false); //Hover state ใช้กับปุ่ม

  const { ["aria-label"]: ariaLabelProp, type: typeProp = "button", ...buttonProps } = rest;

  const disabled = disabledProp;

  useEffect(() => {
    // รีเซ็ต hover state เมื่อปุ่มถูก disabled เพื่อป้องกันสีผิดพลาด
    if (disabled && isHover) {
      setIsHover(false);
    }
  }, [disabled, isHover]);

  const buttonRGB = useMemo(() => hexToRGB(buttonColor), [buttonColor]);
  const titleRGB = useMemo(() => hexToRGB(titleColor), [titleColor]);

  //เก็บค่าสี RGB ของปุ่ม เพื่อนำไปใช้คำนวณ hover color
  const backgroundColor = !disabled && isHover
    ? `rgb(${clampColorValue(buttonRGB.r - 10)}, ${clampColorValue(buttonRGB.g - 10)}, ${clampColorValue(buttonRGB.b - 10)})`
    : `rgb(${buttonRGB.r}, ${buttonRGB.g}, ${buttonRGB.b})`;

  const textColor = `rgb(${titleRGB.r}, ${titleRGB.g}, ${titleRGB.b})`;

  const resolvedWidth = width ?? "fit-content";
  const resolvedHeight = height ?? 45;

  //style property ใช้เก็บค่าของ component props (ใส่ใน tailwind ไม่ได้ง่ะ ;-;)
  const buttonStyleProperty: CSSProperties = {
    backgroundColor,
    color: textColor,
    width: resolvedWidth,
    height: resolvedHeight,
    opacity: disabled ? 0.5 : 1,
    ...(customStyle ?? {}),
  };

  const titleStyle: CSSProperties = {
    color: textColor,
    fontSize,
    fontWeight,
    ...(labelStyle ?? {}),
  };

  const clickHandler = handleClick ?? onClick;

  const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>): void => {
    if (!disabled) {
      setIsHover(true);
    }
    onMouseEnterProp?.(event);
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLButtonElement>): void => {
    if (!disabled) {
      setIsHover(false);
    }
    onMouseLeaveProp?.(event);
  };

  const displayTitle = typeof title === "string" && title.trim().length > 0 ? title : "Button";

  const finalAriaLabel = ariaLabelProp ?? displayTitle;

  const contentClassName = `flex gap-[10px] items-center${iconPosition === "right" ? " flex-row-reverse" : ""}`;
  const titleClassName = labelClassName ? `text-sm ${labelClassName}` : "text-sm";

  const renderIcon = (): React.ReactNode => {
    if (!icon) {
      return null;
    }

    if (typeof icon === "string" || isStaticImageData(icon)) {
      return <Image src={icon} alt={iconAlt ?? displayTitle} />;
    }

    return icon;
  };

  const baseButtonClass = `flex items-center justify-center px-[15px] py-[10px] rounded${
    disabled ? "" : " cursor-pointer duration-300"
  } select-none`;
  const mergedButtonClass = className ? `${baseButtonClass} ${className}` : baseButtonClass;

  return (
    <button
      ref={ref}
      type={typeProp}
      className={mergedButtonClass}
      style={buttonStyleProperty}
      onClick={clickHandler}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      aria-label={finalAriaLabel}
      {...buttonProps}
    >
      <div className={contentClassName}>
        {renderIcon()}
        <p className={titleClassName} style={titleStyle}>
          {displayTitle}
        </p>
      </div>
    </button>
  );
});

export default Button;
