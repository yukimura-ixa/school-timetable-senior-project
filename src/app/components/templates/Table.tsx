import Image from "next/image";
import React, { useState, useEffect } from "react";

//SVG
import bluepencil from "@/svg/bluepencil.svg";
import bluetrash from "@/svg/bluetrash.svg";
import graytrash from "@/svg/graytrash.svg";
import Button from "../elements/static/Button";
import adduserIcon from "@/svg/adduser.svg";
import SearchBar from "../elements/input/field/SearchBar";
import arrowdownIcon from "@/svg/arrowdown.svg";

interface Table {
  data: any[]; //ชุดข้อมูลที่ส่งมาให้ table ใช้
  tableHead: string[]; //กำหนดเป็น Array ของ property ทั้งหมดเพื่อสร้าง table head
  tableData: Function;
  orderByFunction: Function;
}
function Table({ data, tableHead, tableData: TableData, orderByFunction }: Table): JSX.Element {
  const [isHover, setIsHover] = useState(false); //เช็ค Hover ข้อมูล
  const [hoverPoint, setHoverPoint] = useState(-1); //เก็บค่า Index ที่ Hover
  const [checkedList, setCheckedList] = useState([]); //เก็บค่าของ checkbox
  const handleChange = (event: any) => {    
    //เช็คการเปลี่ยนแปลงที่นี่ พร้อมรับ event
    event.target.checked //เช็คว่าเรากดติ๊กหรือยัง
        ? //ถ้ากดติ๊กแล้ว จะเซ็ทข้อมูล index ของ data ทั้งหมดลงไปใน checkList
        //เช่น จำนวน data มี 5 ชุด จะได้เป็น => [0, 1, 2, 3, 4]
        setCheckedList(() => data.map((item, index) => index))
        : //ถ้าติ๊กออก จะล้างค่าทั้งหมดโดยการแปะ empty array ทับลงไป
        setCheckedList(() => []);
  }
  const ClickToSelect = (index:number) => {
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
  }
  //เราจะใช้การ order by data id ASC เป็นค่าเริ่มต้น ที่เหลือก็แล้วแต่จะโปรด
  const [orderedIndex, setOrderedIndex] = useState(-1); //ตั้ง default ที่ -1
  const [orderState, setOrderState] = useState(true); //true = ASC false = DESC
  const toggleOrdered = (index:number, type:string) => {
    //ถ้ากด order ที่ไม่ใช่อันเดิม ให้เซ็ต index ของอันใหม่ละก็ตั้ง orderState กลับเป็น true
    if (orderedIndex !== index){ 
        setOrderedIndex(index)
        setOrderState(true)
    } else { //ถ้ากด order ช่องเดิมซ้ำๆ
        setOrderState(!orderState) //สั่งให้ toggle boolean
    }
  }
  
  return (
    <>
      <div className="w-full flex justify-between h-[60px] py-[10px] pl-[15px]">
        <div className="flex gap-3">
          {checkedList.length === 0 ? null : (
            <>
              <div className="flex w-fit h-full items-center p-3 bg-red-100 rounded-lg text-center select-none">
                <p className="text-red-500 text-sm">
                  เลือก {checkedList.length} รายการ
                </p>
              </div>
              <div className="flex w-fit items-center p-3 gap-3 h-full border rounded-lg border-gray-500 bg-white cursor-pointer select-none">
                <Image src={graytrash} alt="graytrashicon" />
                <p className="text-sm">ลบ</p>
              </div>
            </>
          )}
        </div>
        <div className="flex gap-3">
            <SearchBar height={'100%'} width={'100%'}/>
          <div className="flex w-fit h-full items-center p-3 bg-green-100 rounded-lg text-center select-none">
            <p className="text-green-500 text-sm">
              ทั้งหมด {data.length} รายการ
            </p>
          </div>
          <Button title="Add user" icon={adduserIcon} buttonColor="#2F80ED" height={'100%'} />
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
                checked={checkedList.length === data.length}
              />
            </th>
            {tableHead.map((item, index) => (
              <th className="text-left px-6 select-none cursor-pointer" key={item} onClick={() => toggleOrdered(index, item)}>
                <div className="flex gap-1">
                    <p className="">{item}</p>
                    {/* ตรงนี้ไม่มีไรมาก แสดงลูกศรแบบ rotate กลับไปกลับมาโดยเช็คจาก orderState */}
                    {orderedIndex == index ? <Image className="duration-300" src={arrowdownIcon} alt="arrowicon" style={{transform : `rotate(${orderState ? '180deg' : '0deg'})`}} /> : null}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-sm">
          {data.map((item, index) => (
            <tr
              className="relative h-[60px] border-b bg-[#FFF] hover:bg-[#EAF2FF] hover:text-[#3B8FEE] cursor-pointer"
              key={item.id}
              //ตรงนี้คือ Hover แล้วจะขึ้นรูปดินสอกับถังขยะ
              onMouseEnter={() => {
                setIsHover(true), setHoverPoint(index);
              }}
              //Hover point -1 ตั้งไว้เป็น default เฉยๆ เพราะคิดว่ามันไม่ตรงกับ index ของข้อมูล
              onMouseLeave={() => {
                setIsHover(false), setHoverPoint(-1);
              }}
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
              <TableData data={item} handleChange={ClickToSelect} index={index} />
              {/* ตรงนี้คือไอคอนดินสอกับถังขยะ สำหรับแก้ไขข้อมูลและลบข้อมูลเฉพาะตัว */}
              {isHover && hoverPoint === index ? (
                <div className="flex justify-between w-fit h-full gap-5 absolute right-5 bg-[#EAF2FF]">
                  <Image src={bluepencil} alt="editicon" />
                  <Image src={bluetrash} alt="deleteicon" />
                </div>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default Table;
