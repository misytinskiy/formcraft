import React from "react";
import SearchInput from "./SearchInput";
import SearchMobile from "./SearchMobile";
import { fetchAllForms } from "@/lib/data";

export default async function Search() {
  const forms = await fetchAllForms();

  return (
    <>
      <SearchInput forms={forms} />
      <SearchMobile />
    </>
  );
}
