"use client";

import React, { useEffect, useState } from "react";
import { FormWithResponseCount } from "@/types";
import { Input } from "@/components/ui/input";
import { fetchFormsWithResponses } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import ResponsesList from "@/components/ResponsesList";

export default function ManageResponsesPage() {
  const [forms, setForms] = useState<FormWithResponseCount[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFormIds, setExpandedFormIds] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const loadForms = async () => {
      try {
        const forms = await fetchFormsWithResponses();
        setForms(forms);
      } catch (error) {
        console.error("Ошибка при загрузке форм:", error);
      }
    };

    loadForms();
  }, []);

  const toggleFormExpansion = (formId: string) => {
    setExpandedFormIds((prevIds) =>
      prevIds.includes(formId)
        ? prevIds.filter((id) => id !== formId)
        : [...prevIds, formId]
    );
  };

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
    setForms((prevForms) =>
      [...prevForms].sort((a, b) =>
        sortOrder === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title)
      )
    );
  };

  const filteredForms = forms.filter((form) =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Управление ответами</h2>
      <div className="flex items-center mb-4">
        <Input
          type="text"
          placeholder="Поиск по названию формы"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mr-4"
        />
        <Button variant="outline" onClick={toggleSortOrder}>
          Сортировка {sortOrder === "asc" ? <ChevronDown /> : <ChevronUp />}
        </Button>
      </div>
      <div className="space-y-4">
        {filteredForms.length ? (
          filteredForms.map((form) => (
            <div key={form.id} className="p-4 bg-white shadow rounded">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">{form.title}</h3>
                <Button
                  variant="ghost"
                  onClick={() => toggleFormExpansion(form.id)}
                >
                  {expandedFormIds.includes(form.id) ? (
                    <>
                      Скрыть ответы <ChevronUp />
                    </>
                  ) : (
                    <>
                      Показать ответы ({form.responseCount}) <ChevronDown />
                    </>
                  )}
                </Button>
              </div>
              {expandedFormIds.includes(form.id) && (
                <ResponsesList formId={form.id} />
              )}
            </div>
          ))
        ) : (
          <p>Формы не найдены.</p>
        )}
      </div>
    </div>
  );
}
