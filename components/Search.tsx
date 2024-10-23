import React from "react";
import SearchInput from "./SearchInput";
import { prisma } from "@/lib/prisma";
import SearchMobile from "./SearchMobile";
import { FormWithRelations } from "@/types";

export default async function Search() {
  const forms: FormWithRelations[] = await prisma.form.findMany({
    include: {
      author: true,
      questions: true,
      tags: true,
      responses: true,
    },
  });

  return (
    <>
      <SearchInput forms={forms} />
      <SearchMobile />
    </>
  );
}
