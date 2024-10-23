"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { createForm } from "@/lib/actions";
import { QuestionType } from "@/types";

interface Question {
  id: string;
  title: string;
  type: QuestionType;
  isRequired: boolean;
  options: string[];
}

interface FormState {
  title: string;
  description: string;
  isPublic: boolean;
  topic: string;
  imageUrl: string;
  tags: string[];
  questions: Question[];
}

export default function CreateForm() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    isPublic: true,
    topic: "",
    imageUrl: "",
    tags: [],
    questions: [],
  });

  const addQuestion = () => {
    setForm((prevForm) => ({
      ...prevForm,
      questions: [
        ...prevForm.questions,
        {
          id: Date.now().toString(),
          title: "",
          type: "SINGLE_LINE_TEXT" as QuestionType,
          isRequired: false,
          options: [],
        },
      ],
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Добавляем теги в formData
    formData.delete("tags[]");
    form.tags.forEach((tag) => formData.append("tags[]", tag));

    // Вызываем серверное действие для создания формы через Supabase
    await createForm(formData);
    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Название формы</Label>
        <Input
          id="title"
          name="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Описание</Label>
        <Textarea
          id="description"
          name="description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isPublic"
          name="isPublic"
          checked={form.isPublic}
          onCheckedChange={(checked) => setForm({ ...form, isPublic: checked })}
        />
        <Label htmlFor="isPublic">Публичная форма</Label>
      </div>

      <div>
        <Label htmlFor="topic">Тема</Label>
        <Input
          id="topic"
          name="topic"
          value={form.topic}
          onChange={(e) => setForm({ ...form, topic: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="imageUrl">URL изображения</Label>
        <Input
          id="imageUrl"
          name="imageUrl"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="tags">Теги</Label>
        <Input
          id="tags"
          name="tags"
          value={form.tags.join(", ")}
          onChange={(e) =>
            setForm({
              ...form,
              tags: e.target.value.split(",").map((tag) => tag.trim()),
            })
          }
          placeholder="Введите теги, разделенные запятыми"
        />
      </div>

      {/* Отображение вопросов */}
      {form.questions.map((question, index) => (
        <div key={question.id} className="border p-4 rounded-md space-y-2">
          {/* Скрытое поле для questionIds[] */}
          <input type="hidden" name="questionIds[]" value={question.id} />

          <div className="flex justify-between items-center">
            <Label>Вопрос {index + 1}</Label>
            <Button
              type="button"
              variant="destructive"
              onClick={() =>
                setForm((prevForm) => ({
                  ...prevForm,
                  questions: prevForm.questions.filter(
                    (q) => q.id !== question.id
                  ),
                }))
              }
            >
              Удалить вопрос
            </Button>
          </div>

          <div>
            <Label htmlFor={`questionTitle_${question.id}`}>
              Название вопроса
            </Label>
            <Input
              id={`questionTitle_${question.id}`}
              name={`questionTitle_${question.id}`}
              value={question.title}
              onChange={(e) =>
                setForm((prevForm) => ({
                  ...prevForm,
                  questions: prevForm.questions.map((q) =>
                    q.id === question.id ? { ...q, title: e.target.value } : q
                  ),
                }))
              }
              required
            />
          </div>

          <div>
            <Label>Тип вопроса</Label>
            <Select
              name={`questionType_${question.id}`}
              value={question.type}
              onValueChange={(value) =>
                setForm((prevForm) => ({
                  ...prevForm,
                  questions: prevForm.questions.map((q) =>
                    q.id === question.id
                      ? { ...q, type: value as QuestionType }
                      : q
                  ),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип вопроса" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(QuestionType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id={`questionRequired_${question.id}`}
              name={`questionRequired_${question.id}`}
              checked={question.isRequired}
              onCheckedChange={(checked) =>
                setForm((prevForm) => ({
                  ...prevForm,
                  questions: prevForm.questions.map((q) =>
                    q.id === question.id ? { ...q, isRequired: checked } : q
                  ),
                }))
              }
            />
            <Label htmlFor={`questionRequired_${question.id}`}>
              Обязательный вопрос
            </Label>
          </div>

          {["RADIO_BUTTON", "CHECKBOX"].includes(question.type) && (
            <div>
              <Label>Опции</Label>
              {question.options.map((option, optIndex) => (
                <div key={optIndex} className="flex items-center space-x-2">
                  <Input
                    name={`questionOptions_${question.id}[]`}
                    value={option}
                    onChange={(e) =>
                      setForm((prevForm) => ({
                        ...prevForm,
                        questions: prevForm.questions.map((q) =>
                          q.id === question.id
                            ? {
                                ...q,
                                options: q.options.map((opt, i) =>
                                  i === optIndex ? e.target.value : opt
                                ),
                              }
                            : q
                        ),
                      }))
                    }
                    required
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() =>
                      setForm((prevForm) => ({
                        ...prevForm,
                        questions: prevForm.questions.map((q) =>
                          q.id === question.id
                            ? {
                                ...q,
                                options: q.options.filter(
                                  (_, i) => i !== optIndex
                                ),
                              }
                            : q
                        ),
                      }))
                    }
                  >
                    Удалить
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                onClick={() =>
                  setForm((prevForm) => ({
                    ...prevForm,
                    questions: prevForm.questions.map((q) =>
                      q.id === question.id
                        ? { ...q, options: [...q.options, ""] }
                        : q
                    ),
                  }))
                }
              >
                Добавить опцию
              </Button>
            </div>
          )}
        </div>
      ))}

      <Button type="button" onClick={addQuestion}>
        Добавить вопрос
      </Button>
      <Button type="submit">Создать форму</Button>
    </form>
  );
}
