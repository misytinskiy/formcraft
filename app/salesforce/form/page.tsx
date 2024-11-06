// app/salesforce/form/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SalesforceForm() {
  const [userData, setUserData] = useState<any>(null);
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push("/sign-in");
    } else {
      setUserData({
        company: "", // Если у вас есть данные о компании пользователя
        lastName: user.lastName || "",
        email: user.primaryEmailAddress?.emailAddress || "",
      });
    }
  }, [isLoaded, isSignedIn, user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const accountData = {
      Name: (
        e.currentTarget.elements.namedItem("accountName") as HTMLInputElement
      ).value,
    };

    const contactData = {
      LastName: (
        e.currentTarget.elements.namedItem("lastName") as HTMLInputElement
      ).value,
      Email: (e.currentTarget.elements.namedItem("email") as HTMLInputElement)
        .value,
    };

    const response = await fetch("/api/salesforce/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountData, contactData }),
    });

    if (response.ok) {
      alert("Данные успешно отправлены в Salesforce!");
    } else {
      alert("Ошибка при отправке данных в Salesforce.");
    }
  };

  if (!userData) return <p>Загрузка...</p>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>Интеграция с Salesforce</h2>
      <label>
        Название компании (Account Name):
        <input
          type="text"
          name="accountName"
          defaultValue={userData.company}
          required
        />
      </label>
      <br />
      <label>
        Фамилия (Last Name):
        <input
          type="text"
          name="lastName"
          defaultValue={userData.lastName}
          required
        />
      </label>
      <br />
      <label>
        Email:
        <input
          type="email"
          name="email"
          defaultValue={userData.email}
          required
        />
      </label>
      <br />
      <button type="submit">Отправить в Salesforce</button>
    </form>
  );
}
