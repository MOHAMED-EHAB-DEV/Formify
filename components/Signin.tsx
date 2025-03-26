"use client";

import Image from "next/image";
import Link from "next/link";

import GoogleBtn from "./GoogleBtn";
import GitHubBtn from "./GitHubBtn";

const Signin = ({ txt } : { txt: string }) => {
  return (
    <div className="box-border w-fit shadow-none">
      <div className="bg-[#060d18] p-5 rounded-xl">
        <div className="flex justify-center items-center flex-col p-5">
          <div className="flex flex-col justify-center items-center">
            <div className="flex flex-col justify-center items-center gap-8">
              <Link href="/">
                <Image
                  src="/assets/icons/icon.svg"
                  alt="Logo"
                  width={72}
                  height={72}
                />
              </Link>
              <div className="flex flex-col justify-center items-center gap-1">
                <h4 className="font-bold text-xl text-white">
                  Sign {txt} to Formify
                </h4>
                <p className="text-base font-normal text-[#ffffffa6]">
                  Welcome back! Please Sign in to continue
                </p>
              </div>
              <div className="flex flex-col justify-center items-center gap-5">
                <GoogleBtn />
                <GitHubBtn />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;
