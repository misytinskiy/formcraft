"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

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
        company: "",
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
      alert("Data successfully sent to Salesforce!");
    } else {
      alert("Error sending data to Salesforce.");
    }
  };

  if (!userData) return <p>Loading...</p>;

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-semibold mb-4">Salesforce Integration</h1>
        <div className="bg-white shadow rounded p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-lg font-medium">Account Name:</label>
              <input
                type="text"
                name="accountName"
                defaultValue={userData.company}
                required
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-lg font-medium">Last Name:</label>
              <input
                type="text"
                name="lastName"
                defaultValue={userData.lastName}
                required
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-lg font-medium">Email:</label>
              <input
                type="email"
                name="email"
                defaultValue={userData.email}
                required
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Send to Salesforce
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
