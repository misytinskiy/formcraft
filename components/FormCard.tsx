"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { X, Edit3 } from "lucide-react";
import Link from "next/link";
import { FormWithRelations } from "@/types";
import ConfirmationDialog from "./ConfirmationDialog";
import EditFormModal from "./EditFormModal"; // Импорт модального окна для редактирования
import { deleteForm } from "@/lib/actions";
import { useUser } from "@clerk/nextjs";

function FormCard({ form }: { form: FormWithRelations }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Состояние для окна редактирования
  const { user } = useUser();

  const isFormOwner = user?.id === form.authorId;

  const handleDeleteClick = () => {
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteForm(form.id);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error deleting form:", error);
    }
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle>{form.title}</CardTitle>
        <CardDescription>Author: {form.author.name}</CardDescription>
        {isFormOwner && (
          <div className="absolute top-2 right-2 flex space-x-2">
            <button
              onClick={handleDeleteClick}
              className="text-neutral-500 hover:text-neutral-700"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={handleEditClick} // Добавляем обработчик нажатия для открытия модального окна
              className="text-neutral-500 hover:text-neutral-700"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Button variant={"outline"} asChild>
          <Link href={`/dashboard/forms/${form.id}`}>More</Link>
        </Button>
      </CardContent>

      {/* Диалог подтверждения удаления */}
      {isDialogOpen && (
        <ConfirmationDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* Модальное окно редактирования формы */}
      {isEditModalOpen && (
        <EditFormModal
          form={form}
          onClose={() => setIsEditModalOpen(false)} // Закрыть окно после редактирования
        />
      )}
    </Card>
  );
}

export default FormCard;
