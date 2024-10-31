// app/admin/forms/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { fetchAllForms } from "@/lib/data";
import FormCard from "@/components/FormCard";
import { FormWithRelations } from "@/types";
import { Input } from "@/components/ui/input";

export default function ManageFormsPage() {
  const [forms, setForms] = useState<FormWithRelations[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadForms = async () => {
      try {
        const fetchedForms = await fetchAllForms();
        setForms(fetchedForms);
      } catch (error) {
        console.error("Ошибка при загрузке форм:", error);
      }
    };
    loadForms();
  }, []);

  const filteredForms = forms.filter((form) =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Управление формами</h2>
      <Input
        type="text"
        placeholder="Поиск по названию формы"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredForms.length ? (
          filteredForms.map((form) => (
            <FormCard key={form.id} form={form} isAdmin />
          ))
        ) : (
          <p>Формы не найдены.</p>
        )}
      </div>
    </div>
  );
}
