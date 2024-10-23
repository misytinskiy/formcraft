// components/FormList.tsx

import { fetchAllForms } from "@/lib/data";
import FormCard from "./FormCard";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function FormList() {
  const forms = await fetchAllForms();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Блок "Создать форму" */}
      <Link
        href="/dashboard/forms/new"
        className="border-dashed border-2 border-gray-300 flex items-center justify-center p-4 rounded-md hover:border-blue-500 hover:bg-blue-50"
      >
        <div className="text-center">
          <Plus className="w-10 h-10 mx-auto text-gray-500" />
          <p className="mt-2 text-gray-500">Создать форму</p>
        </div>
      </Link>

      {/* Отображение существующих форм */}
      {forms.map((form) => (
        <FormCard key={form.id} form={form} />
      ))}
    </div>
  );
}
