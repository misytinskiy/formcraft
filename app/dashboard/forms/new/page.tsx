import Header from "@/components/Header";
import CreateForm from "@/components/CreateForm";

export default function NewFormPage() {
  return (
    <div className="min-h-screen bg-violet-100">
      <Header />
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-5">Create new form</h1>
        <CreateForm />
      </div>
    </div>
  );
}
