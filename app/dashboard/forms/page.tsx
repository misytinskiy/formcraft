import Header from "@/components/Header";
import UserCreatedForms from "@/components/UserCreatedForms";
import FilledForms from "@/components/FilledForms";
import React from "react";

export default function FormsPage() {
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto space-y-8 pt-20">
        <section>
          <h2 className="text-xl font-semibold mb-2">Created forms</h2>
          <UserCreatedForms />
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">Forms you filled out</h2>
          <FilledForms />
        </section>
      </main>
    </>
  );
}
