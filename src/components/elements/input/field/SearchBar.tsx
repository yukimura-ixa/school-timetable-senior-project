
//SVG
import searchicon from "@/svg/crud/searchicon.svg";

import Image from "next/image";

interface SearchBarProps {
  width?: string | number | null;
  height: string | number;
  placeHolder?: string;
  fill?: string;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
}

function SearchBar({
  width = null,
  height,
  placeHolder = "ค้นหา",
  fill = "#EDEEF3",
  handleChange,
}: SearchBarProps) {
  return (
    <div className="flex items-center rounded relative">
      <input
        type="text"
        className="text-field pl-[45px]"
        placeholder={placeHolder}
        style={{
          width: width == null ? "fit-content" : width,
          height: height,
          backgroundColor: fill,
        }}
        onChange={handleChange}
      />
      <div className="flex gap-3 absolute left-3">
        <Image src={searchicon} alt="searchicon" />
      </div>
    </div>
  );
}

export default SearchBar;
