import Image from "next/image";
import { signIn } from "next-auth/react";

import { Button } from "./ui/button";

const GitHubBtn = () => {
  const handleClick = async (redirectUrl: string) => {
    await signIn('github', { callbackUrl: redirectUrl });
  };
  
  return (
    <Button
      style={{
        boxShadow:
          "rgba(255, 255, 255, 0.07) 0px 0px 0px 1px, rgba(0, 0, 0, 0.08) 0px 2px 3px -1px, rgba(0, 0, 0, 0.02) 0px 1px 0px 0px",
      }}
      className="h-10 w-fit sm:w-[320px] text-base bg-[#3371ff] hover:border-[#3371ff] border-2 hover:bg-transparent font-semibold text-white pt-[0.375rem] pr-3 pb-[0.375rem] pl-3 flex justify-center items-center gap-4 outline-none cursor-pointer rounded-[0.375rem]"
      onClick={() => handleClick("/dashboard")}
    >
      <Image
        src="/assets/icons/github.svg"
        alt="GitHub Icon"
        width={20}
        height={20}
        className="w-4 h-auto"
      />{" "}
      Continue with GitHub
    </Button>
  );
};

export default GitHubBtn;