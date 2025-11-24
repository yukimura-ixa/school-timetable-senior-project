import Link from "next/link";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";

type Props = {
  params: Promise<{ semesterAndyear: string }>;
};

export default async function Header({ params }: Props) {
  const { semesterAndyear } = await params;
  const semesterSplit = semesterAndyear.split("-"); //from "1-2566" to ["1", "2566"]

  return (
    <div className="w-full flex justify-between items-center py-6">
      <h1 className="text-xl font-bold">
        ภาคเรียนที่ {semesterSplit[0]} ปีการศึกษา {semesterSplit[1]}
      </h1>
      <Link
        className="flex gap-3 items-center justify-between cursor-pointer"
        href={"/dashboard/select-semester"}
      >
        <KeyboardBackspaceIcon className="fill-gray-500" />
        <p className="select-none text-gray-500 text-sm">เปลี่ยนภาคเรียน</p>
      </Link>
    </div>
  );
}
