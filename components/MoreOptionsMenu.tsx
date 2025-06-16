import { MoreVertical, Share2, Pencil, Trash2, Rss, Archive } from 'lucide-react';
import { redirect } from 'next/navigation';
import { toast } from 'sonner';

import { deleteForm } from '@/lib/actions/forms';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ChangeStatus } from '@/lib/actions/forms';

interface MoreOptionsMenuProps {
    id: string;
    status: string;
}

const MoreOptionsMenu = ({ id, status }: MoreOptionsMenuProps) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-accent rounded-full transition-colors">
                    <MoreVertical className="h-5 w-5" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {status === "published" || status === "draft" ? (
                    <DropdownMenuItem onClick={() => ChangeStatus(id, "archived")}>
                        <Archive className="mr-2 h-4 w-4" />
                        <span>Switch to Archived</span>
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem onClick={() => ChangeStatus(id, "published")}>
                        <Rss className="mr-2 h-4 w-4" />
                        <span>Switch to Published</span>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => redirect(`/forms/edit/${id}`)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Edit Form</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(process.env.NEXT_PUBLIC_APP_URL + `/forms/${id}`)
                    toast.success("Copied to clipboard");
                }}>
                    <Share2 className="mr-2 h-4 w-4" />
                    <span>Share Form</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-500" onClick={async () => {
                    const result = await deleteForm(id);
                    if (result.success) {
                        toast.success("Form deleted successfully");
                        redirect("/forms");
                    } else {
                        toast.error(result.error);
                    }
                }}>
                    <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                    <span>Delete Form</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default MoreOptionsMenu
