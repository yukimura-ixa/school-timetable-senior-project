"use client";
import Image from "next/image";
import Button from "./components/elements/Button";
// Svg icon
import adduserIcon from "../../public/svg/adduser.svg";
import TextField from "./components/elements/TextField";
import { useState } from "react";
import Dropdown from "./components/elements/Dropdown";
export default function Home() {
  const [text, setText] = useState("");
  const [selectedName, setSelectedName] = useState();
  interface name{
    fName:string;
    lName:string;
  }
  const name: name[] = [
    {
      fName : "Danny",
      lName : "Lee"
    },
    {
      fName : "Ricardo",
      lName : "Milos"
    },
    {
      fName : "Tim",
      lName : "Carlton"
    },
    {
      fName : "Billy",
      lName : "Harrington"
    }
  ];
  const handleChange = (event: any) => {
    if (typeof event.target.value !== "string") {
      setText(event.target.value);
    }
  };
  const dropDownSelected = (name: name) => {
    setSelectedName(() => `Mr. ${name.fName} ${name.lName}`);
  };
  const renderItem = ({ data }): JSX.Element => (
    <p>{data.fName} {data.lName}</p>
  );
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
      <p>{selectedName} was selected.</p>
        <Dropdown
          width="100%"
          data={name}
          renderItem={renderItem}
          currentValue={selectedName}
          handleChange={dropDownSelected}
        />
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <Button title="Add user" icon={adduserIcon} buttonColor="#2F80ED" />
        <br></br>
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
