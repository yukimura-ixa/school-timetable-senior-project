import AddCircleIcon from "@mui/icons-material/AddCircle";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import HttpsIcon from "@mui/icons-material/Https";

interface IArrangePageHeadProps {
  teacherData: {
    Firstname: string;
    Lastname: string;
  };
}
function ArrangePageHead({ teacherData }: IArrangePageHeadProps) {
  return (
    <>
      <div className="w-full flex justify-between items-center">
        <div className="p-4 mt-4 flex gap-3">
          <p className="text-sm">ตารางสอนของ</p>
          <p className="text-sm font-bold">
            คุณครู {teacherData.Firstname} {teacherData.Lastname}
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex gap-3 items-center">
            <div className="w-6 h-6 bg-white border-dashed border-2 rounded border-gray-500" />
            <p className="text-xs select-none">คาบว่าง</p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="w-6 h-6 bg-gray-200 border border-gray-300 rounded" />
            <p className="text-xs select-none">คาบพัก</p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="w-6 h-6 bg-white border-green-300 border rounded flex items-center justify-center">
              <AddCircleIcon style={{ width: "12px", color: "#10b981" }} />
            </div>
            <p className="text-xs select-none">เพิ่มคาบ</p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="w-6 h-6 bg-white border-blue-300 border rounded flex items-center justify-center">
              <ChangeCircleIcon
                style={{ width: "12px", color: "#345eeb" }}
                className="rotate-90"
              />
            </div>
            <p className="text-xs select-none">สลับคาบ</p>
          </div>
          <div className="flex gap-3 items-center relative">
            <div className="w-6 h-6 bg-gray-200 border border-gray-300 rounded flex items-center justify-center">
              <HttpsIcon
                style={{ width: "12px", color: "#3d3d3d" }}
                className="absolute top-[-10px] left-[-4px]"
              />
            </div>
            <p className="text-xs select-none">คาบล็อก</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default ArrangePageHead;
