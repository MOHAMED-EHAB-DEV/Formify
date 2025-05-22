'use client';

import { redirect, usePathname } from "next/navigation";
import Image from 'next/image';
import { useCallback, useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useTheme } from "next-themes";

import Search from "./Search";
import { camelize } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Navbar = ({ user, isFormBuilder = false }: { user: IUser, isFormBuilder: Boolean }) => {
  const [Open, setOpen] = useState(false);
  const { theme } = useTheme();

  const path = usePathname().split("/")[1];

  const handleSignOut = useCallback(() => {
    setOpen(false)
    signOut({ callbackUrl: "/sign-in" });
  }, []);

  return (
    <div className="header">
      {isFormBuilder ? (
        <Image
          src={`/assets/images/logo-${theme}.svg`}
          alt="logo"
          width={152}
          height={152}
        />
      ) : (
        <>
          <h1 className="font-bold text-2xl">{camelize(path)}</h1>
          <Search />
        </>
      )}



      <div className="flex items-center justify-center gap-6">
        <Link href="/forms/Form-Builder" className="flex items-center justify-center">
          <Plus />
        </Link>
        <DropdownMenu open={Open} onOpenChange={(open) => setOpen(open)}>
          <DropdownMenuTrigger>
            <div className="w-13 h-13 cursor-pointer">
              <Image
                src={
                  user.image
                    ? (user.image as string)
                    : "/assets/icons/userProfile.png"
                }
                alt={`${user.name}'s Image`}
                width={150}
                height={150}
                className="w-full h-full rounded-full object-contain"
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[23.5rem]">
            <DropdownMenuLabel className="flex items-center justify-start py-4 px-5 gap-4">
              <Image
                src={
                  user.image
                    ? (user.image as string)
                    : "/assets/icons/userProfile.png"
                }
                alt={user.name}
                width={64}
                height={64}
                className="object-cover rounded-full"
              />
              <div className="flex flex-col items-center justify-start w-full gap-1">
                <span className="text-base font-medium text-white w-full">
                  {user.name}
                </span>
                <span className="text-base font-normal text-white w-full">
                  {user.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="py-4 cursor-pointer text-[#AAAAAB] w-full px-5 inline-flex items-center font-medium text-base gap-4"
              onClick={() => {
                setOpen(false)
                redirect("/settings")
              }}
            >
              <Image
                src="/assets/icons/settings.svg"
                alt="Settings Icon"
                width={24}
                height={24}
              />
              Manage account
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleSignOut}
              className="py-4 cursor-pointer text-[#AAAAAB] w-full px-5 inline-flex items-center font-medium text-base gap-4"
            >
              <Image
                src="/assets/icons/signOut.svg"
                alt="SignOut Icon"
                width={24}
                height={24}
              />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default Navbar;