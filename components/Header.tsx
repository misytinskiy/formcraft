import Image from "next/image";
import Link from "next/link";
import logo from "@/public/logo.png";
import { UserButton } from "@clerk/nextjs";
import Search from "./Search";
import { Suspense } from "react";
import { SearchSkeleton } from "./Skeletons";

export default function Header() {
  return (
    <header className="sticky top-0 flex justify-between gap-x-4 px-4 py-2.5 z-50 bg-white max-w-screen-2xl">
      <div className="flex items-center space-x-2">
        <Link href={"/"} className="flex items-center space-x-1">
          <Image src={logo} alt="Logo" className="w-10 h-10" />
          <p className="text-xl text-neutral-500">Forms</p>
        </Link>
      </div>

      <div className="flex items-center md:justify-between md:flex-1 max-w-lg lg:max-w-4xl xl:max-w-5xl">
        <Suspense fallback={<SearchSkeleton />}>
          <Search />
        </Suspense>
        <div className="flex items-center">
          <UserButton />
        </div>
      </div>
    </header>
  );
}
