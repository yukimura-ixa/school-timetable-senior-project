"use client"
import Dropdown from '@/components/elements/input/selected_input/Dropdown';
import MiniButton from '@/components/elements/static/MiniButton';
import React, {useState} from 'react'
import { MdArrowForwardIos } from 'react-icons/md'
import SelectClassModal from '../../../../components/SelectClassModal';
import { usePathname, useRouter } from 'next/navigation';
type Props = {
}

const ShowTeacherData = (props: Props) => {
    const router = useRouter();
    const pathName = usePathname();
    const [classModalActive, setClassModalActive] = useState<boolean>(false) //เปิด modal สำหรับเลือกชั้นเรียนที่รับผิดชอบ
    const [searchText, setSearchText] = useState(""); //ข้อความค้นหาใน dropdown เลือกครู
    // const [category, setCategory] = useState<string>("");
    const [teacher, setTeacher] = useState<teacher>(); //ข้อมูลของคุณครูที่เลือกเป็น object
    const [teacherLabel, setTeacherLabel] = useState<string>(""); //ใช้ตอนเลือก dropdown แล้วให้แสดงข้อมูลที่เลือก
    const [teacherFilterData, setTeacherFilterData] = useState([
        {
            TeacherID : 0,
            FirstName : "ชาติ",
            LastName : "แสงกระจ่าง",
            Department : "ภาษาไทย"
        },
        {
            TeacherID : 1,
            FirstName : "พงษ์สิทธิ์",
            LastName : "โชตวาณิช",
            Department : "สังคมศึกษาฯ"
        },
        {
            TeacherID : 2,
            FirstName : "ชัญญา",
            LastName : "วัฒนโกศล",
            Department : "ศิลปะ"
        },
        {
            TeacherID : 3,
            FirstName : "ศศิรา",
            LastName : "ต้นทอง",
            Department : "วิทยาศาสตร์"
        },
        {
            TeacherID : 4,
            FirstName : "กลวัชร",
            LastName : "ไชยสงคราม",
            Department : "การงานอาชีพและเทคโนโลยี"
        },
    ]); //ข้อมูลสำหรับ filter ค้นหาชื่อแล้วค่อย set ลง data ที่นำไปแสดง
    const [teacherData, setTeacherData] = useState([
        {
            TeacherID : 0,
            FirstName : "ชาติ",
            LastName : "แสงกระจ่าง",
            Department : "ภาษาไทย"
        },
        {
            TeacherID : 1,
            FirstName : "พงษ์สิทธิ์",
            LastName : "โชตวาณิช",
            Department : "สังคมศึกษาฯ"
        },
        {
            TeacherID : 2,
            FirstName : "ชัญญา",
            LastName : "วัฒนโกศล",
            Department : "ศิลปะ"
        },
        {
            TeacherID : 3,
            FirstName : "ศศิรา",
            LastName : "ต้นทอง",
            Department : "วิทยาศาสตร์"
        },
        {
            TeacherID : 4,
            FirstName : "กลวัชร",
            LastName : "ไชยสงคราม",
            Department : "การงานอาชีพและเทคโนโลยี"
        },
    ]); //ข้อมูลที่นำไปแสดง
    const [classList, setClassList] = useState<string[]>(["ม.2", "ม.3", "ม.5"]) //ชั้นเรียนที่รับผิดชอบของคุณครูคนนั้นๆ
    const searchName = (name: string) => {
        //อันนี้แค่ทดสอบเท่านั่น ยังคนหาได้ไม่สุด เช่น ค้นหาแบบตัด case sensitive ยังไม่ได้
        let res = teacherFilterData.filter((item) =>
        `${item.FirstName} ${item.LastName} - ${item.Department}`.match(name)
        );
        setTeacherData(res);
    };
    const searchHandle = (event:any) => {
        let text = event.target.value;
        setSearchText(text);
        searchName(text);
    }
    const changeClassList = (item: string[]) => {
        setClassList(() => item);
        setClassModalActive(false)
    } 
  return (
    <>
        {classModalActive ? <SelectClassModal confirmChange={changeClassList} closeModal={() => setClassModalActive(false)} classList={classList}/> : null}
        <div className='flex flex-col gap-3'>
        {/* เลือกครู */}
        <div className="flex w-full h-fit justify-between p-4 items-center border border-[#EDEEF3]">
            <div className="flex items-center gap-4">
            <p className="text-md">เลือกคุณครู</p>
            </div>
            <div className="flex flex-row justify-between gap-3">
            {/* <Dropdown
                data={["ภาษาไทย", "คณิตศาสตร์"]}
                renderItem={
                ({ data }): JSX.Element => (
                    <li className="w-full">
                        {data}
                    </li>
                )
                }
                width ={200}
                height ={40}
                currentValue={category}
                handleChange={(data:any) => {
                setCategory(data);
                }}
            /> */}
            <Dropdown
                data={teacherData}
                renderItem={
                ({ data }): JSX.Element => (
                    <li className="w-full">
                        {data.FirstName} {data.LastName} - {data.Department}
                    </li>
                )
                }
                width ={400}
                height ={40}
                currentValue={teacherLabel}
                handleChange={(data:any) => {
                    setTeacher(data);
                    setTeacherLabel(`${data.FirstName} ${data.LastName} - ${data.Department}`)
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
                <p className="text-md text-gray-500">{teacher.FirstName} {teacher.LastName}</p>
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
            <div className="flex w-full h-[55px] justify-between p-4 items-center border border-[#EDEEF3]">
                <div className="flex items-center gap-4">
                    <p className="text-md">ชั้นเรียนที่รับผิดชอบ</p>
                </div>
                <div className='flex flex-row gap-3'>
                    {classList.map((item) => (
                        <React.Fragment key={item}>
                            <MiniButton width={45} height={25} border={true} borderColor="#c7c7c7" title={item} />
                        </React.Fragment>
                    ))}
                    <u onClick={() => setClassModalActive(true)} className='text-cyan-500 cursor-pointer select-none'>เลือก</u>
                </div>
            </div>
            <div onClick={() => {router.push(`${pathName}/teacher_responsibility`)}} className="flex w-full h-[55px] justify-between p-4 items-center border border-[#EDEEF3] cursor-pointer hover:bg-gray-50 duration-300">
                <div className="flex items-center gap-4">
                    <p className="text-md">ห้องเรียนที่รับผิดชอบ</p>
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