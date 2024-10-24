"use client";

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

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { X } from "lucide-react";

import { QuestionType } from "@/types";

import { createForm } from "@/lib/actions";

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

const questionTypeLabels: { [key in QuestionType]: string } = {
  SINGLE_LINE_TEXT: "Single Line Text",
  MULTI_LINE_TEXT: "Multi Line Text",
  POSITIVE_INTEGER: "Positive Integer",
  CHECKBOX: "Checkbox",
  RADIO_BUTTON: "Radio Button",
};

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
    const newQuestion = {
      id: uuidv4(),
      title: "",
      type: "SINGLE_LINE_TEXT" as QuestionType,
      isRequired: false,
      options: [],
    };

    // Проверка на существование вопроса с таким же ID
    if (form.questions.find((q) => q.id === newQuestion.id)) {
      console.warn("Question with the same ID already exists.");
      return;
    }

    setForm((prevForm) => ({
      ...prevForm,
      questions: [...prevForm.questions, newQuestion],
    }));
  };

  const removeQuestion = (id: string) => {
    setForm((prevForm) => ({
      ...prevForm,
      questions: prevForm.questions.filter((q) => q.id !== id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    formData.delete("tags[]");
    form.tags.forEach((tag) => formData.append("tags[]", tag));

    form.questions.forEach((question) => {
      formData.append("questionIds[]", question.id);
    });

    console.log("Questions added to FormData:", form.questions);

    await createForm(formData);
    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title" className="text-lg ">
          Form Title
        </Label>
        <Input
          id="title"
          name="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          className="text-base"
        />
      </div>

      <div>
        <Label htmlFor="description" className="text-lg ">
          Description
        </Label>
        <Textarea
          id="description"
          name="description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="text-base"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isPublic"
          name="isPublic"
          checked={form.isPublic}
          onCheckedChange={(checked) => setForm({ ...form, isPublic: checked })}
        />
        <Label htmlFor="isPublic" className="text-lg ">
          Public Form
        </Label>
      </div>

      <div>
        <Label htmlFor="topic" className="text-lg ">
          Topic
        </Label>
        <Input
          id="topic"
          name="topic"
          value={form.topic}
          onChange={(e) => setForm({ ...form, topic: e.target.value })}
          className="text-base"
        />
      </div>

      <div>
        <Label htmlFor="imageUrl" className="text-lg ">
          Image URL
        </Label>
        <Input
          id="imageUrl"
          name="imageUrl"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          className="text-base"
        />
      </div>

      <div>
        <Label htmlFor="tags" className="text-lg ">
          Tags
        </Label>
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
          className="text-base"
          placeholder="Enter tags separated by commas"
        />
      </div>

      {/* Отображение вопросов */}
      {form.questions.map((question) => (
        <div
          key={question.id}
          className="relative border border-gray-600 p-4 rounded-md space-y-4"
        >
          <input type="hidden" name="questionIds[]" value={question.id} />
          <button
            type="button"
            className="absolute top-2 right-2 text-gray-600 hover:text-red-600"
            onClick={() => removeQuestion(question.id)}
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <Label
              htmlFor={`questionTitle_${question.id}`}
              className="text-lg "
            >
              Question Title
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
              className="text-base"
            />
          </div>

          <div>
            <Label className="text-lg ">Question Type</Label>
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
                <SelectValue
                  className="text-base"
                  placeholder="Select a question type"
                >
                  {questionTypeLabels[question.type]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(questionTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
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
            <Label
              htmlFor={`questionRequired_${question.id}`}
              className="text-lg "
            >
              Required Question
            </Label>
          </div>

          {/* Опции для RADIO_BUTTON и CHECKBOX */}
          {["RADIO_BUTTON", "CHECKBOX"].includes(question.type) && (
            <div className="space-y-4">
              {question.options.length > 0 && (
                <Label className="text-lg ">Options</Label>
              )}
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
                    className="text-base"
                  />
                  <button
                    type="button"
                    className="text-gray-600 hover:text-red-600"
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
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <Button
                type="button"
                className="mt-2"
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
                Add Option
              </Button>
            </div>
          )}
        </div>
      ))}

      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button type="button" onClick={addQuestion}>
            Add Question
          </Button>
          <Button type="submit">Create Form</Button>
        </div>
      </div>
    </form>
  );
}
