import BarChartComponent from "@/components/BarChartComponent";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchFormById } from "@/lib/data";
import { prisma } from "@/lib/prisma";

async function ResponsesPage({ params: { id } }: { params: { id: string } }) {
  // Получаем форму по ID, включая вопросы
  const form = await fetchFormById(id);

  if (!form) {
    return <div>Форма не найдена</div>;
  }

  // Получаем все ответы на эту форму
  const responses = await prisma.response.findMany({
    where: { formId: id },
  });

  // Обрабатываем каждый вопрос
  const questions = form.questions.map((question) => {
    // Извлекаем ответы на текущий вопрос из всех ответов формы
    const questionResponses = responses
      .map((response) => {
        const answers = response.answers as Record<string, string | string[]>;
        return answers[question.id]; // Используем question.id в качестве ключа
      })
      .filter((answer) => answer !== undefined);

    const numberOfResponses = questionResponses.length;

    let aggregatedResponses: {
      value: string;
      count: number;
      marker: string;
    }[] = [];

    if (question.type === "RADIO_BUTTON" || question.type === "CHECKBOX") {
      // Для вопросов с вариантами ответов считаем количество выборов каждого варианта
      const responseCounts: Record<string, number> = {};

      questionResponses.forEach((answer) => {
        if (Array.isArray(answer)) {
          // Для CHECKBOX, где можно выбрать несколько вариантов
          answer.forEach((option) => {
            responseCounts[option] = (responseCounts[option] || 0) + 1;
          });
        } else {
          responseCounts[answer] = (responseCounts[answer] || 0) + 1;
        }
      });

      aggregatedResponses = Object.entries(responseCounts).map(
        ([value, count]) => ({
          value,
          count,
          marker: question.id, // Добавляем marker, чтобы соответствовать типу IndividualResponse
        })
      );
    } else {
      // Для открытых вопросов можно просто отобразить все ответы или обработать их иначе
      aggregatedResponses = questionResponses.map((value) => ({
        value: value.toString(),
        count: 1,
        marker: question.id, // Добавляем marker
      }));
    }

    return {
      ...question,
      numberOfResponses,
      responses: aggregatedResponses,
    };
  });

  return (
    <div className="space-y-3.5">
      {questions.map((question) => (
        <Card key={question.id}>
          <CardHeader>
            <CardTitle className="font-normal text-base">
              {question.title}
            </CardTitle>
            <CardDescription className="text-xs">
              {question.numberOfResponses}{" "}
              {question.numberOfResponses === 1 ? "Ответ" : "Ответов"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {question.numberOfResponses > 0 ? (
              <BarChartComponent responses={question.responses} />
            ) : (
              "Пока нет ответов на этот вопрос."
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default ResponsesPage;
