"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { fetchFilledForms } from "@/lib/data";
import { FormWithRelations } from "@/types";
import FormCard from "./FormCard";

export default function FilledForms() {
  const { user } = useUser();
  const [forms, setForms] = useState<FormWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadForms = async () => {
      if (user) {
        try {
          const fetchedForms = await fetchFilledForms(user.id);

          setForms(fetchedForms);
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
    return <p>Загрузка...</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {forms.length > 0 ? (
        forms.map((form) => (
          <FormCard
            key={form.id}
            form={form}
            hideActions={user?.id !== form.authorId}
          />
        ))
      ) : (
        <p className="text-gray-500">You haven't filled any forms yet.</p>
      )}
    </div>
  );
}
