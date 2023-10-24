import Dropdown from '@/components/elements/input/selected_input/Dropdown';
import React from 'react'

type Props = {
    data:any;
    currentValue:string;
    handleSubjectChange:any;
    searchHandle:any;
}

function SelectSubject(props: Props) {
  return (
    <>
        <div className="flex justify-between w-full items-center">
            <div className="text-sm flex gap-1">
            <p>วิชา</p>
            <p className="text-red-500">*</p>
            </div>
            <Dropdown
            data={props.data}
            renderItem={({ data }): JSX.Element => (
                <li className="w-full text-sm">
                {data.SubjectCode} {data.SubjectName}
                </li>
            )}
            width={300}
            height={40}
            currentValue={props.currentValue}
            placeHolder={"ตัวเลือก"}
            handleChange={props.handleSubjectChange}
            useSearchBar={true}
            searchFunciton={props.searchHandle}
            />
        </div>
    </>
  )
}

export default SelectSubject