"use client";
import React, { useState, useEffect, Fragment } from "react";
import axios from "axios";
//ICON
import { IoIosArrowDown } from "react-icons/io";
import { MdModeEditOutline } from "react-icons/md";
import { BiSolidTrashAlt } from "react-icons/bi";
import { BsCheckLg } from "react-icons/bs";
//comp
import AddModalForm from "@/app/management/teacher/component/AddModalForm";
import SearchBar from "@/components/elements/input/field/SearchBar";
import ConfirmDeleteModal from "../../teacher/component/ConfirmDeleteModal";
import EditModalForm from "../../teacher/component/EditModalForm";
import MiniButton from "@/components/elements/static/MiniButton";
import PrimaryButton from "@/components/elements/static/PrimaryButton";
//MUI
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from "@mui/material/InputAdornment";
interface Table {
  tableHead: string[]; //กำหนดเป็น Array ของ property ทั้งหมดเพื่อสร้าง table head
  tableData: Function;
  orderByFunction: Function;
}
function Table({
  tableHead,
  tableData: TableData,
  orderByFunction,
}: Table): JSX.Element {
  const [pageOfData, setPageOfData] = useState<number>(1);
  const [AddModalActive, setAddModalActive] = useState<boolean>(false);
  const [deleteModalActive, setDeleteModalActive] = useState<boolean>(false);
  const [editModalActive, setEditModalActive] = useState<boolean>(false);
  const [teacherData, setTeacherData] = useState<teacher[]>([]); //ข้อมูลครูใช้ render
  const [checkedList, setCheckedList] = useState<number[]>([]); //เก็บค่าของ checkbox เป็น index
  useEffect(() => {
    const getData = () => {
      axios
        .get("http://localhost:3000/api/teacher", {})
        .then((res) => {
          let data: teacher[] = res.data;
          setTeacherData(() => [...data]);
        })
        .catch((err) => {
          console.log(err);
        });
    };
    return () => getData();
  }, []);
  const handleChange = (event: any) => {
    //เช็คการเปลี่ยนแปลงที่นี่ พร้อมรับ event
    event.target.checked //เช็คว่าเรากดติ๊กหรือยัง
      ? //ถ้ากดติ๊กแล้ว จะเซ็ทข้อมูล index ของ data ทั้งหมดลงไปใน checkList
        //เช่น จำนวน data มี 5 ชุด จะได้เป็น => [0, 1, 2, 3, 4]
        setCheckedList(() => teacherData.map((item, index) => index))
      : //ถ้าติ๊กออก จะล้างค่าทั้งหมดโดยการแปะ empty array ทับลงไป
        setCheckedList(() => []);
  };
  const ClickToSelect = (index: number) => {
    //เมื่อติ๊ก checkbox ในแต่ละ row เราจะทำการเพิ่ม index ลงไปใน checkList
    setCheckedList(() =>
      //ก่อนอื่นเช็คว่า index ที่จะเพิ่มลงไปมีใน checkList แล้วหรือยัง
      //ขยาย...เพราะเราต้องติ๊กเข้าติ๊กออก ต้อง toggle ค่า
      checkedList.includes(index) //คำสั่ง includes return เป็น boolean
        ? //เมื่อเป็นจริง (มีการติ๊กในแถวนั้นๆมาก่อนแล้ว แล้วกดติ๊กซ้ำ)
          //ทำการวาง array ทับโดยการ filter index นั้นออกไป
          checkedList.filter((item) => item != index)
        : //เมื่อยังไม่ถูกติ๊กมาก่อน ก็จะเพิ่ม index ที่ติ๊กเข้าไป
          [...checkedList, index]
    );
  };
  useEffect(() => {
    checkedList.sort();
  }, [checkedList]); //ตรงนี้เป็นการ sort Checklist
  //เราจะใช้การ order by data id ASC เป็นค่าเริ่มต้น ที่เหลือก็แล้วแต่จะโปรด
  const [orderedIndex, setOrderedIndex] = useState(-1); //ตั้ง default ที่ -1
  const [orderType, setOrderType] = useState("");
  const [orderState, setOrderState] = useState(true); //true = ASC false = DESC
  const toggleOrdered = (index: number, type: string) => {
    //ถ้ากด order ที่ไม่ใช่อันเดิม ให้เซ็ต index ของอันใหม่ละก็ตั้ง orderState กลับเป็น true
    if (orderedIndex !== index) {
      setOrderedIndex(index);
      setOrderType(type);
      setOrderState(true);
    } else {
      //ถ้ากด order ช่องเดิมซ้ำๆ
      setOrderState(!orderState); //สั่งให้ toggle boolean
    }
    //console.log(orderState);
  };
  useEffect(() => {
    setTeacherData(() => orderByFunction(teacherData, orderState, orderType));
  }, [orderType, orderState]);
  //เพิ่มข้อมูลเข้าไปที่ table data
  const addData = async (data: teacher[]) => {
    try {
      console.log(data);
      const response = await axios.post("http://localhost:3000/api/teacher", data);
      setTeacherData(() => [...data, ...teacherData]);
      console.log(response);
    } catch (err) {
      console.log(err);
    }
  };
  const editMultiData = async (data: any) => {
    try {
      let selectData = {
        TeacherID : teacherData.filter((item, index) => checkedList.includes(index)).map(item => item.TeacherID),
        data : data
      }
      const response = await axios.put("http://localhost:3000/api/teacher", selectData);
      //copy array มาก่อน
      let dataCopy = [...teacherData];
      //loop ข้อมูลเฉพาะตัวที่แก้ไข
      for (let i = 0; i < checkedList.length; i++) {
        //ลบตัวเก่าและแทนที่ด้วยตัวที่แก้ไขมา
        dataCopy.splice(checkedList[i], 1, data[i]);
      }
      //วาง array ทับลงไปใหม่
      setTeacherData(() => [...dataCopy]);
      //clear checkbox
      setCheckedList(() => []);
      console.log(response);
    } catch (err) {
      console.log(err);
    }
  };
  //Function ตัวนี้ใช้ลบข้อมูลหนึ่งตัวพร้อมกันหลายตัวจากการติ๊ก checkbox
  //24-11-2023 ปัจจุบัน func ลบ ยังไม่สมบูรณ์ เพราะการลบมันพ่วงโดนหลายตาราง ค่อยมาทำ
  const removeMultiData = async () => {
    let data = teacherData.filter((item, index) => checkedList.includes(index)).map(item => item.TeacherID);
    console.log(data);
    try {
      const response = await axios.delete("http://localhost:3000/api/teacher", {
        data : data
      });
      setTeacherData(() =>
        teacherData.filter((item, index) => !checkedList.includes(index))
      );
      setCheckedList(() => []);
      console.log(response);
    } catch (err) {
      console.log(err);
    }
  };
  const numberOfPage = (): number[] => {
    let allPage = Math.ceil(teacherData.length / 10);
    let page: number[] = teacherData
      .filter((item, index) => index < allPage)
      .map((item, index) => index + 1);
    return page;
  };
  const nextPage = (): void => {
    let allPage = Math.ceil(teacherData.length / 10);
    setPageOfData(() => (pageOfData + 1 > allPage ? allPage : pageOfData + 1));
  };
  const previousPage = (): void => {
    setPageOfData(() => (pageOfData - 1 < 1 ? 1 : pageOfData - 1));
  };
  return (
    <>
      {AddModalActive ? (
        <AddModalForm
          closeModal={() => setAddModalActive(false)}
          addData={addData}
        />
      ) : null}
      {deleteModalActive ? (
        <ConfirmDeleteModal
          closeModal={() => setDeleteModalActive(false)}
          deleteData={removeMultiData}
          clearCheckList={() => setCheckedList(() => [])}
          dataAmount={checkedList.length}
        />
      ) : null}
      {editModalActive ? (
        <EditModalForm
          closeModal={() => setEditModalActive(false)}
          conFirmEdit={editMultiData}
          clearCheckList={() => setCheckedList(() => [])}
          data={teacherData.filter((item, index) =>
            checkedList.includes(index)
          )}
        />
      ) : null}
      <div className="w-full flex justify-between h-[60px] py-[10px] pl-[15px]">
        <div className="flex gap-3">
          {/* แสดงจำนวน checkbox ที่เลือก */}
          {checkedList.length === 0 ? null : (
            <>
              <div
                onClick={() => setCheckedList(() => [])}
                className="flex w-fit h-full items-center p-3 gap-1 bg-cyan-100 hover:bg-cyan-200 cursor-pointer duration-300 rounded-lg text-center select-none"
              >
                <BsCheckLg className="fill-cyan-500" />
                <p className="text-cyan-500 text-sm">
                  {checkedList.length === teacherData.length
                    ? `เลือกท้ังหมด (${checkedList.length})`
                    : `เลือก (${checkedList.length})`}
                </p>
              </div>
              <div
                onClick={() => setEditModalActive(true)}
                className="flex w-fit items-center p-3 gap-3 h-full rounded-lg bg-yellow-100 hover:bg-yellow-200 duration-300 cursor-pointer select-none"
              >
                <MdModeEditOutline className="fill-yellow-700" />
                <p className="text-sm text-yellow-700">แก้ไข</p>
              </div>
              <div
                onClick={() => setDeleteModalActive(true)}
                className="flex w-fit items-center p-3 gap-3 h-full rounded-lg bg-red-100 hover:bg-red-200 duration-300 cursor-pointer select-none"
              >
                <BiSolidTrashAlt className="fill-red-500" />
                <p className="text-sm text-red-500">ลบ</p>
              </div>
            </>
          )}
        </div>
        <div className="flex gap-3">
          <SearchBar
            height={"100%"}
            width={"100%"}
            placeHolder="ค้นหาชื่อครู"
          />
          <div className="flex w-fit h-full items-center p-3 bg-green-100 rounded-lg text-center select-none">
            <p className="text-green-500 text-sm">
              ทั้งหมด {teacherData.length} รายการ
            </p>
          </div>
          <PrimaryButton handleClick={() => setAddModalActive(true)} title={"เพิ่มครู"} color="primary" Icon={<AddIcon />} />
        </div>
      </div>
      <table className="table-auto w-full">
        <thead>
          <tr className="h-[60px] bg-[#F1F3F9]">
            <th className="w-20 px-6">
              {/* input ที่ select all item ในตาราง */}
              <input
                className="cursor-pointer"
                type="checkbox"
                name="selectedAll"
                onChange={handleChange}
                //ตรงนี้เช็คว่า array length ของ checkList กับ data ยาวเท่ากันไหม
                //ขยาย...ถ้าเราติ๊กหมดมันก็จะขึ้นเป็น checked
                //ขยาย(2)...แต่ถ้าเรา unchecked ข้อมูลบางชุดในตาราง ไอ้ checkbox ตัวนี้ก็ต้องมีสถานะ checked = false
                checked={
                  checkedList.length === teacherData.length &&
                  teacherData.length !== 0
                }
              />
            </th>
            {tableHead.map((item, index) => (
              <Fragment key={item}>
                <th
                  className="text-left px-6 select-none cursor-pointer"
                  onClick={() => {
                    toggleOrdered(index, item);
                  }}
                >
                  <div className="flex gap-1 items-center">
                    <p className="">{item}</p>
                    {/* ตรงนี้ไม่มีไรมาก แสดงลูกศรแบบ rotate กลับไปกลับมาโดยเช็คจาก orderState */}
                    {orderedIndex == index ? (
                      <IoIosArrowDown
                        className={`fill-cyan-400 duration-500`}
                        style={{
                          transform: `rotate(${
                            orderState ? "0deg" : "180deg"
                          })`,
                        }}
                      />
                    ) : null}
                  </div>
                </th>
              </Fragment>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm">
          {teacherData
            .map((item, index) => (
              <Fragment key={`tr${index}`}>
                <tr
                  className="relative h-[60px] border-b bg-[#FFF] hover:bg-cyan-50 hover:text-cyan-600 even:bg-slate-50 cursor-pointer"
                  key={`Data${index}`}
                >
                  <th>
                    <input
                      className="cursor-pointer"
                      type="checkbox"
                      name="itemdata"
                      onChange={() => ClickToSelect(index)}
                      //ตรงนี้เช็คว่า ค่า index ของแต่ละแถวอยู่ในการติ๊กหรือไม่
                      checked={checkedList.includes(index)}
                    />
                  </th>
                  {/* ส่ง JSX.Element ผ่าน props แล้วค่อยส่ง data จากตรงนี้เพื่อเรียกอีกทีนึง */}
                  <TableData
                    data={item}
                    handleChange={ClickToSelect}
                    editData={() => setEditModalActive(true)}
                    deleteData={() => setDeleteModalActive(true)}
                    checkList={checkedList}
                    index={index}
                    key={item}
                  />
                </tr>
              </Fragment>
            ))
            .filter(
              (item, index) =>
                index >= (pageOfData == 1 ? 0 : pageOfData * 10 - 10) &&
                index <= pageOfData * 10 - 1
            )}
          {/* Filter บรรทัดบนคือแบ่งหน้าของข้อมูลที่ Fetch มาทั้งหมดเป็น หน้าละ 10
          index >= (pageOfData == 1 ? 0 : pageOfData * 10 - 10) คือ ถ้า pageOfData เท่ากับ 1 ให้ return 0
          เพราะหน้าแรกต้องเอา index ที่ 0 มาใช้ ส่วน pageOfData * 10 - 10 คือหน้าต่อๆไปต้องใช้ index เลข 2 หลักแต่ถ้า * 10 เฉยๆจะเท่ากับ index สุดท่ายของข้อมูล
          เลยต้อง - 10
          index <= (pageOfData * 10 - 1) คือ เอา index สุดท้ายมาลบ 1 เพราะ array มันเริ่มที่ 0
           */}
        </tbody>
      </table>
      <div className="flex w-full gap-3 h-fit items-center justify-end mt-3">
        <MiniButton handleClick={previousPage} title={"Prev"} border={true} />
        {numberOfPage().map((page) => (
          <Fragment key={`page${page}`}>
            {pageOfData == page ? (
              <MiniButton
                title={page.toString()}
                width={30}
                buttonColor="#222"
                titleColor="#FFF"
              />
            ) : (
              <MiniButton
                handleClick={() => setPageOfData(() => page)}
                width={30}
                title={page.toString()}
              />
            )}
          </Fragment>
        ))}
        <MiniButton title={"Next"} handleClick={nextPage} border={true} />
      </div>
    </>
  );
}

export default Table;
