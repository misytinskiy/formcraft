"use client";

import { useCommandDialogStore } from "@/store/store";
import IconButton from "./IconButton";
import { SearchIcon } from "lucide-react";

export default function SearchMobile() {
  const { open } = useCommandDialogStore();
  return <IconButton Icon={SearchIcon} onClick={open} className="md:hidden" />;
}
