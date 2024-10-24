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

import { updateForm } from "@/lib/actions";

import { X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import { FormWithRelations, Question, QuestionType } from "@/types";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

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

  const handleQuestionTypeChange = (index: number, value: QuestionType) => {
    setFormData((prevData) => {
      const updatedQuestions = [...prevData.questions];
      updatedQuestions[index].type = value;
      return { ...prevData, questions: updatedQuestions };
    });
  };

  const handleQuestionRequiredChange = (index: number, checked: boolean) => {
    setFormData((prevData) => {
      const updatedQuestions = [...prevData.questions];
      updatedQuestions[index].isRequired = checked;
      return { ...prevData, questions: updatedQuestions };
    });
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: uuidv4(),
      formId: form.id,
      title: "",
      type: "SINGLE_LINE_TEXT" as QuestionType,
      isRequired: false,
      options: [],
      order: formData.questions.length + 1,
    };

    setFormData((prevData) => ({
      ...prevData,
      questions: [...prevData.questions, newQuestion],
    }));
  };

  const removeQuestion = (index: number) => {
    setFormData((prevData) => {
      const updatedQuestions = [...prevData.questions];
      updatedQuestions.splice(index, 1);
      return { ...prevData, questions: updatedQuestions };
    });
  };

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();

      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("isPublic", formData.isPublic ? "on" : "off");
      formDataToSend.append("topic", formData.topic || "");
      formDataToSend.append("imageUrl", formData.imageUrl || "");

      formData.questions.forEach((question, index) => {
        formDataToSend.append(`questionIds[]`, question.id);
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
        <div className="space-y-8">
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

          {formData.questions.map((question, index) => (
            <div
              key={index}
              className="space-y-4 border-t border-gray-300 pt-4 relative p-6 shadow-md rounded-lg border"
            >
              <button
                type="button"
                onClick={() => removeQuestion(index)}
                className="absolute top-2 right-2 text-gray-700 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
              <Label className="text-sm font-semibold">Question Title</Label>{" "}
              <Input
                name="title"
                value={question.title}
                onChange={(e) => handleQuestionChange(index, e)}
                placeholder={`Question ${index + 1}`}
                className="w-full p-2 border rounded"
              />
              <div className="mt-4">
                <Label className="text-sm font-semibold">Question Type</Label>
              </div>
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
              <div className="flex items-center space-x-4">
                <Switch
                  checked={question.isRequired}
                  onCheckedChange={(checked) =>
                    handleQuestionRequiredChange(index, checked)
                  }
                />
                <Label className="text-sm font-semibold">Required</Label>
              </div>
              {["RADIO_BUTTON", "CHECKBOX"].includes(question.type) && (
                <div className="space-y-4">
                  {question.options.length > 0 && (
                    <Label className="text-sm font-semibold">Options</Label>
                  )}
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center space-x-4">
                      <Input
                        value={option}
                        onChange={(e) =>
                          setFormData((prevData) => {
                            const updatedQuestions = [...prevData.questions];
                            updatedQuestions[index].options[optIndex] =
                              e.target.value;
                            return {
                              ...prevData,
                              questions: updatedQuestions,
                            };
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
                            return {
                              ...prevData,
                              questions: updatedQuestions,
                            };
                          })
                        }
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={() => {
                      setFormData((prevData) => {
                        const updatedQuestions = [...prevData.questions];
                        updatedQuestions[index] = {
                          ...updatedQuestions[index],
                          options: [...updatedQuestions[index].options, ""],
                        };
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
