'use client';

import { EllipsisVertical, CirclePlus, Share } from "lucide-react";
import { toast } from "sonner"
import { redirect } from "next/navigation";

import { camelize } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const colors = {
    draft: "bg-amber-500",
    published: "bg-green-500",
    archived: "bg-gray-500",
};

const Forms = ({ forms }: { forms: Form[] }) => {
    return (
        <div className="flex flex-col gap-3 w-full">
            {forms.length > 0 && (
                <div className="flex gap-3 px-6 flex-col justify-center w-full">
                    <div className="flex justify-between items-center w-full">
                        <span className="font-semibold">Title</span>
                        <span className="font-semibold">Description</span>
                        <span className="font-semibold">Status</span>
                        <span className="font-semibold">Responses</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger className="w-[20px] h-[20px]"></DropdownMenuTrigger>
                            <DropdownMenuContent>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            )}
            {forms.length > 0 ? forms.map((form) => (
                <>
                    <div key={form?.id} onClick={() => redirect(`/forms/edit/${form?.id}`)} className="flex cursor-pointer rounded-sm transition px-6 py-3 justify-between w-full hover:bg-[hsla(0,0%,100%,.1)]">
                        <span>{form.title}</span>
                        <span>{form.description.slice(0, 5)}{form.description.length > 5 ? "..." : ""}</span>
                        <div className="flex items-center justify-center gap-2">
                            <div className={`w-5 h-5 rounded-full ${colors[form?.status as string]}`} />
                            <span>{camelize(form.status as string)}</span>
                        </div>
                        <span>{form.responses.length}</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger className="cursor-pointer"><EllipsisVertical /></DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(window.location.href + `/${form?.id}`)
                                    toast.success("Copied to clipboard");
                                }}><Share /> Share</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                </>
            )) : <div className="flex justify-center items-center w-full text-center text-sm text-gray-500 font-bold">No Forms found</div>}
        </div>
    )
};

export default Forms;