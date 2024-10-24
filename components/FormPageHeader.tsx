import React, { Suspense } from "react";

import { Button } from "./ui/button";
import SendForm from "./SendForm";
import IconButton from "./IconButton";
import FormPageHeaderBottom from "./FormPageHeaderBottom";
import { FormPageHeaderBottomSkeleton } from "./Skeletons";

import Link from "next/link";
import Image from "next/image";

import { Folder, Star } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

import { FormWithRelations } from "@/types";

import logo from "@/public/logo.png";

function FormPageHeader({ form }: { form: FormWithRelations }) {
  return (
    <header className="flex flex-col items-start sm:items-center gap-y-4 fixed w-full pt-4 px-4 bg-white shadow z-50">
      <div className="flex items-start w-full sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-x-3 gap-y-4">
          <Button asChild variant={"ghost"} size={"icon"}>
            <Link href={"/dashboard"}>
              <Image src={logo} alt="Logo" className="w-10 h-10" />
            </Link>
          </Button>

          <p className="pl-1 sm:pl-4 pr-3">{form.title}</p>

          <IconButton Icon={Folder} className="hidden sm:inline-flex " />
          <IconButton Icon={Star} className="hidden sm:inline-flex" />
        </div>
        <div className="flex items-center sm:gap-x-4 ">
          <SendForm />
          <UserButton />
        </div>
      </div>

      <Suspense fallback={<FormPageHeaderBottomSkeleton />}>
        <FormPageHeaderBottom form={form} />
      </Suspense>
    </header>
  );
}

export default FormPageHeader;
