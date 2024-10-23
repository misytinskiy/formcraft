import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function getCurrentUser() {
  const { userId } = auth();
  if (!userId) {
    return null;
  }

  // Получаем данные пользователя из Clerk
  const user = await clerkClient().users.getUser(userId);

  return user;
}
