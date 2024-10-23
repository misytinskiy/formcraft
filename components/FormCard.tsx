import { Prisma } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import Link from "next/link";

type FormWithRelations = Prisma.FormGetPayload<{
  include: {
    author: true;
    questions: true;
    tags: true;
  };
}>;

function FormCard({ form }: { form: FormWithRelations }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{form.title}</CardTitle>
        <CardDescription>Author: {form.author.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant={"outline"} asChild>
          <Link href={`/dashboard/forms/${form.id}`}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default FormCard;
