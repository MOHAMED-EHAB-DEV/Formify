'use client';

import { redirect } from "next/navigation";

import { camelize } from "@/lib/utils";

const colors = {
    draft: "bg-amber-500",
    published: "bg-green-500",
    archived: "bg-gray-500",
};

const Forms = ({ forms }: { forms: [Form] }) => {
    return (
        <div className="flex flex-col gap-3 w-full">
            <div className="flex gap-3 px-6 flex-col justify-center w-full">
                <div className="flex justify-between items-center w-full">
                    <span className="font-semibold">Title</span>
                    <span className="font-semibold">Description</span>
                    <span className="font-semibold">Status</span>
                    <span className="font-semibold">Responses</span>
                </div>
            </div>
            {forms.map((form) => (
                <div key={form?._id} onClick={() => redirect(`/forms/${form?._id}`)} className="flex cursor-pointer rounded-sm transition px-6 py-3 justify-between w-full hover:bg-[hsla(0,0%,100%,.1)]">
                    <span>{form.title}</span>
                    <span>{form.description.slice(0, 5)}...</span>
                    <div className="flex items-center justify-center gap-2">
                        <div className={`w-5 h-5 rounded-full ${colors[form.status]}`} />
                        <span>{camelize(form.status as string)}</span>
                    </div>
                    <span>{form.responses.length}</span>
                </div>
            ))}
        </div>
    )
};

export default Forms;