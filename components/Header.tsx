"use client";

import Image from "next/image";
import Link from "next/link";
import { SearchSkeleton } from "./Skeletons";
import Search from "./Search";
import { UserButton } from "@clerk/nextjs";
import { Suspense } from "react";
import { Shield } from "lucide-react";
import logo from "@/public/logo.png";
import { useUserContext } from "@/context/UserContext";
import { User as UserIcon } from "lucide-react";
import { HelpCircle } from "lucide-react";

export default function Header() {
  const { role } = useUserContext();

  return (
    <header className="sticky top-0 flex justify-between gap-x-4 px-4 py-2.5 z-50 bg-white shadow">
      <div className="flex items-center space-x-2">
        <Link href={"/dashboard"} className="flex items-center space-x-1">
          <Image src={logo} alt="Logo" className="w-10 h-10" />
          <p className="text-xl text-neutral-500">FormCraft</p>
        </Link>
      </div>

      <div className="flex items-center md:justify-between md:flex-1 max-w-lg lg:max-w-4xl xl:max-w-5xl">
        <Suspense fallback={<SearchSkeleton />}>
          <Search />
        </Suspense>
        <div className="flex items-center space-x-4">
          {role === "ADMIN" && (
            <Link href="/admin" className="text-blue-600 hover:text-blue-700">
              <Shield className="w-6 h-6" />
            </Link>
          )}

          <Link href="/profile" className="text-gray-600 hover:text-gray-800">
            <UserIcon className="w-6 h-6" />
          </Link>

          <Link href="/support" className="text-gray-600 hover:text-gray-800">
            <HelpCircle className="w-6 h-6" />
          </Link>

          <UserButton />
        </div>
      </div>
    </header>
  );
}
