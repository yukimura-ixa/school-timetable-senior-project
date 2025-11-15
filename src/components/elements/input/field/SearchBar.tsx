import SearchIcon from "@mui/icons-material/Search";

interface SearchBarProps {
  width?: string | number | null;
  height?: string | number;
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
  value,
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
      <div className="flex gap-3 absolute left-3 text-gray-500">
        <SearchIcon fontSize="small" aria-hidden="true" />
      </div>
    </div>
  );
}

export default SearchBar;
