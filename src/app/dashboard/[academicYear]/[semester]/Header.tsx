import Link from "next/link";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";

type Props = {
  params: Promise<{ academicYear: string; semester: string }>;
};

export default async function Header({ params }: Props) {
  const { academicYear, semester } = await params;

  return (
    <div className="w-full flex justify-between items-center py-6">
      <h1 className="text-xl font-bold">
        ภาคเรียนที่ {semester} ปีการศึกษา {academicYear}
      </h1>
      <Link
        className="flex gap-3 items-center justify-between cursor-pointer"
        href={"/dashboard"}
      >
        <KeyboardBackspaceIcon className="fill-gray-500" />
        <p className="select-none text-gray-500 text-sm">เปลี่ยนภาคเรียน</p>
      </Link>
    </div>
  );
}
