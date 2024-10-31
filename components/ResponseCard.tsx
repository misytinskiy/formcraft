"use client";

import React, { useState } from "react";
import { ResponseWithRelations } from "@/types";
import { Button } from "./ui/button";
import EditResponseModal from "./EditResponseModal";

function ResponseCard({ response }: { response: ResponseWithRelations }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  return (
    <div className="p-4 bg-white shadow rounded">
      <h3 className="text-xl font-bold">
        {response.form?.title || "Название формы не доступно"}
      </h3>
      <p>Пользователь: {response.user?.name || "Аноним"}</p>
      <p>Дата: {new Date(response.createdAt).toLocaleString()}</p>
      <Button onClick={handleEditClick} className="mt-2">
        Редактировать ответы
      </Button>

      {isEditModalOpen && response.form && (
        <EditResponseModal
          response={response}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
}

export default ResponseCard;
