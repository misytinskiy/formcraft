"use client";

import React from "react";
import { useUserContext } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role } = useUserContext();
  const router = useRouter();

  if (role !== "ADMIN") {
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100">
      <Header />
      <div className="container mx-auto p-8 mt-4 bg-white shadow-md rounded-md w-full max-w-4xl">
        {children}
      </div>
    </div>
  );
}
