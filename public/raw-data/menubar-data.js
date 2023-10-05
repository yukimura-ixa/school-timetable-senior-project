import { BiSolidBook, BiSolidUser, BiSolidFileFind } from 'react-icons/bi';
import { BsTable } from 'react-icons/bs'
import { SiGoogleclassroom } from 'react-icons/si';
import { AiFillSetting, AiFillPrinter, AiFillInfoCircle } from 'react-icons/ai'
import { HiAcademicCap } from 'react-icons/hi2';
export const managementMenu = [
    {
        id : "teachertable",
        IconStyle : {
            Icon : BiSolidUser,
        },
        title : "ข้อมูลรายชื่อครู",
        link : "/management/teacher"
    },
    {
        id : "subjecttable",
        IconStyle : {
            Icon : BiSolidBook,
        },
        title : "ข้อมูลรายวิชา",
        link : "/management/subject"
    },
    {
        id : "roomtable",
        IconStyle : {
            Icon : SiGoogleclassroom,
        },
        title : "ข้อมูลสถานที่เรียน",
        link : "/management/rooms"
    },
    {
        id : "gradeleveltable",
        IconStyle : {
            Icon : HiAcademicCap,
        },
        title : "ข้อมูลชั้นเรียน",
        link : "/management/gradelevel"
    }
]
export const scheduleMenu = [
    {
        id : "timetableconfig",
        IconStyle : {
            Icon : AiFillSetting,
        },
        title : "ตั้งค่าตารางสอน",
        semester : 2,
        link : "/schedule/tableconfig"
    },
    {
        id : "arrangetimetable",
        IconStyle : {
            Icon : BsTable,
        },
        title : "จัดตารางสอน",
        semester : 2,
        link : "/schedule/timeslot"
    },
    {
        id : "showtimetable",
        IconStyle : {
            Icon : BiSolidFileFind,
        },
        title : "แสดงตารางสอน",
        semester : 2,
        link : "/schedule/display_timetable"
    },
]
export const othersMenu = [
    {
        id : "printtimetable",
        IconStyle : {
            Icon : AiFillPrinter,
        },
        title : "พิมพ์ตารางสอน",
        link : "/others/print"
    },
    {
        id : "timetable-docs",
        IconStyle : {
            Icon : AiFillInfoCircle,
        },
        title : "คู่มือการใช้งาน",
        link : "/others/docs"
    },
]