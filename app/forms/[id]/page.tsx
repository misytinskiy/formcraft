import MainForm from "@/components/MainForm";

import { fetchFormById } from "@/lib/data";

import { notFound } from "next/navigation";

async function PublicFormIdPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const form = await fetchFormById(id);

  if (!form?.id) {
    notFound();
  }

  return <MainForm form={form} publicForm />;
}

export default PublicFormIdPage;
