// import { useState, Fragment } from "react";
// import TextField from "@/components/elements/input/field/TextField";
// import { AiOutlineClose } from "react-icons/ai";
// import MiniButton from "@/components/elements/static/MiniButton";
// import NumberField from "@/components/elements/input/field/NumberField";
// import { TbTrash } from "react-icons/tb";
// import { BsInfo } from "react-icons/bs";
// import api from "@/libs/axios";

// type AddModalProps<T> = {
//   closeModal: () => void;
//   dataList: T[];
//   addData: (data: T[]) => Promise<void>;
//   handleAddItem: () => void;
//   removeItem: (index: number) => void;
// };
// function AddModal<T>({
//   closeModal,
//   dataList,
//   addData,
//   handleAddItem,
//   removeItem,
// }: AddModalProps<T>) {
//   const [isEmptyData, setIsEmptyData] = useState(false);
//   const [data, setData] = useState<T[]>(dataList);

//   const handleAddData = async () => {
//     try {
//       const response = await addData(data);
//       console.log(response);
//       if (response.status === 200) {
//         closeModal();
//       }
//     } catch (error) {
//       console.error("Error adding data:", error.message);
//       // Handle error, display a notification, etc.
//     }
//   };

//   const isValidData = (): boolean => {
//     let isValid = true;
//     data.forEach((item) => {
//       if (Object.values(item).some((value) => value === "")) {
//         setIsEmptyData(true);
//         isValid = false;
//       }
//     });
//     return isValid;
//   };

//   const handleSubmit = () => {
//     if (isValidData()) {
//       handleAddData();
//       closeModal();
//     }
//   };
//   return (
//     <>
//       <div
//         style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
//         className="z-40 flex w-full h-screen items-center justify-center fixed left-0 top-0"
//       >
//         <div
//           className={`relative flex flex-col w-fit ${
//             rooms.length > 5 ? "h-[700px]" : "h-auto"
//           } overflow-y-scroll overflow-x-hidden p-12 gap-10 bg-white rounded`}
//         >
//           {/* Content */}
//           <div className="flex w-full h-auto justify-between items-center">
//             <p className="text-lg select-none">เพิ่มห้องเรียน</p>
//             <AiOutlineClose className="cursor-pointer" onClick={closeModal} />
//           </div>
//           <div className="flex justify-between items-center">
//             <MiniButton
//               title="เพิ่มรายการ"
//               titleColor="#000000"
//               buttonColor="#FFFFFF"
//               border={true}
//               hoverable={true}
//               borderColor="#222222"
//               handleClick={addList}
//             />
//           </div>
//           {/* inputfield */}
//           <div className="flex flex-col-reverse gap-3">
//             {data.map((room, index) => (
//               <Fragment key={`AddData${index + 1}`}>
//                 <div
//                   className={`flex flex-row gap-3 items-center ${
//                     index == data.length - 1 ? "" : "mt-8"
//                   }`}
//                 >
//                   <div className="flex flex-col items-center justify-center mr-5">
//                     <p className="text-sm font-bold">รายการที่</p>
//                     <p>{index + 1}</p>
//                   </div>
//                   <div className="relative flex flex-col gap-2">
//                     <TextField
//                       width="auto"
//                       height="auto"
//                       label={`ชื่อห้อง (RoomName):`}
//                       placeHolder="ex. คอม1"
//                       value={room.RoomName}
//                       borderColor={
//                         isEmptyData && room.RoomName.length == 0
//                           ? "#F96161"
//                           : ""
//                       }
//                       handleChange={(e: any) => {
//                         let value: string = e.target.value;
//                         setRooms(() =>
//                           rooms.map((item, ind) =>
//                             index === ind ? { ...item, RoomName: value } : item
//                           )
//                         );
//                       }}
//                     />
//                     {isEmptyData && room.RoomName.length == 0 ? (
//                       <div className="absolute left-0 bottom-[-35px] flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
//                         <BsInfo className="bg-red-500 rounded-full fill-white" />
//                         <p className="text-red-500 text-sm">ต้องการ</p>
//                       </div>
//                     ) : null}
//                   </div>
//                   <div className="relative flex flex-col gap-2">
//                     <TextField
//                       width="auto"
//                       height="auto"
//                       placeHolder="ex. 3"
//                       label={`อาคาร (Building):`}
//                       value={room.Building}
//                       borderColor={
//                         isEmptyData && room.Building.length == 0
//                           ? "#F96161"
//                           : ""
//                       }
//                       handleChange={(e: any) => {
//                         let value: string = e.target.value;
//                         setRooms(() =>
//                           rooms.map((item, ind) =>
//                             index === ind ? { ...item, Building: value } : item
//                           )
//                         );
//                       }}
//                     />
//                     {isEmptyData && room.Building.length == 0 ? (
//                       <div className="absolute left-0 bottom-[-35px] flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
//                         <BsInfo className="bg-red-500 rounded-full fill-white" />
//                         <p className="text-red-500 text-sm">ต้องการ</p>
//                       </div>
//                     ) : null}
//                   </div>
//                   <div className="relative flex flex-col gap-2">
//                     <NumberField
//                       width="auto"
//                       height="auto"
//                       label={`ชั้น (Floor):`}
//                       placeHolder="ex. 5"
//                       value={room.Floor}
//                       borderColor={
//                         isEmptyData && (room.Floor == 0 || room.Floor == null)
//                           ? "#F96161"
//                           : ""
//                       }
//                       handleChange={(e: any) => {
//                         let value: number = e.target.value;
//                         setRooms(() =>
//                           rooms.map((item, ind) =>
//                             index === ind ? { ...item, Floor: value } : item
//                           )
//                         );
//                       }}
//                     />
//                     {isEmptyData && (room.Floor == 0 || room.Floor == null) ? (
//                       <div className="absolute left-0 bottom-[-35px] flex gap-2 px-2 py-1 w-fit items-center bg-red-100 rounded">
//                         <BsInfo className="bg-red-500 rounded-full fill-white" />
//                         <p className="text-red-500 text-sm">ต้องการ</p>
//                       </div>
//                     ) : null}
//                   </div>
//                   {rooms.length > 1 ? (
//                     <TbTrash
//                       size={20}
//                       className="mt-6 text-red-400 cursor-pointer"
//                       onClick={() => removeList(index)}
//                     />
//                   ) : null}
//                 </div>
//               </Fragment>
//             ))}
//           </div>
//           <span className="w-full flex justify-end mt-5 gap-3">
//             <button
//               className=" w-[100px] bg-red-100 hover:bg-red-200 duration-500 text-red-600 py-2 px-4 rounded"
//               onClick={() => cancel()}
//             >
//               ยกเลิก
//             </button>
//             <button
//               className=" w-[100px] bg-green-100 hover:bg-green-200 duration-500 text-green-600 py-2 px-4 rounded"
//               onClick={handleSubmit}
//             >
//               ยืนยัน
//             </button>
//           </span>
//         </div>
//       </div>
//     </>
//   );
// }

// export default AddModalForm;
