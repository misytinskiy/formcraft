import React from "react";
import { Button, ButtonProps } from "./ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type Props = Partial<ButtonProps> & {
  Icon: LucideIcon;
  className?: string;
};

export default function IconButton({ Icon, className, ...props }: Props) {
  return (
    <Button
      variant={"ghost"}
      size={"icon"}
      className={cn("text-neutral-600", className)}
      asChild
      {...props}
    >
      <Icon className="w-5 h-5" />
    </Button>
  );
}
