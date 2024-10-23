import { FormWithRelations } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { cn } from "@/lib/utils";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Link from "next/link";
import { FormInputIcon } from "lucide-react";
import { addFormData } from "@/lib/actions";
import { Checkbox } from "./ui/checkbox";
import { Textarea } from "./ui/textarea";
import SubmitButton from "./SubmitButton";

function MainForm({
  form,
  publicForm = true,
}: {
  form: FormWithRelations;
  publicForm?: boolean;
}) {
  return (
    <main
      className={cn(
        "max-w-3xl mx-auto pb-16 space-y-3.5",
        !publicForm ? "pt-40 sm:pt-32" : "pt-8"
      )}
    >
      <Card>
        <hr className="w-full border-t-8 rounded-t-xl border-violet-800" />
        <CardHeader className="p-0 space-y-0">
          <CardTitle className="text-3xl font-medium px-6 py-5">
            {form.title}
          </CardTitle>
          <CardDescription className="px-6">{form.description}</CardDescription>
        </CardHeader>
      </Card>

      {form.questions.length > 0 ? (
        <form className="space-y-3.5" action={addFormData}>
          <input type="hidden" name="formId" value={form.id} />
          {form.questions.map((question) => (
            <Card key={question.id}>
              <CardContent className="grid w-full max-w-xl pt-6 items-center gap-1.5">
                <Label htmlFor={question.id} className="text-base font-normal">
                  {question.title}
                  {question.isRequired && (
                    <span className="text-destructive">*</span>
                  )}
                </Label>
                {renderQuestionInput(question, publicForm)}
              </CardContent>
            </Card>
          ))}
          {publicForm ? (
            <div className="space-y-2 w-full flex flex-col">
              <div className="flex items-center justify-between">
                {/* Используем клиентский компонент SubmitButton */}
                <SubmitButton />
                <Button
                  type="reset"
                  variant={"ghost"}
                  className="hover:bg-violet-200/50 text-purple-800 hover:text-purple-800"
                >
                  Очистить форму
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <Link
                className="text-purple-600 hover:text-purple-800"
                href={`/dashboard/forms/${form.id}/edit`}
              >
                Чтобы внести изменения в эту форму, перейдите на панель
                управления.
              </Link>
            </div>
          )}
        </form>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Пустая форма</CardTitle>
            <CardDescription>
              В этой форме нет вопросов. Пожалуйста, добавьте вопросы в эту
              форму.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-2">
            <FormInputIcon className="w-12 h-12 text-gray-500" />
            <p className="text-center text-gray-500">
              В этой форме нет доступных вопросов.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button asChild variant="outline">
              <Link href={`/dashboard`}>Вернуться назад</Link>
            </Button>
            <Button variant={"brand"} asChild>
              <Link href={`/dashboard/forms/${form.id}/edit`}>
                Редактировать форму
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}
    </main>
  );
}

function renderQuestionInput(
  question: FormWithRelations["questions"][number],
  publicForm: boolean
) {
  switch (question.type) {
    case "SINGLE_LINE_TEXT":
      return (
        <Input
          className="disabled:opacity-100"
          disabled={!publicForm}
          name={question.id}
          id={question.id}
          type="text"
          placeholder="Ваш ответ"
          required={question.isRequired}
        />
      );
    case "MULTI_LINE_TEXT":
      return (
        <Textarea
          className="disabled:opacity-100"
          disabled={!publicForm}
          name={question.id}
          id={question.id}
          placeholder="Ваш ответ"
          required={question.isRequired}
        />
      );
    case "POSITIVE_INTEGER":
      return (
        <Input
          className="disabled:opacity-100"
          disabled={!publicForm}
          name={question.id}
          id={question.id}
          type="number"
          min="0"
          placeholder="Ваш ответ"
          required={question.isRequired}
        />
      );
    case "RADIO_BUTTON":
      return (
        <RadioGroup
          id={question.id}
          disabled={!publicForm}
          required={question.isRequired}
          name={question.id}
        >
          {question.options.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`${question.id}_${option}`} />
              <Label htmlFor={`${question.id}_${option}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      );
    case "CHECKBOX":
      return (
        <div>
          {question.options.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`${question.id}_${option}`}
                name={question.id}
                value={option}
              />
              <Label htmlFor={`${question.id}_${option}`}>{option}</Label>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

export default MainForm;
