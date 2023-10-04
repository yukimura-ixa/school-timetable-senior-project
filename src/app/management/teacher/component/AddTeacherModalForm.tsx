import Image from 'next/image'
import React, {useState} from 'react'
import closeicon from '@/svg/closeicon.svg';
import TextField from '@/components/elements/input/field/TextField';
import Button from '@/components/elements/static/Button';
import addicon2 from '@/svg/crud/addicon2.svg';
type props = {
    closeModal:any;
    addData: any;
}
function AddTeacherModalForm({closeModal, addData}: props) {
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [department, setDepartment] = useState<string>("");
    const handleChangeFirstName = (event: any) => {
        setFirstName(() => event.target.value)
    }
    const handleChangeLastName = (event: any) => {
        setLastName(() => event.target.value)
    }
    const handleChangeDepartment = (event: any) => {
        setDepartment(() => event.target.value)
    }
    const handleSubmit = () => {
        type teacher = {
            TeacherID: number;
            FirstName: string;
            LastName: string;
            Department: string;
        }
        const teacherData:teacher = {
            TeacherID : 1,
            FirstName: firstName,
            LastName: lastName,
            Department: department
        }
        console.log(teacherData)
        addData(teacherData)
        setFirstName(""), setLastName(""), setDepartment("")
        closeModal()
    }
  return (
    <>
        <div style={{backgroundColor : 'rgba(0,0,0,0.75'}} className='z-40 flex w-full h-screen items-center justify-center fixed left-0 top-0'>
            <div className='flex flex-col w-[550px] h-auto p-[50px] gap-10 bg-white rounded'>
                {/* Content */}
                <div className='flex w-full h-auto justify-between item-center'>
                    <p className='text-lg'>เพิ่มรายชื่อครู</p>
                    <Image className='cursor-pointer' src={closeicon} onClick={closeModal} alt="closeion" />
                </div>
                {/* inputfield */}
                <div className='flex flex-col gap-3'>
                    <TextField
                        width = "auto"
                        height = 'auto'
                        placeHolder = "ex. อเนก"
                        label="ชื่อจริง (FirstName) :"
                        handleChange={handleChangeFirstName}
                    />
                    <TextField
                        width = "auto"
                        height = 'auto'
                        placeHolder = "ex. ประสงค์"
                        label="นามสกุล (LastName) :"
                        handleChange={handleChangeLastName}
                    />
                    <TextField
                        width = "auto"
                        height = 'auto'
                        placeHolder = "ex. ภาษาไทย"
                        label="กลุ่มสาระ (Department) :"
                        handleChange={handleChangeDepartment}
                    />
                    <div className='w-full flex justify-end'>
                        <Button title='เพิ่ม' handleClick={handleSubmit} />
                    </div>
                </div>
            </div>
        </div>
    </>
  )
}

export default AddTeacherModalForm
