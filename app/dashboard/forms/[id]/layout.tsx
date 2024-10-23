import FormPageHeader from "@/components/FormPageHeader";
import { fetchFormById } from "@/lib/data";
import { notFound } from "next/navigation";
import { FormWithRelations } from "@/types";

async function FormIdLayout({
  children,
  params: { id },
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const form: FormWithRelations | null = await fetchFormById(id);

  if (!form) {
    notFound();
  }

  return (
    <>
      <FormPageHeader form={form} />
      <div className="bg-violet-100 min-h-screen">{children}</div>
    </>
  );
}

export default FormIdLayout;
