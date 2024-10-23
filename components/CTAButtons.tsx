import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CTAButtons({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 min-[400px]:flex-row justify-center",
        className
      )}
    >
      <Button asChild>
        <Link href={"/dashboard"}>Get started</Link>
      </Button>
    </div>
  );
}
