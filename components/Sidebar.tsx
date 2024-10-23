import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";

import React, { Suspense } from "react";
import IconButton from "./IconButton";
import { Menu } from "lucide-react";
import Link from "next/link";
import Logo from "./Logo";
import MenuItems from "./MenuItems";
import { MenuItemsSkeleton } from "./Skeletons";

export default function Sidebar() {
  return (
    <Sheet>
      <SheetTrigger>
        <IconButton Icon={Menu} />
      </SheetTrigger>

      <SheetContent
        side={"left"}
        className="sm:max-w-xs flex flex-col justify-between px-0"
      >
        <SheetHeader>
          <Logo className="px-5 pb-3 text-lg md:text-xl" />
          <Suspense fallback={<MenuItemsSkeleton />}>
            <MenuItems />
          </Suspense>
        </SheetHeader>
        <SheetFooter className="text-xs flex flex-row space-x-2 items-center justify-center sm:justify-center text-muted-foreground">
          <Link href={"#"}>Privacy Policy</Link>
          <p>⋅</p>
          <Link href={"#"}>Terms of Service</Link>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
