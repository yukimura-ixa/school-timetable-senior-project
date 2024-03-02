import Link from 'next/link'
import { useParams } from 'next/navigation';
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import React from 'react'

type Props = {}

const Header = (props: Props) => {
    const params = useParams();
    const semesterSplit = (params.semesterAndyear as string).split("-"); //from "1-2566" to ["1", "2566"]
  return (
    <div className="w-full flex justify-between items-center py-6">
        <h1 className="text-xl font-bold">
        เทอม {semesterSplit[0]} ปีการศึกษา {semesterSplit[1]}
        </h1>
        <Link
        className="flex gap-3 items-center justify-between cursor-pointer"
        href={"/dashboard/select-semester"}
        >
        <KeyboardBackspaceIcon className="fill-gray-500" />
        <p className="select-none text-gray-500 text-sm">เปลี่ยนเทอม</p>
        </Link>
  </div>
  )
}

export default Header