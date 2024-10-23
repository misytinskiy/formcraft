import { Card, CardFooter, CardHeader, CardTitle } from "./ui/card";
import ResponsesTabs from "./ResponsesTabs";
import { prisma } from "@/lib/prisma";

async function ResponsesHeader({ id }: { id: string }) {
  const responsesCount = await prisma.response.count({
    where: { formId: id },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-normal">
          {responsesCount} {responsesCount === 1 ? "Ответ" : "Ответов"}
        </CardTitle>
      </CardHeader>

      <CardFooter className="p-0 justify-center">
        <ResponsesTabs formId={id} />
      </CardFooter>
    </Card>
  );
}

export default ResponsesHeader;
