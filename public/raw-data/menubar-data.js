import usericon from '@/svg/user/usericon.svg';
import book from '@/svg/edu/book.svg';
import gradhat from '@/svg/edu/gradhat.svg';
import mapicon from '@/svg/map.svg';

import tablesetting from '@/svg/table/tablesitting.svg';
import calandar from '@/svg/table/calendar.svg';
import table from '@/svg/table/table.svg';

import printericon from '@/svg/doc/printericon.svg';
import infoicon from '@/svg/infoicon.svg';
export const managementMenu = [
    {
        id : "teachertable",
        icon : usericon,
        title : "ข้อมูลรายชื่อครู",
        link : "/management/teacher"
    },
    {
        id : "subjecttable",
        icon : book,
        title : "ข้อมูลรายวิชา",
        link : "/management/subject"
    },
    {
        id : "roomtable",
        icon : mapicon,
        title : "ข้อมูลสถานที่เรียน",
        link : "/management/rooms"
    },
    {
        id : "gradeleveltable",
        icon : gradhat,
        title : "ข้อมูลชั้นเรียน",
        link : "/management/gradelevel"
    }
]
export const scheduleMenu = [
    {
        id : "timetableconfig",
        icon : tablesetting,
        title : "ตั้งค่าตารางสอน",
        semester : 2,
    },
    {
        id : "arrangetimetable",
        icon : calandar,
        title : "จัดตารางสอน",
        semester : 2,
    },
    {
        id : "showtimetable",
        icon : table,
        title : "แสดงตารางสอน",
        semester : 2,
    },
]
export const othersMenu = [
    {
        id : "printtimetable",
        icon : printericon,
        title : "ปรินท์ตารางสอน"
    },
    {
        id : "timetable-docs",
        icon : infoicon,
        title : "คู่มือการใช้งาน"
    },
]