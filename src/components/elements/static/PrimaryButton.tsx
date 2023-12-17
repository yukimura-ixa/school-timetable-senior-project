import React from 'react'
type Props = {
    handleClick: any,
    title: string,
    color: string,
    Icon: JSX.Element
}
function PrimaryButton(props: Props): JSX.Element {
  return (
    <>
      {props.color == "info" ? 
        <button
        className="flex w-fit items-center bg-cyan-100 hover:bg-cyan-200 duration-500 text-cyan-500 p-4 gap-1 rounded text-sm"
        onClick={props.handleClick}
        >
          {props.Icon}
          {props.title}
        </button>
      : props.color == "secondary" ?
        <button
        className="flex w-fit items-center bg-purple-100 hover:bg-purple-200 duration-500 text-purple-500 p-4 gap-1 rounded text-sm"
        onClick={props.handleClick}
        >
          {props.Icon}
          {props.title}
        </button>
      : props.color == "warning" ?
        <button
        className="flex w-fit items-center bg-amber-100 hover:bg-amber-200 duration-500 text-amber-500 p-4 gap-1 rounded text-sm"
        onClick={props.handleClick}
        >
          {props.Icon}
          {props.title}
        </button>
      : props.color == "success" ?
        <button
        className="flex w-fit items-center bg-green-100 hover:bg-green-200 duration-500 text-green-500 p-4 gap-1 rounded text-sm"
        onClick={props.handleClick}
        >
          {props.Icon}
          {props.title}
        </button>
      : props.color == "danger" ?
        <button
        className="flex w-fit items-center bg-red-100 hover:bg-red-200 duration-500 text-red-500 p-4 gap-1 rounded text-sm"
        onClick={props.handleClick}
        >
          {props.Icon}
          {props.title}
        </button>
      : 
        <button
        className="flex w-fit items-center bg-blue-100 hover:bg-blue-200 duration-500 text-blue-500 p-4 gap-1 rounded text-sm"
        onClick={props.handleClick}
        >
          {props.Icon}
          {props.title}
        </button>
      }
    </>
  )
}

export default PrimaryButton;