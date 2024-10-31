"use client";

import React, { useEffect, useState } from "react";
import { ResponseWithRelations, Question } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

function EditResponseModal({
  response,
  onClose,
}: {
  response: ResponseWithRelations;
  onClose: () => void;
}) {
  const [answers, setAnswers] = useState<{ question: Question; answer: any }[]>(
    []
  );

  useEffect(() => {
    if (response.form && response.form.questions) {
      setAnswers(
        response.form.questions.map((question) => ({
          question,
          answer: response.answers[question.id] ?? "",
        }))
      );
    }
  }, [response]);

  if (!response.form || !response.form.questions) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ошибка</DialogTitle>
          </DialogHeader>
          <p>Форма или вопросы не найдены.</p>
          <Button onClick={onClose}>Закрыть</Button>
        </DialogContent>
      </Dialog>
    );
  }

  const handleChange = (index: number, newValue: any) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index].answer = newValue;
    setAnswers(updatedAnswers);
  };

  const handleSave = async () => {
    try {
      const updatedAnswersObject = answers.reduce((acc, curr) => {
        acc[curr.question.id] = curr.answer;
        return acc;
      }, {} as Record<string, any>);

      const { error } = await supabase
        .from("Response")
        .update({ answers: updatedAnswersObject })
        .eq("id", response.id);

      if (error) {
        console.error("Ошибка при сохранении ответов:", error);
        toast.error("Ошибка при сохранении ответов");
      } else {
        toast.success("Ответы успешно сохранены");
        onClose();
      }
    } catch (error) {
      console.error("Ошибка при сохранении ответов:", error);
      toast.error("Ошибка при сохранении ответов");
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактирование ответов</DialogTitle>
        </DialogHeader>
        {answers.map((item, index) => (
          <div key={item.question.id} className="mb-4">
            <label className="block font-bold mb-1">
              {item.question.title}
            </label>
            {item.question.type === "MULTI_LINE_TEXT" ? (
              <Textarea
                value={item.answer}
                onChange={(e) => handleChange(index, e.target.value)}
              />
            ) : (
              <Input
                value={item.answer}
                onChange={(e) => handleChange(index, e.target.value)}
              />
            )}
          </div>
        ))}
        <Button onClick={handleSave}>Сохранить</Button>
      </DialogContent>
    </Dialog>
  );
}

export default EditResponseModal;
