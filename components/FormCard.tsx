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
import ConfirmationDialog from "./ConfirmationDialog";
import EditFormModal from "./EditFormModal";

import { X, Edit3 } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

import { FormWithRelations } from "@/types";
import { deleteForm } from "@/lib/actions";

function FormCard({
  form,
  hideActions = false,
}: {
  form: FormWithRelations;
  hideActions?: boolean;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  console.log("Rendering FormCard with data:", form);

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle>{form.title}</CardTitle>
        <CardDescription>Автор: {form.author.name}</CardDescription>
        {!hideActions && isFormOwner && (
          <div className="absolute top-2 right-2 flex space-x-2">
            <button
              onClick={handleDeleteClick}
              className="text-neutral-500 hover:text-neutral-700"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={handleEditClick}
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

      {isDialogOpen && (
        <ConfirmationDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {isEditModalOpen && (
        <EditFormModal form={form} onClose={() => setIsEditModalOpen(false)} />
      )}
    </Card>
  );
}

export default FormCard;
