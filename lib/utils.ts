import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/lib/supabaseClient";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function isAdmin(userId: string): Promise<boolean> {
  const { data: user, error } = await supabase
    .from("User")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !user) {
    return false;
  }

  return user.role === "ADMIN";
}
