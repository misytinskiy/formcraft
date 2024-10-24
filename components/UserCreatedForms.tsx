"use client";

import React, { useEffect, useState } from "react";

import FormCard from "./FormCard";

import { fetchUserCreatedForms } from "@/lib/data";
import { FormWithRelations } from "@/types";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function UserCreatedForms() {
  const { user } = useUser();
  const [forms, setForms] = useState<FormWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadForms = async () => {
      if (user) {
        try {
          const fetchedForms = await fetchUserCreatedForms(user.id);
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
    return <p>Loading...</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Link
        href="/dashboard/forms/new"
        className="border-dashed border-2 border-gray-300 flex items-center justify-center p-4 rounded-md hover:border-blue-500 hover:bg-blue-50"
      >
        <div className="text-center">
          <Plus className="w-10 h-10 mx-auto text-gray-500" />
          <p className="mt-2 text-gray-500">Create form</p>
        </div>
      </Link>

      {forms.length > 0 ? (
        forms.map((form) => <FormCard key={form.id} form={form} />)
      ) : (
        <p className="text-gray-500">You haven't created any forms yet.</p>
      )}
    </div>
  );
}
