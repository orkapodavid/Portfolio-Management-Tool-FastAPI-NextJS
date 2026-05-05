"use client";

import { removeItem } from "@/components/actions/items-action";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface DeleteButtonProps {
  itemId: string;
}

export function DeleteButton({ itemId }: DeleteButtonProps) {
  const router = useRouter();

  const handleDelete = async () => {
    const result = await removeItem(itemId);

    if (result?.success) {
      router.refresh();
    }
  };

  return (
    <DropdownMenuItem
      className="text-red-500 cursor-pointer"
      onClick={handleDelete}
    >
      Delete
    </DropdownMenuItem>
  );
}
