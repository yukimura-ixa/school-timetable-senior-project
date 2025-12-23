import React, { useState, type JSX } from "react";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SearchBar from "@/components/elements/input/field/SearchBar";

interface DropdownProps<T> {
  data: T[];
  renderItem: React.ComponentType<{ data: T }>;
  width?: string | number | null;
  height?: string | number;
  currentValue?: string;
  placeHolder?: string;
  handleChange: (item: T, index: number) => void;
  useSearchBar?: boolean;
  searchFunction?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  borderColor?: string;
  /** Optional: Extract unique ID from data item for stable E2E selectors */
  getItemId?: (item: T) => string | number;
  /** data-testid forwarded to the trigger for E2E reliability */
  testId?: string;
}

function Dropdown<T>({
  data,
  renderItem: ItemElement, //ทำการ Map ให้เป็นชื่อที่ขึ้นต้นด้วย Capital letter
  width = null,
  height = "auto",
  currentValue,
  placeHolder = "Options",
  handleChange,
  useSearchBar = false,
  searchFunction,
  borderColor = "",
  getItemId, // Extract ID for stable selectors
  testId,
}: DropdownProps<T>): JSX.Element {
  //Toggle สำหรับกดเปิด-ปิด Dropdown default is false
  const [isHidden, setIsHidden] = useState(false);
  const listboxId = React.useId(); // Generate unique ID for aria-controls

  // Avoid hydration mismatches caused by multi-line template literals (CRLF/LF whitespace differences)
  // by constructing className strings deterministically.
  const triggerClassName =
    "relative flex justify-between items-center border rounded bg-white px-[15px] py-[10px] cursor-pointer select-none gap-5 hover:bg-slate-100 duration-300";
  const iconClassName = `duration-300 ${isHidden ? "rotate-180" : ""}`;
  const listClassName = [
    "absolute",
    "flex",
    "z-20",
    "flex-col",
    "justify-left",
    "border",
    "cursor-pointer",
    "overflow-hidden",
    "select-none",
    "mt-1",
    "bg-white",
    "gap-3",
    useSearchBar ? "pt-5" : "",
    "overflow-y-scroll",
    "duration-300",
    "transition-all",
    "ease-out",
    isHidden ? "" : "scale-y-0 translate-y-[-75px]",
  ]
    .filter(Boolean)
    .join(" ");
  const emptyItemClassName =
    "w-[100%] bg-white flex justify-center items-center px-[15px] py-[10px] cursor-default";
  const optionClassName =
    "w-[100%] h-auto bg-white flex justify-left items-center px-[15px] py-[10px] hover:bg-cyan-50 hover:text-cyan-500";

  return (
    <div className="relative">
      <div
        className={triggerClassName}
        //กดเพื่อ set state toggle dropdown
        onClick={() => setIsHidden(!isHidden)} //กดปุ๊ปจะเซ็ทค่าเป็นค่าตรงข้ามกับ boolean ปัจจุบัน ด้วยนิเสธ '!'
        style={{
          width: width === null ? "fit-content" : width,
          height: height,
          borderColor: `${borderColor}`,
        }}
        role="combobox" // ARIA role for accessibility and E2E stability
        aria-expanded={isHidden}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        data-testid={testId}
      >
        <div
          className="flex justify-left text-sm"
          //กำหนดสีของ Placeholder เป็นสีเทากลางๆ แต่ถ้าเลือกค่าแล้ว text จะเป็นสีดำ
          style={{
            color:
              typeof currentValue === "undefined" || currentValue === ""
                ? "#676E85"
                : "#000",
          }}
        >
          {/* ถ้าไม่มีการใส่ currentValue เข้ามา จะสั่งให้วาง placeHolder เอาไว้ */}
          {typeof currentValue === "undefined" ||
          currentValue === "" ||
          currentValue == null
            ? placeHolder
            : typeof width === "number" && width < 200
              ? currentValue.length > 15
                ? `${currentValue.substring(0, 10)}...`
                : currentValue
              : currentValue}
        </div>
        <KeyboardArrowDownIcon className={iconClassName} aria-hidden="true" />
      </div>
      {/* ถ้าข้อมูลที่ส่งมามี Array.length เท่ากับ 0 จะไม่แสดง Dropdown List เมื่อกด Dropdown */}
      <div
        className={listClassName} //เช็คสถานะของ isHidden เพื่อเปิด Dropdown List
        style={{
          width: width === null ? "fit-content" : width,
          height: data.length < 3 ? "auto" : 150, //ถ้าข้อมูลเกิน 3 ชุด จะสั่งให้ fixed ความสูงไว้ที่ 150 แล้ว scroll เอา
        }}
        id={listboxId}
        role="listbox" // ARIA role for options container
        aria-hidden={!isHidden}
      >
        {useSearchBar && searchFunction ? (
          <SearchBar
            height="auto"
            fill="#FFFFFF"
            handleChange={searchFunction}
          />
        ) : null}
        {data.length === 0 ? (
          <div className={emptyItemClassName}>
            <p className="text-gray-400 text-sm">ไม่พบข้อมูล</p>
          </div>
        ) : (
          <div className="bg-white">
            {data.map((item, index: number) => {
              const itemId = getItemId ? getItemId(item) : undefined;
              return (
                <ul
                  className={optionClassName}
                  key={`${String(item)}(${index})`}
                  onClick={() => {
                    setIsHidden(false);
                    handleChange(item, index);
                  }}
                  //เมื่อกดเลือกข้อมูลใน List Dropdown จะพับกลับขึ้นไปแล้วเรียก handleChange
                  //ที่ส่งผ่าน props มาตอนแรก เพื่อส่งชุดข้อมูลที่เลือกกลับไป setState ที่ต้องการ
                  role="option" // ARIA role for individual option
                  data-item-id={itemId} // Stable selector for E2E tests
                  aria-selected={false}
                >
                  {/* Component ที่ส่งมาให้ใช้งาน รับ props เป็น data */}
                  <ItemElement data={item} />
                </ul>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dropdown;
