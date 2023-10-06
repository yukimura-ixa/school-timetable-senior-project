import TextField from '@/components/elements/input/field/TextField';
import React, {useState} from 'react'
import { AiOutlineClose } from 'react-icons/ai';

type props = {
    closeModal: any;
    deleteData: any;
    dataAmount: number;
}

const ConfirmDeleteModal = ({ closeModal, deleteData, dataAmount }: props) => {
    const [confirmText, setConfirmText] = useState<string>('');
    const handleChangeConfirmText = (event: any) => {
        setConfirmText(() => event.target.value);
      };
    const confirmed = () => {
        if(confirmText === "ยืนยัน"){
            deleteData();
            closeModal();
        }
    }
    const handleEnterKeyDown = (event:any) => {
      if(event.key === 'Enter') {
        confirmed();
      }
    }
  return (
    <>
      <div
      onKeyDown={handleEnterKeyDown}
        style={{ backgroundColor: "rgba(0,0,0,0.75" }}
        className="z-40 flex w-full h-screen items-center justify-center fixed left-0 top-0"
      >
        <div className="flex flex-col w-[550px] h-auto p-[50px] gap-10 bg-white rounded">
          {/* Content */}
          <div className="flex w-full h-auto justify-between items-center">
            <p className="text-lg select-none">ลบข้อมูล</p>
            <AiOutlineClose className="cursor-pointer" onClick={closeModal} />
          </div>
          {/* inputfield */}
          <div className="flex flex-col gap-3">
            <TextField
              width="auto"
              height="auto"
              placeHolder="ยืนยัน"
              label={`พิมพ์ "ยืนยัน" เพื่อลบข้อมูลที่เลือกทั้งหมด ${dataAmount} รายการ`}
              handleChange={handleChangeConfirmText}
            />
            {confirmText === "ยืนยัน" 
            ?
            <span className="w-full flex justify-end mt-5">
              {/* <Button title="ยืนยัน" width={150} handleClick={handleSubmit} /> */}
              <button className=" w-[150px] bg-yellow-400 hover:bg-yellow-500 duration-500 text-white py-2 px-4 rounded"
              onClick={() => confirmed()}
              >
                ยืนยัน
              </button>
            </span>
            :
            null
            }
          </div>
        </div>
      </div>
    </>
  )
}
export default ConfirmDeleteModal;