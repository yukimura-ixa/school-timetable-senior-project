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
        link : ["/schedule/tableconfig/semester/1", "/schedule/tableconfig/semester/2"]
    },
    {
        id : "arrangetimetable",
        IconStyle : {
            Icon : BsTable,
        },
        title : "จัดตารางสอน",
        link : ["/schedule/timeslot/semester/1/classify", "/schedule/timeslot/semester/2/classify"] //default path
    },
    {
        id : "showtimetable",
        IconStyle : {
            Icon : BiSolidFileFind,
        },
        title : "แสดงตารางสอน",
        link : ["/schedule/display-timetable/semester/1/teacher", "/schedule/display-timetable/semester/2/teacher"]
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
export const dashboardMenu = [
    {
        id : "teachertable",
        IconStyle : {
            Icon : BiSolidUser,
        },
        title : "ข้อมูลรายชื่อครู",
        link : "/dashboard/teacher"
    },
    {
        id : "roomtable",
        IconStyle : {
            Icon : SiGoogleclassroom,
        },
        title : "ข้อมูลสถานที่เรียน",
        link : "/dashboard/rooms"
    },
    {
        id : "gradeleveltable",
        IconStyle : {
            Icon : HiAcademicCap,
        },
        title : "ข้อมูลชั้นเรียน",
        link : "/dashboard/classroom"
    }
]