"use client";
import Image from "next/image";
import Button from "./components/elements/static/Button";
// Svg icon
import adduserIcon from "@/svg/adduser.svg";
import TextField from "@/app/components/elements/input/field/TextField";
import { useState } from "react";
import Dropdown from "@/app/components/elements/input/selected_input/Dropdown";
import MiniButton from "./components/elements/static/MiniButton";
export default function Home() {
  const [text, setText] = useState("");
  const [selectedName, setSelectedName] = useState();
  interface name {
    fName: string;
    lName: string;
  }
  const name: name[] = [
    {
      fName: "Danny",
      lName: "Lee",
    },
    {
      fName: "Ricardo",
      lName: "Milos",
    },
    {
      fName: "Tim",
      lName: "Carlton",
    },
    {
      fName: "Billy",
      lName: "Harrington",
    },
  ];
  const handleChange = (event: any) => {
    setText(event.target.value);
  };
  const dropDownSelected = (name: name) => {
    setSelectedName(() => `${name.fName} ${name.lName}`);
  };
  const renderItem = ({ data }): JSX.Element => (
    <p>
      {data.fName} {data.lName}
    </p>
  );
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="mb-32 grid text-center gap-10 lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <p>{selectedName} was selected.</p>
        <p>{text} was typed.</p>
        <Dropdown
          // width="100%"
          data={name}
          renderItem={renderItem}
          currentValue={`MR. ${selectedName}`}
          handleChange={dropDownSelected}
        />
        <Button title="Add user" icon={adduserIcon} buttonColor="#2F80ED" />
        <br></br>
        <div className="flex gap-10">
          Minibutton Component :
          <MiniButton
            title="Default"
            buttonColor="#F3CFFF"
            titleColor="#591EA4"
            // isSelected={true}
          />
          <MiniButton
            title="Selected = true"
            buttonColor="#FFFFFF"
            titleColor="#000000"
            border={true}
            borderColor="#EDEEF3"
            isSelected={true}
          />
        </div>
        <TextField
          width={300}
          handleChange={handleChange}
          placeHolder="อเนก"
          label="ชื่อจริง (Firstname) :"
        />
      </div>
    </main>
  );
}
