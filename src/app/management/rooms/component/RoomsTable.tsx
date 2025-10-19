// "use client";
import React, { useState, useEffect, Fragment } from "react";
import type { room } from "@prisma/client";
//ICON
import { IoIosArrowDown } from "react-icons/io";
import { MdModeEditOutline } from "react-icons/md";
import { BiEdit, BiSolidTrashAlt } from "react-icons/bi";
import { BsCheckLg } from "react-icons/bs";
import { TbTrash } from "react-icons/tb";
import AddIcon from "@mui/icons-material/Add";
//comp
import AddModalForm from "@/app/management/rooms/component/AddModalForm";
import SearchBar from "@/components/elements/input/field/SearchBar";
import ConfirmDeleteModal from "../../rooms/component/ConfirmDeleteModal";
import EditModalForm from "../../rooms/component/EditModalForm";
import MiniButton from "@/components/elements/static/MiniButton";
import { Snackbar, Alert } from "@mui/material";
import PrimaryButton from "@/components/elements/static/PrimaryButton";
import TableRow from "./TableRow";

type RoomsTableProps = {
  tableHead: string[]; //กำหนดเป็น Array ของ property ทั้งหมดเพื่อสร้าง table head
  tableData: room[];
  mutate: Function;
};
function Table({ tableHead, tableData, mutate }: RoomsTableProps): JSX.Element {
  const [pageOfData, setPageOfData] = useState<number>(1);
  const [addModalActive, setAddModalActive] = useState<boolean>(false);
  const [deleteModalActive, setDeleteModalActive] = useState<boolean>(false);
  const [editModalActive, setEditModalActive] = useState<boolean>(false);
  const [isSnackBarOpen, setIsSnackBarOpen] = useState<boolean>(false);
  const [snackBarMsg, setSnackBarMsg] = useState<string>("");
  const [roomData, setRoomData] = useState<room[]>([]);

  useEffect(() => {
    setRoomData(tableData);
  }, [tableData]);

  const [checkedList, setCheckedList] = useState<number[]>([]); //เก็บค่าของ checkbox เป็น index

  const handleChange = (event: any) => {
    //เช็คการเปลี่ยนแปลงที่นี่ พร้อมรับ event
    event.target.checked //เช็คว่าเรากดติ๊กหรือยัง
      ? //ถ้ากดติ๊กแล้ว จะเซ็ทข้อมูล index ของ data ทั้งหมดลงไปใน checkList
        //เช่น จำนวน data มี 5 ชุด จะได้เป็น => [0, 1, 2, 3, 4]
        setCheckedList(() => roomData.map((item, index) => index))
      : //ถ้าติ๊กออก จะล้างค่าทั้งหมดโดยการแปะ empty array ทับลงไป
        setCheckedList(() => []);
  };
  const clickToSelect = (itemID: number) => {
    //เมื่อติ๊ก checkbox ในแต่ละ row เราจะทำการเพิ่ม itemID ลงไปใน checkList
    setCheckedList(() =>
      //ก่อนอื่นเช็คว่า itemID ที่จะเพิ่มลงไปมีใน checkList แล้วหรือยัง
      //ขยาย...เพราะเราต้องติ๊กเข้าติ๊กออก ต้อง toggle ค่า
      checkedList.includes(itemID) //คำสั่ง includes return เป็น boolean
        ? //เมื่อเป็นจริง (มีการติ๊กในแถวนั้นๆมาก่อนแล้ว แล้วกดติ๊กซ้ำ)
          //ทำการวาง array ทับโดยการ filter itemID นั้นออกไป
          checkedList.filter((item) => item != itemID)
        : //เมื่อยังไม่ถูกติ๊กมาก่อน ก็จะเพิ่ม itemID ที่ติ๊กเข้าไป
          [...checkedList, itemID]
    );
  };
  useEffect(() => {
    checkedList.sort();
  }, [checkedList]); //ตรงนี้เป็นการ sort Checklist

  const [orderedIndex, setOrderedIndex] = useState(-1);
  const [sortConfig, setSortConfig] = useState({
    key: "RoomName",
    direction: "desc",
  });

  const requestSort = (key) => {
    if (key == "อาคาร") key = "Building";
    else if (key == "ชั้น") key = "Floor";
    else key = "RoomName";
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };
  const sortData = (key, direction) => {
    if (!tableData) return; // Handle case when data is not yet available

    const sortedData = [...tableData].sort((a, b) => {
      const aValue = a[key].toLowerCase();
      const bValue = b[key].toLowerCase();

      if (direction === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
    // mutate(sortedData, false);
    setRoomData(sortedData);
  };

  useEffect(() => {
    if (orderedIndex != -1) {
      sortData(sortConfig.key, sortConfig.direction);
    }
  }, [sortConfig]);

  const [searchTerm, setSearchTerm] = useState("");
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    // Apply the search filter on top of sorting
    const filteredData = tableData.filter((item) =>
      item.RoomName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    sortData(sortConfig.key, sortConfig.direction); // Sort the filtered data
  }, [searchTerm, sortConfig]);

  const numberOfPage = (): number[] => {
    let allPage = Math.ceil(tableData.length / 10);
    let page: number[] = tableData
      .filter((item, index) => index < allPage)
      .map((item, index) => index + 1);
    return page;
  };
  const nextPage = (): void => {
    let allPage = Math.ceil(tableData.length / 10);
    setPageOfData(() => (pageOfData + 1 > allPage ? allPage : pageOfData + 1));
  };
  const previousPage = (): void => {
    setPageOfData(() => (pageOfData - 1 < 1 ? 1 : pageOfData - 1));
  };
  const snackBarHandle = (commitMsg: string): void => {
    setIsSnackBarOpen(true);
    setSnackBarMsg(
      commitMsg == "ADD"
        ? "เพิ่มข้อมูลสถานที่สำเร็จ!"
        : commitMsg == "EDIT"
          ? "อัปเดตข้อมูลสถานที่สำเร็จ!"
          : "ลบข้อมูลสถานที่สำเร็จ!"
    );
  };
  return (
    <>
      {addModalActive ? (
        <AddModalForm
          closeModal={() => {
            setAddModalActive(false);
          }}
          openSnackBar={snackBarHandle}
          mutate={mutate}
        />
      ) : null}
      {deleteModalActive ? (
        <ConfirmDeleteModal
          closeModal={() => {
            setDeleteModalActive(false);
          }}
          openSnackBar={snackBarHandle}
          deleteData={tableData}
          checkedList={checkedList}
          clearCheckList={() => setCheckedList(() => [])}
          dataAmount={checkedList.length}
          mutate={mutate}
        />
      ) : null}
      {editModalActive ? (
        <EditModalForm
          closeModal={() => {
            setEditModalActive(false);
          }}
          openSnackBar={snackBarHandle}
          clearCheckList={() => setCheckedList(() => [])}
          data={tableData.filter((item, index) => checkedList.includes(item.RoomID))}
          mutate={mutate}
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
                  {checkedList.length === tableData.length
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
            handleChange={handleSearch}
            placeHolder="ค้นหาชื่อสถานที่"
            value={setSearchTerm}
          />
          <div className="flex w-fit h-full items-center p-3 bg-green-100 rounded-lg text-center select-none">
            <p className="text-green-500 text-sm">
              ทั้งหมด {tableData.length} รายการ
            </p>
          </div>
          <PrimaryButton
            handleClick={() => setAddModalActive(true)}
            title={"เพิ่มสถานที่"}
            color="primary"
            Icon={<AddIcon />}
          />
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
                  checkedList.length === tableData.length &&
                  tableData.length !== 0
                }
              />
            </th>
            {tableHead.map((item, index) => (
              <Fragment key={index}>
                <th
                  className="text-left px-6 select-none cursor-pointer"
                  onClick={() => {
                    setOrderedIndex(index);
                    requestSort(item);
                  }}
                >
                  <div className="flex gap-1 items-center">
                    <p className="">{item}</p>
                    {/* ตรงนี้ไม่มีไรมาก แสดงลูกศรแบบ rotate กลับไปกลับมาโดยเช็คจาก orderState */}
                    {orderedIndex === index ? (
                      <IoIosArrowDown
                        className={`fill-cyan-400 duration-500`}
                        style={{
                          transform: `rotate(${
                            sortConfig.direction === "asc" ? "0deg" : "180deg"
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
          {roomData
            .map((item, index) => (
              <Fragment key={item.RoomID}>
                <TableRow
                  item={item}
                  index={index}
                  clickToSelect={clickToSelect}
                  checkedList={checkedList}
                  setEditModalActive={setEditModalActive}
                  setDeleteModalActive={setDeleteModalActive}
                  pageOfData={pageOfData}
                  searchTerm={searchTerm}
                />
              </Fragment>
            ))
            .filter(
              (item, index) =>
                index >= (pageOfData === 1 ? 0 : pageOfData * 10 - 10) &&
                index <= pageOfData * 10 - 1
            )}
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
      <Snackbar
        open={isSnackBarOpen}
        autoHideDuration={6000}
        onClose={() => setIsSnackBarOpen(false)}
      >
        <Alert
          onClose={() => setIsSnackBarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackBarMsg}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Table;
