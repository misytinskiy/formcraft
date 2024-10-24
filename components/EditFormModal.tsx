"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
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
import { X } from "lucide-react";
import { useState } from "react";
import { FormWithRelations, Question, QuestionType } from "@/types";
import { updateForm } from "@/lib/actions";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";

const questionTypeLabels: { [key in QuestionType]: string } = {
  SINGLE_LINE_TEXT: "Single Line Text",
  MULTI_LINE_TEXT: "Multi Line Text",
  POSITIVE_INTEGER: "Positive Integer",
  CHECKBOX: "Checkbox",
  RADIO_BUTTON: "Radio Button",
};

function EditFormModal({
  form,
  onClose,
}: {
  form: FormWithRelations;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    title: form.title,
    description: form.description,
    isPublic: form.isPublic,
    topic: form.topic,
    imageUrl: form.imageUrl,
    questions: form.questions || [],
  });
  const router = useRouter();

  // Обработка изменений в полях формы
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Обработка изменений в вопросах
  const handleQuestionChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const updatedQuestions = [...prevData.questions];
      updatedQuestions[index] = { ...updatedQuestions[index], [name]: value };
      return { ...prevData, questions: updatedQuestions };
    });
  };

  // Изменение типа вопроса
  const handleQuestionTypeChange = (index: number, value: QuestionType) => {
    setFormData((prevData) => {
      const updatedQuestions = [...prevData.questions];
      updatedQuestions[index].type = value;
      return { ...prevData, questions: updatedQuestions };
    });
  };

  // Изменение обязательности вопроса
  const handleQuestionRequiredChange = (index: number, checked: boolean) => {
    setFormData((prevData) => {
      const updatedQuestions = [...prevData.questions];
      updatedQuestions[index].isRequired = checked;
      return { ...prevData, questions: updatedQuestions };
    });
  };

  // Добавление нового вопроса
  const addQuestion = () => {
    const newQuestion: Question = {
      id: uuidv4(), // Генерируем уникальный ID
      formId: form.id, // Подставляем formId, если он есть
      title: "",
      type: "SINGLE_LINE_TEXT" as QuestionType,
      isRequired: false,
      options: [], // Если тип вопроса позволяет опции, они должны быть массивом
      order: formData.questions.length + 1, // Поле order для сортировки вопросов
    };

    // Обновляем состояние формы, добавляя новый вопрос
    setFormData((prevData) => ({
      ...prevData,
      questions: [...prevData.questions, newQuestion], // Добавляем новый вопрос в массив вопросов
    }));
  };

  // Удаление вопроса
  const removeQuestion = (index: number) => {
    setFormData((prevData) => {
      const updatedQuestions = [...prevData.questions];
      updatedQuestions.splice(index, 1); // Удаляем вопрос по индексу
      return { ...prevData, questions: updatedQuestions };
    });
  };

  // Обработка отправки формы
  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();

      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("isPublic", formData.isPublic ? "on" : "off");
      formDataToSend.append("topic", formData.topic || "");
      formDataToSend.append("imageUrl", formData.imageUrl || "");

      formData.questions.forEach((question, index) => {
        formDataToSend.append(`questionIds[]`, question.id); // ID вопросов
        formDataToSend.append(`questions[${index}][title]`, question.title);
        formDataToSend.append(`questions[${index}][type]`, question.type);
        formDataToSend.append(
          `questions[${index}][isRequired]`,
          question.isRequired ? "on" : "off"
        );

        question.options.forEach((option) => {
          formDataToSend.append(`questions[${index}][options][]`, option);
        });
      });

      await updateForm(form.id, formDataToSend);
      router.replace(`/dashboard/forms/${form.id}`);
    } catch (error) {
      console.error("Error updating form:", error);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Form</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Form Title"
            className="w-full p-2 border rounded"
          />
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full p-2 border rounded"
          />

          {/* Редактирование вопросов */}
          {formData.questions.map((question, index) => (
            <div
              key={index}
              className="space-y-2 border-t border-gray-300 pt-4 relative p-4 shadow-lg rounded-lg"
            >
              {/* Кнопка удаления вопроса */}
              <button
                type="button"
                onClick={() => removeQuestion(index)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                <X className="w-5 h-5" />
              </button>

              <Input
                name="title"
                value={question.title}
                onChange={(e) => handleQuestionChange(index, e)}
                placeholder={`Question ${index + 1}`}
                className="w-full p-2 border rounded"
              />

              <Label className="text-sm font-semibold">Question Type</Label>
              <Select
                value={question.type}
                onValueChange={(value) =>
                  handleQuestionTypeChange(index, value as QuestionType)
                }
              >
                <SelectTrigger>
                  <SelectValue className="text-sm">
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

              <div className="flex items-center space-x-2">
                <Switch
                  checked={question.isRequired}
                  onCheckedChange={(checked) =>
                    handleQuestionRequiredChange(index, checked)
                  }
                />
                <Label className="text-sm font-semibold">Required</Label>
              </div>

              {/* Опции для вопросов типа RADIO_BUTTON и CHECKBOX */}
              {["RADIO_BUTTON", "CHECKBOX"].includes(question.type) && (
                <div className="space-y-4">
                  <Label className="text-sm font-semibold">Options</Label>
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center space-x-2">
                      <Input
                        value={option}
                        onChange={(e) =>
                          setFormData((prevData) => {
                            const updatedQuestions = [...prevData.questions];
                            updatedQuestions[index].options[optIndex] =
                              e.target.value;
                            return { ...prevData, questions: updatedQuestions };
                          })
                        }
                        className="w-full p-2 border rounded"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prevData) => {
                            const updatedQuestions = [...prevData.questions];
                            updatedQuestions[index].options = updatedQuestions[
                              index
                            ].options.filter((_, i) => i !== optIndex);
                            return { ...prevData, questions: updatedQuestions };
                          })
                        }
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={() => {
                      // Отладочное сообщение, чтобы убедиться, что код вызывается только один раз
                      console.log("Add Option button clicked");

                      setFormData((prevData) => {
                        // Копируем текущие вопросы
                        const updatedQuestions = [...prevData.questions];

                        // Добавляем одну пустую опцию в вопрос с данным индексом
                        if (updatedQuestions[index]) {
                          updatedQuestions[index] = {
                            ...updatedQuestions[index],
                            options: [...updatedQuestions[index].options, ""],
                          };
                        }

                        // Возвращаем обновленный массив вопросов в состоянии
                        return { ...prevData, questions: updatedQuestions };
                      });
                    }}
                  >
                    Add Option
                  </Button>
                </div>
              )}
            </div>
          ))}

          {/* Кнопка добавления нового вопроса */}
          <Button type="button" onClick={addQuestion}>
            Add New Question
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditFormModal;
