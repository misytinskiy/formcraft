// lib/auth.ts
import { supabase } from "./supabaseClient";
import { User } from "../types";

export async function verifyApiToken(apiToken: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("User")
    .select("*")
    .eq("apiToken", apiToken)
    .single();

  if (error) {
    console.error("Ошибка при проверке API-токена:", error);
    return null;
  }

  return data as User;
}
