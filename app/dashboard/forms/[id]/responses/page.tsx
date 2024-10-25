import BarChartComponent from "@/components/BarChartComponent";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { fetchFormById } from "@/lib/data";
import { fetchFormResponses } from "@/lib/data";

async function ResponsesPage({ params: { id } }: { params: { id: string } }) {
  const form = await fetchFormById(id);

  if (!form) {
    return <div>Form not found</div>;
  }

  const responses = await fetchFormResponses(id);

  const questions = form.questions.map((question) => {
    const questionResponses = responses
      .map((response) => {
        const answers = response.answers as Record<string, string | string[]>;
        return answers[question.id];
      })
      .filter((answer) => answer !== undefined);

    const numberOfResponses = questionResponses.length;

    let aggregatedResponses: {
      value: string;
      count: number;
      marker: string;
    }[] = [];

    if (question.type === "RADIO_BUTTON" || question.type === "CHECKBOX") {
      const responseCounts: Record<string, number> = {};

      questionResponses.forEach((answer) => {
        if (Array.isArray(answer)) {
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
          marker: question.id,
        })
      );
    } else {
      aggregatedResponses = questionResponses.map((value) => ({
        value: value.toString(),
        count: 1,
        marker: question.id,
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
              {question.numberOfResponses}
              {question.numberOfResponses === 1 ? "Answer" : "Answers"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {question.numberOfResponses > 0 ? (
              <BarChartComponent responses={question.responses} />
            ) : (
              "There are no answers to this question yet."
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default ResponsesPage;
