// app/dashboard/forms/new/page.tsx

import CreateForm from "@/components/CreateForm";

export default function NewFormPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Создать новую форму</h1>
      <CreateForm />
    </div>
  );
}
