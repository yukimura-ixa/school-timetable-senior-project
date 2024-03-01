import { BiSolidBook, BiSolidUser, BiSolidFileFind } from 'react-icons/bi';
import { BsDisplay, BsTable } from 'react-icons/bs'
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
    },
    {
        id : "studyprogram",
        IconStyle : {
            Icon : HiAcademicCap,
        },
        title : "หลักสูตร",
        link : "/management/program"
    }
]
export const scheduleMenu = [
    // {
    //     id : "timetableconfig",
    //     IconStyle : {
    //         Icon : AiFillSetting,
    //     },
    //     title : "ตั้งค่าตารางสอน",
    //     link : "/schedule/tableconfig"
    // },
    {
        id : "arrangetimetable",
        IconStyle : {
            Icon : BsTable,
        },
        title : "จัดตารางสอน",
        // link : ["/schedule/timeslot/semester/1/classify", "/schedule/timeslot/semester/2/classify"] //default path
        link : "/schedule/select-semester"
    },
    // {
    //     id : "showtimetable",
    //     IconStyle : {
    //         Icon : BiSolidFileFind,
    //     },
    //     title : "แสดงตารางสอน",
    //     link : "/dashboard/select-semester"
    // },
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
export const showTimetableMenu = [
    {
        id : "teacher-timetable",
        IconStyle : {
            Icon : BsDisplay,
        },
        title : "แสดงตารางครู",
        link : "dashboard/teacher-table"
    },
    {
        id : "student-timetable",
        IconStyle : {
            Icon : BsDisplay,
        },
        title : "แสดงตารางนักเรียน",
        link : "dashboard/student-table"
    },
]
export const dashboardMenu = [
    {
        id : "teachertable",
        IconStyle : {
            Icon : BiSolidUser,
        },
        title : "สรุปข้อมูลคุณครู",
        link : "dashboard/teacher"
    },
    {
        id : "roomtable",
        IconStyle : {
            Icon : SiGoogleclassroom,
        },
        title : "สรุปข้อมูลสถานที่เรียน",
        link : "dashboard/rooms"
    },
    {
        id : "gradeleveltable",
        IconStyle : {
            Icon : HiAcademicCap,
        },
        title : "สรุปข้อมูลชั้นเรียน",
        link : "dashboard/classroom"
    }
]