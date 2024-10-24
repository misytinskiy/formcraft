import { FormWithRelations } from "@/types";
import Link from "next/link";

export default function FormList({ form }: { form: FormWithRelations }) {
  return (
    <div className="border border-gray-300 p-4 rounded-md hover:border-blue-500 hover:bg-blue-50">
      <Link href={`/dashboard/forms/${form.id}`}>
        <h3 className="font-medium text-lg">{form.title}</h3>
        <p className="text-gray-500">Author: {form.author.name}</p>
      </Link>
    </div>
  );
}
