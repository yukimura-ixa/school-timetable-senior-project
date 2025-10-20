"use client";
import PrimaryButton from "@/components/mui/PrimaryButton";
import React, { useEffect, useState } from "react";
import { BiKey, BiUser } from "react-icons/bi";
import LoginIcon from "@mui/icons-material/Login";
import { signIn, signOut, useSession } from "next-auth/react";
function SignInPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [bypassEnabled, setBypassEnabled] = useState(false);

  // Check if dev bypass is enabled via server-side API
  // This prevents the flag from being embedded in the client bundle
  useEffect(() => {
    fetch("/api/auth/dev-bypass-enabled")
      .then((res) => res.json())
      .then((data) => setBypassEnabled(data.enabled))
      .catch(() => setBypassEnabled(false));
  }, []);

  function validateEmail() {
    if (email === "") {
      setEmailError("กรุณากรอกอีเมล");
    } else if (!email.includes("@")) {
      setEmailError("อีเมลไม่ถูกต้อง");
    } else {
      setEmailError("");
    }
  }

  function validatePassword() {
    if (password === "") {
      setPasswordError("กรุณากรอกรหัสผ่าน");
    } else {
      setPasswordError("");
    }
  }

  const session = useSession();

  function handleGoogleLogin() {
    signIn("google", { callbackUrl: "/dashboard/select-semester" });
    console.log("google login");
  }

  function handleDevBypass() {
    signIn("dev-bypass", { callbackUrl: "/dashboard/select-semester" });
    console.log("dev bypass login");
  }

  function handleSignout() {
    console.log("signout");
    signOut();
  }

  function handleEmailPassSignIn() {
    validateEmail();
    validatePassword();
    if (emailError === "" && passwordError === "") {
      signIn("credentials", {
        email: email,
        password: password,
        callbackUrl: "/management/teacher",
      });
    }

    console.log("email pass signin");
  }
  return (
    <>
      <div className="w-full flex justify-between">
        <div className="flex flex-col w-1/2 h-screen bg-gray-300 justify-center pl-16 gap-2">
          <p className="text-2xl font-bold">School</p>
          <p className="text-2xl font-bold">Timetable</p>
          <p className="text-2xl font-bold">Management System</p>
          <p className="text-lg">
            ระบบจัดตารางเรียนตารางสอนสำหรับโรงเรียน (มัธยม)
          </p>
        </div>
        <div className="w-[960px] h-screen bg-white flex justify-center items-center">
          <div className="flex flex-col gap-5 w-[500px] h-[500px] drop-shadow rounded-md bg-white py-16 px-10">
            <div className="flex flex-col gap-3">
              <h1 className="text-2xl">เข้าสู่ระบบ</h1>
              <p className="text-sm text-gray-400">
                ระบบจัดตารางเรียนตารางสอนสำหรับโรงเรียน
              </p>
            </div>
            <div className="flex flex-col gap-5">
              {/* input username */}
              <div className="flex flex-col gap-3">
                <label className="text-sm text-gray-600">อีเมล</label>
                <span className="relative flex">
                  <BiUser className="absolute left-2 top-1/3" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e: any) => setEmail(() => e.target.value)}
                    className={`w-full h-[40px] border pl-8 pr-2 rounded ${
                      emailError
                        ? "border-red-500 outline-red-500"
                        : "border-gray-200"
                    }`}
                  />
                </span>
                {emailError && (
                  <span className="text-xs text-red-500">{emailError}</span>
                )}
              </div>
              {/* input password */}
              <div className="flex flex-col gap-3">
                <label className="text-sm text-gray-600">รหัสผ่าน</label>
                <span className="relative flex">
                  <BiKey className="absolute left-2 top-1/3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e: any) => setPassword(() => e.target.value)}
                    className={`w-full h-[40px] border pl-8 pr-2 rounded ${
                      passwordError
                        ? "border-red-500 outline-red-500"
                        : "border-gray-200"
                    }`}
                  />
                </span>
                {passwordError && (
                  <span className="text-xs text-red-500">{passwordError}</span>
                )}
              </div>
              <PrimaryButton
                handleClick={handleEmailPassSignIn}
                title={"เข้าสู่ระบบ"}
                color={"primary"}
                Icon={<LoginIcon />}
                reverseIcon={false}
              />

              <PrimaryButton
                handleClick={handleGoogleLogin}
                title={"Google"}
                color={"primary"}
                Icon={<LoginIcon />}
                reverseIcon={false}
              />
              {bypassEnabled && (
                <PrimaryButton
                  handleClick={handleDevBypass}
                  title={"Dev Bypass (Testing)"}
                  color={"secondary"}
                  Icon={<LoginIcon />}
                  reverseIcon={false}
                />
              )}
              <PrimaryButton
                handleClick={handleSignout}
                title={"ออกจากระบบ"}
                color={"primary"}
                Icon={<LoginIcon />}
                reverseIcon={false}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignInPage;
