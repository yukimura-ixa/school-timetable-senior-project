"use client"
import React, { useState, useEffect } from "react";

//ICON
import { IoIosArrowDown } from 'react-icons/io'
import { MdModeEditOutline } from 'react-icons/md';
import { BiSolidTrashAlt } from 'react-icons/bi';
import { BsCheckLg } from 'react-icons/bs';
//comp
import AddModalForm from "@/app/management/subject/component/AddModalForm";
// import Button from "@/components/elements/static/Button";
import SearchBar from "@/components/elements/input/field/SearchBar";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import EditModalForm from "./EditModalForm";
interface Table {
  data: any[]; //ชุดข้อมูลที่ส่งมาให้ table ใช้
  tableHead: string[]; //กำหนดเป็น Array ของ property ทั้งหมดเพื่อสร้าง table head
  tableData: Function;
  orderByFunction: Function;
}
function Table({
  data,
  tableHead,
  tableData: TableData,
  orderByFunction,
}: Table): JSX.Element {
  const [AddModalActive, setAddModalActive] = useState<boolean>(false);
  const [deleteModalActive, setDeleteModalActive] = useState<boolean>(false);
  const [editModalActive, setEditModalActive] = useState<boolean>(false);
  const [renderData, setRenderData] = useState([]);
  const [checkedList, setCheckedList] = useState<number[]>([]); //เก็บค่าของ checkbox เป็น index
  const handleChange = (event: any) => {
    //เช็คการเปลี่ยนแปลงที่นี่ พร้อมรับ event
    event.target.checked //เช็คว่าเรากดติ๊กหรือยัง
      ? //ถ้ากดติ๊กแล้ว จะเซ็ทข้อมูล index ของ data ทั้งหมดลงไปใน checkList
      //เช่น จำนวน data มี 5 ชุด จะได้เป็น => [0, 1, 2, 3, 4]
      setCheckedList(() => renderData.map((item, index) => index))
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
  }, [checkedList]) //ตรงนี้เป็นการ sort Checklist
  //เราจะใช้การ order by data id ASC เป็นค่าเริ่มต้น ที่เหลือก็แล้วแต่จะโปรด
  const [orderedIndex, setOrderedIndex] = useState(-1); //ตั้ง default ที่ -1
  const [orderType, setOrderType] = useState('');
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
    setRenderData(() => orderByFunction(renderData.length == 0 ? data : renderData, orderState, orderType))
  }, [orderType, orderState])
  //Function ตัวนี้ใช้ลบข้อมูลหนึ่งตัวพร้อมกันหลายตัวจากการติ๊ก checkbox 
  const removeMultiData = () => {
    setRenderData(() => renderData.filter((item, index) => !checkedList.includes(index)));
    setCheckedList(() => []);
  };
  //เพิ่มข้อมูลเข้าไปที่ table data
  const addData = (data:any) => {
    setRenderData(() => [...renderData, data])
  }
  const editMultiData = (data: any) => {
    //copy array มาก่อน
    let dataCopy = [...renderData]
    //loop ข้อมูลเฉพาะตัวที่แก้ไข
    for(let i=0;i<checkedList.length;i++){
      //ลบตัวเก่าและแทนที่ด้วยตัวที่แก้ไขมา
      dataCopy.splice(checkedList[i], 1, data[i])
    }
    //วาง array ทับลงไปใหม่
    setRenderData(() => [...dataCopy]);
    //clear checkbox
    setCheckedList(() => []);
  }
  return (
    <>
      {AddModalActive ? <AddModalForm closeModal={() => setAddModalActive(false)} addData={addData}/> : null}
      {deleteModalActive ? <ConfirmDeleteModal closeModal={() => setDeleteModalActive(false)} deleteData={removeMultiData} dataAmount={checkedList.length}/> : null}
      {editModalActive ? <EditModalForm closeModal={() => setEditModalActive(false)} conFirmEdit={editMultiData} data={renderData.filter((item, index) => checkedList.includes(index))}/> : null}
      <div className="w-full flex justify-between h-[60px] py-[10px] pl-[15px]">
        <div className="flex gap-3">
          {/* แสดงจำนวน checkbox ที่เลือก */}
          {checkedList.length === 0 ? null : (
            <>
              <div className="flex w-fit h-full items-center p-3 gap-1 bg-cyan-100 duration-300 rounded-lg text-center select-none">
                <BsCheckLg className="fill-cyan-500" />
                <p className="text-cyan-500 text-sm">
                  {checkedList.length === renderData.length ? `เลือกท้ังหมด (${checkedList.length})` : `เลือก (${checkedList.length})`}
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
          <SearchBar height={"100%"} width={"100%"} />
          <div className="flex w-fit h-full items-center p-3 bg-green-100 rounded-lg text-center select-none">
            <p className="text-green-500 text-sm">
              ทั้งหมด {renderData.length} รายการ
            </p>
          </div>
          {/* <Button
            title="เพิ่มครู"
            buttonColor="#2F80ED"
            width={100}
            height={"100%"}
            handleClick={() => setModalActive(true)}
          /> */}
          <button className="flex w-fit items-center bg-blue-500 hover:bg-blue-600 duration-500 text-white p-4 rounded text-sm" onClick={() => setAddModalActive(true)}>เพิ่มวิชา</button>
        </div>
      </div>
      {/* <div className="w-full flex-row-reverse flex h-[60px] py-[10px] pl-[15px]">
        <SearchBar height={'100%'} width={'100%'}/>
      </div> */}
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
                  checkedList.length === renderData.length && renderData.length !== 0
                }
              />
            </th>
            {tableHead.map((item, index) => (
              <th
                className="text-left px-6 select-none cursor-pointer"
                key={item}
                onClick={() => { toggleOrdered(index, item) }}
              >
                <div className="flex gap-1 items-center">
                  <p className="">{item}</p>
                  {/* ตรงนี้ไม่มีไรมาก แสดงลูกศรแบบ rotate กลับไปกลับมาโดยเช็คจาก orderState */}
                  {orderedIndex == index ? (
                    <IoIosArrowDown className={`fill-cyan-400 duration-500`}
                    style={{
                      transform: `rotate(${orderState ? "0deg" : "180deg"})`,
                    }}/>
                  ) : null}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm">
          {renderData.map((item, index) => (
            <tr
              className="relative h-[60px] border-b bg-[#FFF] hover:bg-cyan-50 hover:text-cyan-600 even:bg-slate-50 cursor-pointer"
              key={item.id}
            >
              <th>
                <input
                  className="cursor-pointer"
                  type="checkbox"
                  value={item.id}
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
                index={index}
                key={item}
              />
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default Table;
