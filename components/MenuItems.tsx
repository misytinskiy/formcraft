import React from "react";
import { Button } from "./ui/button";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";

import docsIcon from "@/public/icons/docs.png";
import formsIcon from "@/public/icons/forms.png";
import sheetsIcon from "@/public/icons/sheets.png";

const iconMap: Record<string, StaticImageData> = {
  Docs: docsIcon,
  Forms: formsIcon,
  Sheets: sheetsIcon,
};

type MenuItem = {
  id: string;
  title: string;
  pageUrl: string;
};

async function fetchMenuItems(): Promise<MenuItem[]> {
  return [
    { id: "1", title: "Docs", pageUrl: "docs" },
    { id: "2", title: "Forms", pageUrl: "forms" },
    { id: "3", title: "Sheets", pageUrl: "sheets" },
  ];
}

export default async function MenuItems() {
  const menuItems = await fetchMenuItems();

  return (
    <div className="flex flex-col border-y py-2">
      {menuItems.map((page) => (
        <Button
          key={page.id}
          asChild
          variant={"ghost"}
          className="justify-start px-6 w-[95%] gap-x-3 rounded-r-full"
        >
          <Link href={`/dashboard/${page.pageUrl}`}>
            <Image
              src={iconMap[page.title] || docsIcon}
              alt={page.title}
              width={15}
              height={15}
            />
            <p>{page.title}</p>
          </Link>
        </Button>
      ))}
    </div>
  );
}
