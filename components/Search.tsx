"use client";

import React, { useEffect, useState } from "react";
import SearchInput from "./SearchInput";
import SearchMobile from "./SearchMobile";
import { fetchUserCreatedForms, fetchFilledForms } from "@/lib/data";
import { uniqBy } from "lodash";
import { useUser } from "@clerk/nextjs"; // Используем useUser для получения пользователя
import { FormWithRelations } from "@/types"; // Импортируем тип

export default function Search() {
  const { user } = useUser(); // Получаем текущего пользователя
  const [forms, setForms] = useState<FormWithRelations[]>([]); // Явно указываем тип состояния
  const [loading, setLoading] = useState(true); // Состояние для индикатора загрузки

  useEffect(() => {
    const loadForms = async () => {
      if (user) {
        try {
          const userCreatedForms = await fetchUserCreatedForms(user.id);
          const filledForms = await fetchFilledForms(user.id);

          // Объединяем созданные и заполненные формы, убираем дубли
          const combinedForms = uniqBy(
            [...userCreatedForms, ...filledForms],
            "id"
          );
          setForms(combinedForms); // Устанавливаем формы в состояние
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
    return <p>Загрузка...</p>; // Пока формы загружаются
  }

  return (
    <>
      <SearchInput forms={forms} />
      <SearchMobile />
    </>
  );
}
