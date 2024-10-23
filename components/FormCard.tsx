import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import Link from "next/link";
import { FormWithRelations } from "@/types";

function FormCard({ form }: { form: FormWithRelations }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{form.title}</CardTitle>
        <CardDescription>Автор: {form.author.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant={"outline"} asChild>
          <Link href={`/dashboard/forms/${form.id}`}>Подробнее</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default FormCard;
