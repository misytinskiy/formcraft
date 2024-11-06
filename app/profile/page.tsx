"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import Header from "@/components/Header";

export default function ProfilePage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [apiToken, setApiToken] = useState<string | null>(null);

  if (!isLoaded) return <p>Загрузка...</p>;

  if (!isSignedIn) {
    router.push("/sign-in");
    return null;
  }

  const handleSalesforceIntegration = () => {
    router.push("/api/oauth/authorize");
  };

  const generateApiToken = async () => {
    const response = await fetch("/api/generate-api-token", {
      method: "POST",
    });
    const data = await response.json();
    setApiToken(data.apiToken);
  };

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-semibold mb-4">Профиль пользователя</h1>
        <div className="bg-white shadow rounded p-6">
          <p className="text-lg mb-2">
            <span className="font-medium">Имя:</span> {user.fullName}
          </p>
          <p className="text-lg mb-4">
            <span className="font-medium">Email:</span>{" "}
            {user.primaryEmailAddress?.emailAddress}
          </p>
          <div className="space-x-4">
            <button
              onClick={handleSalesforceIntegration}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Интегрировать с Salesforce
            </button>
            <button
              onClick={generateApiToken}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Сгенерировать API-токен
            </button>
          </div>
          {apiToken && (
            <div className="mt-4">
              <p className="font-medium">Ваш API-токен:</p>
              <p className="bg-gray-100 p-2 rounded">{apiToken}</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
