"use client"
import Dropdown from '@/components/elements/input/selected_input/Dropdown';
import MiniButton from '@/components/elements/static/MiniButton';
import React, {useEffect, useState} from 'react'
import { MdArrowForwardIos } from 'react-icons/md'
import SelectClassModal from '../../../../components/SelectClassModal';
import { usePathname, useRouter } from 'next/navigation';
import axios from 'axios';
type Props = {
}

const ShowTeacherData = (props: Props) => {
    const router = useRouter();
    const pathName = usePathname();
    const [searchText, setSearchText] = useState(""); //ข้อความค้นหาใน dropdown เลือกครู
    const [teacher, setTeacher] = useState<any>({
        TeacherID: null,
        Prefix: "",
        Firstname: "",
        Lastname: "",
        Department: "",
    }); //ข้อมูลของคุณครูที่เลือกเป็น object
    const [teacherLabel, setTeacherLabel] = useState<string>(""); //ใช้ตอนเลือก dropdown แล้วให้แสดงข้อมูลที่เลือก
    const [teacherFilterData, setTeacherFilterData] = useState<teacher[]>([]); //ข้อมูลสำหรับ filter ค้นหาชื่อแล้วค่อย set ลง data ที่นำไปแสดง
    const [teacherData, setTeacherData] = useState<teacher[]>([]); //ข้อมูลที่นำไปแสดง
    useEffect(() => {
        const getData = () => {
            axios.get('http://localhost:3000/api/teacher')
            .then((res) => {
                let data: teacher[] = res.data;
                setTeacherData(() => [...data]);
                setTeacherFilterData(() => [...data]);
            })
            .catch((err) => {
                console.log(err)
            })
        }
        return () => getData();
    }, [])
    const searchName = (name: string) => {
        //อันนี้แค่ทดสอบเท่านั่น ยังคนหาได้ไม่สุด เช่น ค้นหาแบบตัด case sensitive ยังไม่ได้
        let res = teacherFilterData.filter((item) =>
        `${item.Firstname} ${item.Lastname} - ${item.Department}`.match(name)
        );
        setTeacherData(res);
    };
    const searchHandle = (event:any) => {
        let text = event.target.value;
        setSearchText(text);
        searchName(text);
    }
  return (
    <>
        <div className='flex flex-col gap-3'>
        {/* เลือกครู */}
        <div className="flex w-full h-fit justify-between p-4 items-center border border-[#EDEEF3]">
            <div className="flex items-center gap-4">
            <p className="text-md" onClick={() => console.log(teacher)}>เลือกคุณครู</p>
            </div>
            <div className="flex flex-row justify-between gap-3">
            <Dropdown
                data={teacherData}
                renderItem={
                ({ data }): JSX.Element => (
                    <li className="w-full text-sm">
                        {data.Firstname} {data.Lastname} - {data.Department}
                    </li>
                )
                }
                width ={400}
                height ={40}
                currentValue={teacherLabel}
                handleChange={(data:any) => {
                    // getClassifyTeacher(data.TeacherID)
                    setTeacher(data)
                    setTeacherLabel(`${data.Firstname} ${data.Lastname} - ${data.Department}`)
                }}
                placeHolder='เลือกคุณครู'
                useSearchBar={true}
                searchFunciton={searchHandle}
            />
            </div>
        </div>
        {teacherLabel === ""
        ?
            null
        :
            <>
            {/* Teacher name */}
            <div className="flex w-full h-[55px] justify-between p-4 items-center border border-[#EDEEF3]">
                <div className="flex items-center gap-4">
                <p className="text-md">ชื่อ - นามสกุล</p>
                </div>
                <p className="text-md text-gray-500">{teacher.Firstname} {teacher.Lastname}</p>
            </div>
            <div className="flex w-full h-[55px] justify-between p-4 items-center border border-[#EDEEF3]">
                <div className="flex items-center gap-4">
                <p className="text-md">กลุ่มสาระการเรียนรู้</p>
                </div>
                <p className="text-md text-gray-500">{teacher.Department}</p>
            </div>
            <div className="flex w-full h-[55px] justify-between p-4 items-center border border-[#EDEEF3]">
                <div className="flex items-center gap-4">
                <p className="text-md">จำนวนคาบที่รับผิดชอบต่อสัปดาห์</p>
                </div>
                <p className="text-md text-gray-500">35 คาบ</p>
            </div>
            <div onClick={() => {router.push(`${pathName}/teacher_responsibility?TeacherID=${teacher.TeacherID}`)}} className="flex w-full h-[55px] justify-between p-4 items-center border border-[#EDEEF3] cursor-pointer hover:bg-gray-50 duration-300">
                <div className="flex items-center gap-4">
                    <p className="text-md">วิชาที่รับผิดชอบทั้งหมด</p>
                </div>
                <MdArrowForwardIos className="cursor-pointer" />
            </div>
            </>
        }
        </div>
    </>
  )
}

export default ShowTeacherData;