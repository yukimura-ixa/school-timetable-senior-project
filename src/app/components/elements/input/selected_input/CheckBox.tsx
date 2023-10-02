import React from 'react'

interface CheckBox {
    label: string;
    value: string;
    name: string;
    handleClick: Function;
}
function CheckBox({
    label="Checkbox",
    value,
    name,
    handleClick,
}: CheckBox): JSX.Element {
  return (
    <div className='flex justify-center items-center gap-3 flex-row w-fit h-fit'>
      <input type='checkbox' value={value} name={name} onClick={() => handleClick}/>
      <label>{label}</label>
    </div>
  )
}

export default CheckBox
