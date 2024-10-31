"use client";

import React, { useEffect, useState } from "react";
import { ResponseWithRelations } from "@/types";
import ResponseCard from "./ResponseCard";
import { fetchResponsesByFormId } from "@/lib/data";

function ResponsesList({ formId }: { formId: string }) {
  const [responses, setResponses] = useState<ResponseWithRelations[]>([]);

  useEffect(() => {
    const loadResponses = async () => {
      try {
        const responses = await fetchResponsesByFormId(formId);
        setResponses(responses);
      } catch (error) {
        console.error("Ошибка при загрузке ответов:", error);
      }
    };

    loadResponses();
  }, [formId]);

  return (
    <div className="mt-4 space-y-4">
      {responses.length ? (
        responses.map((response) => (
          <ResponseCard key={response.id} response={response} />
        ))
      ) : (
        <p>Ответы не найдены.</p>
      )}
    </div>
  );
}

export default ResponsesList;
