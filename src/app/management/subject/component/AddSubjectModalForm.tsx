import Image from 'next/image'
import React, { useState } from 'react'
import closeicon from '@/svg/closeicon.svg';
import TextField from '@/components/elements/input/field/TextField';
import Button from '@/components/elements/static/Button';
import addicon2 from '@/svg/crud/addicon2.svg';
import NumberField from '@/components/elements/input/field/NumberField';
import Dropdown from '@/components/elements/input/selected_input/Dropdown';
type props = {
    closeModal: any;
    addData: any;
}
function AddSubjectModalForm({ closeModal, addData }: props) {
    const [subjectID, setSubjectID] = useState<string>("");
    const [subjectName, setSubjectName] = useState<string>("");
    const [credit, setCredit] = useState<number>(0);
    const [category, setCategory] = useState<string>("");
    const handleChangeSubjectID = (event: any) => {
        setSubjectID(() => event.target.value)
    }
    const handleChangeSubjectName = (event: any) => {
        setSubjectName(() => event.target.value)
    }
    const handleChangeCredit = (event: any) => {
        setCredit(() => event.target.value)
    }
    const handleChangeCategory = (event: any) => {
        setCategory(() => event.target.value)
    }
    const handleSubmit = () => {
        type subject = {
            SubjectID: string;
            SubjectName: string;
            Credit: number;
            Category: string;
        }
        const subjectData: subject = {
            SubjectID: subjectID,
            SubjectName: subjectName,
            Credit: credit,
            Category: category
        }
        console.log(subjectData)
        addData(subjectData)
        setSubjectID(""), setSubjectName(""), setCredit(0), setCategory("")
        closeModal()
    }
    const dropDownSelected = (cate: string) => {
        setCategory(() => cate);
    };
    return (
        <>
            <div style={{ backgroundColor: 'rgba(0,0,0,0.75' }} className='z-40 flex w-full h-screen items-center justify-center fixed left-0 top-0'>
                <div className='flex flex-col w-[550px] h-auto p-[50px] gap-10 bg-white rounded'>
                    {/* Content */}
                    <div className='flex w-full h-auto justify-between item-center'>
                        <p className='text-lg'>เพิ่มรายชื่อครู</p>
                        <Image className='cursor-pointer' src={closeicon} onClick={closeModal} alt="closeion" />
                    </div>
                    {/* inputfield */}
                    <div className='flex flex-col gap-3'>
                        <TextField
                            width="auto"
                            height='auto'
                            placeHolder="ex. ค32101"
                            label="รหัสวิชา (SubjectID) :"
                            handleChange={handleChangeSubjectID}
                        />
                        <TextField
                            width="auto"
                            height='auto'
                            placeHolder="ex. คณิตศาสตร์พื้นฐาน"
                            label="ชื่อวิชา (SubjectName) :"
                            handleChange={handleChangeSubjectName}
                        />
                        <NumberField
                            width="auto"
                            height='auto'
                            placeHolder="ex. 1.5"
                            label="หน่วยกิต (Credit) :"
                            handleChange={handleChangeCredit}
                        />
                        <div className='flex flex-col w-full gap-3'>
                            <p className='text-sm font-bold'>เลือกกลุ่มสาระ (Category) :</p>
                            <Dropdown
                                data={["คณิตศาสตร์", "วิทยาศาสตร์", "ภาษาไทย", "สุขศึกษาและพลศึกษา"]}
                                renderItem={
                                    ({ data }): JSX.Element => (
                                        <p>
                                            {data}
                                        </p>
                                    )
                                } //ทำการ Map ให้เป็นชื่อที่ขึ้นต้นด้วย Capital letter
                                width='100%'
                                height={45}
                                currentValue={category}
                                placeHolder="กลุ่มสาระ"
                                handleChange={dropDownSelected}
                            />
                        </div>
                        <div className='w-full flex justify-end'>
                            <Button title='เพิ่ม' handleClick={handleSubmit} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AddSubjectModalForm;
