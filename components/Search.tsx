"use client";

import React, { useEffect, useState } from "react";

import SearchInput from "./SearchInput";
import SearchMobile from "./SearchMobile";

import { FormWithRelations } from "@/types";
import { fetchUserCreatedForms, fetchFilledForms } from "@/lib/data";

import { uniqBy } from "lodash";
import { useUser } from "@clerk/nextjs";

export default function Search() {
  const { user } = useUser();
  const [forms, setForms] = useState<FormWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadForms = async () => {
      if (user) {
        try {
          const userCreatedForms = await fetchUserCreatedForms(user.id);
          const filledForms = await fetchFilledForms(user.id);

          const combinedForms = uniqBy(
            [...userCreatedForms, ...filledForms],
            "id"
          );
          setForms(combinedForms);
        } catch (error) {
          console.error("Ошибка при загрузке форм:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadForms();
  }, [user]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <SearchInput forms={forms} />
      <SearchMobile />
    </>
  );
}
